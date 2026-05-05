import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import cors from 'cors';
import * as admin from 'firebase-admin';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin
let firebaseAdminApp: admin.app.App | null = null;

const getFirebaseAdmin = () => {
  if (!firebaseAdminApp) {
    // Read config to get project ID
    try {
      const configPath = path.resolve(__dirname, 'firebase-applet-config.json');
      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      
      firebaseAdminApp = admin.initializeApp({
        projectId: config.projectId,
      });
      console.log('Firebase Admin initialized with project:', config.projectId);
    } catch (error) {
      console.error('Error initializing Firebase Admin:', error);
      // Fallback or rethrow? Let's try to initialize with env if possible
      if (!admin.apps.length) {
        firebaseAdminApp = admin.initializeApp();
      } else {
        firebaseAdminApp = admin.app();
      }
    }
  }
  return firebaseAdminApp;
};

let stripeClient: Stripe | null = null;

const getStripe = () => {
  if (!stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error('STRIPE_SECRET_KEY is not set in the environment variables.');
    }
    stripeClient = new Stripe(key);
  }
  return stripeClient;
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  
  // Webhook needs raw body for signature verification
  app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
      const stripe = getStripe();
      if (webhookSecret && sig) {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
      } else {
        event = JSON.parse(req.body);
      }
    } catch (err: any) {
      console.error(`Webhook Error: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event?.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const bookingId = session.metadata?.bookingId;

      if (bookingId) {
        console.log(`Payment successful for booking: ${bookingId}`);
        try {
          getFirebaseAdmin();
          const db = admin.firestore();
          await db.collection('bookings').doc(bookingId).update({
            depositPaid: true,
            status: 'confirmed'
          });
          console.log(`Successfully updated booking ${bookingId} to confirmed/paid`);
        } catch (error) {
          console.error('Error updating booking in Firestore:', error);
        }
      }
    }

    res.json({ received: true });
  });

  app.use(express.json());

  // API Routes
  app.get('/api/health', (req, res) => {
    console.log('[Server] Health check');
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  app.get('/api/ping', (req, res) => {
    console.log('[Server] Ping from', req.ip);
    res.json({ 
      message: 'pong', 
      timestamp: new Date().toISOString(),
      server: 'Sora Core Express Server'
    });
  });

  app.get('/api/test', (req, res) => {
    console.log('[Server] Test route reached');
    res.json({ message: 'API is reachable' });
  });

  // WordPress GraphQL Proxy to bypass CORS and handle Basic Auth
  app.post('/api/wordpress-proxy', async (req, res) => {
    // Priority: User's confirmed URL
    let wpUrl = process.env.VITE_WORDPRESS_API_URL || 'https://sorasuchi.ct.ws/graphql';
    
    // Normalize and clean
    wpUrl = wpUrl.trim();
    if (wpUrl.endsWith('.')) wpUrl = wpUrl.slice(0, -1);
    
    // Override if pointing to old/invalid site
    if (wpUrl.includes('massive-paint.localsite.io')) {
      wpUrl = 'https://sorasuchi.ct.ws/graphql';
    }
    
    console.log(`WordPress Proxy: Starting fetch sequence for: ${wpUrl}`);

    const body = req.body || {};
    if (!body.query) {
      console.warn('WordPress Proxy: Received request with no query in body.');
    }

    // Normalize URL
    if (!wpUrl.toLowerCase().includes('graphql') && !wpUrl.includes('wp-json')) {
      wpUrl = wpUrl.endsWith('/') ? `${wpUrl}graphql` : `${wpUrl}/graphql`;
    }

    const authUser = process.env.WP_AUTH_USER;
    const authPass = process.env.WP_AUTH_PASS;
    
    // Base headers
    const getBaseHeaders = (isBot: boolean = false) => ({
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/plain, */*',
      'User-Agent': isBot 
        ? 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)' 
        : 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'X-Requested-With': 'XMLHttpRequest',
      'Accept-Language': 'en-US,en;q=0.9',
    });

    const attempts: { url: string; status: number; method: string; contentType?: string; error?: string }[] = [];

    const tryFetch = async (url: string, silent: boolean = false, useBotUA: boolean = false): Promise<Response | null> => {
      try {
        const headers = getBaseHeaders(useBotUA);
        if (authUser && authPass) {
          headers['Authorization'] = `Basic ${Buffer.from(`${authUser}:${authPass}`).toString('base64')}`;
        }

        if (!silent) console.log(`WordPress Proxy: Connection attempt to ${url} (UA: ${useBotUA ? 'Bot' : 'Browser'})...`);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), silent ? 6000 : 15000); 
        
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            ...headers,
            'Referer': url.includes('graphql') ? url.split('graphql')[0] : url,
            'Origin': new URL(url).origin,
          },
          body: JSON.stringify(body),
          signal: controller.signal,
          redirect: 'follow'
        });
        
        clearTimeout(timeoutId);
        
        const contentType = response.headers.get('content-type') || '';
        const isJson = contentType.includes('application/json');

        if (!response.ok || !isJson) {
          const errorText = await response.text().catch(() => 'No error body');
          const statusPrefix = response.ok ? '200 OK' : `Status ${response.status}`;
          
          // Detect InfinityFree/ByetHost Browser Check
          if (errorText.includes('Checking your browser') || errorText.includes('__test')) {
            const wallMsg = `WordPress Proxy: BLOCKED BY HOST FIREWALL (InfinityFree/Bot Protection). This host requires a cookie that server-side apps cannot provide.`;
            attempts.push({ 
              url, 
              status: response.status, 
              method: 'POST', 
              error: wallMsg 
            });
            if (!silent) console.error(wallMsg);
            
            // Try Bot UA fallback if not already trying
            if (!useBotUA) {
              return await tryFetch(url, silent, true);
            }
          } else {
            attempts.push({ 
              url, 
              status: response.status, 
              method: 'POST', 
              contentType,
              error: `${statusPrefix}. Body starts: ${errorText.substring(0, 150).replace(/\s+/g, ' ')}` 
            });
          }
          
          if (!silent) console.warn(`WordPress Proxy: POST ${url} returned ${statusPrefix} (${contentType})`);
          
          // Fallback to GET if POST failed OR returned non-JSON
          if (!isJson || response.status === 405 || response.status === 404 || response.status === 503 || response.status === 403) {
            try {
              const getUrl = new URL(url);
              if (body.query) getUrl.searchParams.append('query', body.query);
              if (body.variables) getUrl.searchParams.append('variables', JSON.stringify(body.variables));
              
              const getController = new AbortController();
              const getTimeoutId = setTimeout(() => getController.abort(), 10000);
              
              if (!silent) console.log(`WordPress Proxy: Attempting GET fallback for ${url}...`);
              const getRes = await fetch(getUrl.toString(), {
                method: 'GET',
                headers: { 
                  ...getBaseHeaders(useBotUA),
                  'Authorization': headers['Authorization'] || '',
                  'Referer': getUrl.origin + '/',
                },
                signal: getController.signal,
                redirect: 'follow'
              });
              clearTimeout(getTimeoutId);
              
              const getContentType = getRes.headers.get('content-type') || '';
              if (getRes.ok && getContentType.includes('application/json')) {
                attempts.push({ url: getUrl.toString(), status: getRes.status, method: 'GET', contentType: getContentType });
                if (!silent) console.log(`WordPress Proxy: GET fallback Success!`);
                return getRes;
              }
              const getText = await getRes.text().catch(() => 'No body');
              attempts.push({ 
                url: getUrl.toString(), 
                status: getRes.status, 
                method: 'GET', 
                contentType: getContentType,
                error: `Non-JSON response. Body starts: ${getText.substring(0, 150).replace(/\s+/g, ' ')}` 
              });
            } catch (err: any) {
              attempts.push({ url, status: 0, method: 'GET_ERROR', error: err.message });
            }
          }
        } else {
          attempts.push({ url, status: response.status, method: 'POST', contentType });
          if (!silent) console.log(`WordPress Proxy: POST ${url} Success (JSON)!`);
          return response;
        }
        
        return null;
      } catch (e: any) {
        if (!silent) console.error(`WordPress Proxy: Error fetching ${url}:`, e.message);
        attempts.push({ url, status: 0, method: 'ERROR', error: e.message });
        return null;
      }
    };

    // 1. Try primary URL
    let finalResponse = await tryFetch(wpUrl);

    // 2. If failed, try fallbacks
    if (!finalResponse) {
      const isLocalUrl = wpUrl.includes('localhost') || wpUrl.includes('127.0.0.1') || wpUrl.includes('.local') || wpUrl.includes('localsite.io');
      
      if (isLocalUrl) {
        console.warn(`WordPress Proxy: URL ${wpUrl} is unreachable (likely an expired LocalWP Live Link). Falling back to mock data.`);
      } else {
        const urlObj = new URL(wpUrl);
        const baseUrl = `${urlObj.protocol}//${urlObj.host}`;
        const httpBaseUrl = `http://${urlObj.host}`;
        
        const fallbacks = [
          wpUrl.includes('?') ? `${wpUrl}&graphql=1` : `${wpUrl}?graphql=1`,
          wpUrl.replace(/\/graphql\/?$/, '/?graphql'),
          wpUrl.replace(/\/graphql\/?$/, '/index.php?graphql'),
          wpUrl.replace(/\/graphql\/?$/, '/wp-json/wp/v2/posts'), 
          `${baseUrl}/graphql`,
          `${baseUrl}/?graphql`,
          `${baseUrl}/index.php?graphql=1`,
          `${baseUrl}/wp-json/graphql`,
          baseUrl, 
          `${httpBaseUrl}/graphql`,
          `${httpBaseUrl}/?graphql`,
        ].filter(Boolean).filter(u => u !== wpUrl && !attempts.some(a => a.url === u)) as string[];

        console.log(`WordPress Proxy: Trying ${fallbacks.length} fallback URLs:`, fallbacks);

        for (const fallbackUrl of fallbacks) {
          finalResponse = await tryFetch(fallbackUrl, true);
          if (finalResponse) {
            console.log(`WordPress Proxy: Fallback Success at ${fallbackUrl}`);
            break;
          }
        }

        // If still no response, try REST API fallback as a last resort diagnostic and mapping
        if (!finalResponse) {
          console.warn('WordPress Proxy: No GraphQL endpoint found. Trying REST API fallback...');
          const restUrl = `${baseUrl}/wp-json/wp/v2/posts?per_page=20`;
          try {
            const restRes = await fetch(restUrl, { headers: { 'User-Agent': getBaseHeaders()['User-Agent'] } });
            if (restRes.ok && restRes.headers.get('content-type')?.includes('application/json')) {
              const posts = await restRes.json();
              if (Array.isArray(posts)) {
                 console.log(`WordPress Proxy: Successfully fetched ${posts.length} posts via REST API. Mapping to menus.`);
                 return res.json({
                   data: {
                     dishes: {
                       nodes: posts.map(p => ({
                         id: p.id.toString(),
                         title: p.title.rendered,
                         menuItemDetails: {
                           price: '0',
                           description: p.excerpt.rendered.replace(/<[^>]*>?/gm, '').substring(0, 150),
                           category: 'Seasonal Selection'
                         }
                       }))
                     }
                   },
                   _source: 'wordpress-rest',
                   _notice: 'Falling back to WordPress REST API because GraphQL was unreachable.'
                 });
              }
            }
          } catch (e) {
            console.error('WordPress Proxy: REST API fallback failed:', e);
          }
        }
      }
    }

    // Define Mock Data for fallback
    const mockData = {
      data: {
        dishes: {
          nodes: [
            {
              id: 'mock-1',
              title: 'The Imperial Omakase',
              menuItemDetails: {
                price: '210',
                description: 'A 22-course masterpiece that evolves with the tides. Our most exclusive journey.',
                category: 'Omakase'
              }
            },
            {
              id: 'mock-2',
              title: 'Sora Signature Omakase',
              menuItemDetails: {
                price: '165',
                description: '15 courses of seasonal perfection, highlighting the best of Toyosu Market.',
                category: 'Omakase'
              }
            },
            {
              id: 'mock-3',
              title: 'Bluefin Trio Selection',
              menuItemDetails: {
                price: '85',
                description: 'Akami, Chutoro, and Otoro aged for 14 days for optimal umami.',
                category: 'Nigiri'
              }
            },
            {
              id: 'mock-4',
              title: 'A5 Wagyu Ishiyaki',
              menuItemDetails: {
                price: '95',
                description: 'Sizzling Miyazaki A5 Wagyu over volcanic stone with fresh wasabi.',
                category: 'Premium'
              }
            }
          ]
        },
        restaurantSettings: {
          contactInfo: {
            address: '42 Loampit Vale, Lewisham, London SE13 7SN',
            phone: '+44 20 7946 0123',
            currentStatus: 'Open Today 12:00 – 23:00'
          }
        },
        menuItems: {
          nodes: [
            { id: 'm1', label: 'Home', url: '/', path: '/' },
            { id: 'm2', label: 'Menu', url: '/menu', path: '/menu' },
            { id: 'm3', label: 'Blog', url: '/blog', path: '/blog' },
            { id: 'm4', label: 'Premium', url: '/premium', path: '/premium' },
            { id: 'm5', label: 'About', url: '/about', path: '/about' }
          ]
        },
        posts: {
          nodes: [
            {
              id: 'p1',
              title: 'The Art of Omakase: A Journey Through Tradition',
              excerpt: 'Discover the philosophy behind our 22-course omakase experience...',
              date: new Date().toISOString(),
              slug: 'art-of-omakase',
              featuredImage: { node: { sourceUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&q=80&w=1200' } }
            },
            {
              id: 'p2',
              title: 'Sourcing at Toyosu: The Heart of Sora',
              excerpt: 'Learn how our chefs select the finest fish every morning at 4 AM...',
              date: new Date(Date.now() - 86400000 * 2).toISOString(),
              slug: 'toyosu-sourcing',
              featuredImage: { node: { sourceUrl: 'https://images.unsplash.com/photo-1534422298391-e4f8c170db76?auto=format&fit=crop&q=80&w=1200' } }
            }
          ]
        }
      },
      _isMock: true,
      _notice: 'Using premium mock data. WordPress site unreachable or returned invalid response.'
    };

    // If all failed, return mock data as a fallback to keep the app functional
    if (!finalResponse) {
      console.warn('WordPress Proxy: All connection attempts failed. Details:');
      console.table(attempts);
      console.warn('Returning premium mock content as fallback.');
      return res.json(mockData);
    }

    try {
      const contentType = finalResponse.headers.get('content-type');
      if (contentType && !contentType.includes('application/json')) {
        const text = await finalResponse.text();
        console.error(`WordPress Proxy: Received non-JSON response (${contentType}):`, text.substring(0, 200));
        return res.json({ 
          ...mockData, 
          _notice: `WordPress returned ${contentType} instead of JSON. Falling back to mock data.` 
        });
      }

      const data = await finalResponse.json();
      return res.json(data);
    } catch (e: any) {
      console.error('WordPress Proxy: JSON parse error', e.message);
      return res.json({ 
        ...mockData, 
        _notice: `JSON Parse Error: ${e.message}. Falling back to mock data.` 
      });
    }
  });

  // Stripe Checkout Session
  app.post('/api/create-checkout-session', async (req, res) => {
    try {
      const stripe = getStripe();
      const { bookingId, amount, name, email } = req.body;

      if (!bookingId || amount === undefined || amount === null) {
        return res.status(400).json({ error: 'Missing booking details' });
      }

      // Use APP_URL from environment (provided by platform), fallback to VITE_APP_URL, then localhost
      const baseUrl = process.env.APP_URL || process.env.VITE_APP_URL || 'http://localhost:3000';
      // Ensure no trailing slash for consistency
      const sanitizedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'gbp',
              product_data: {
                name: `Booking Deposit for ${name}`,
                description: `Booking ID: ${bookingId}`,
              },
              unit_amount: Math.round(amount * 100), // in pence
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${sanitizedBaseUrl}/dashboard?success=true&booking_id=${bookingId}`,
        cancel_url: `${sanitizedBaseUrl}/dashboard?canceled=true`,
        customer_email: email,
        metadata: {
          bookingId,
        },
      });

      res.json({ id: session.id, url: session.url });
    } catch (error: any) {
      console.error('Stripe error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Global Error Handler - Moved to end
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('SERVER ERROR:', err);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    console.log('Starting server in DEVELOPMENT mode');
    try {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
      
      // Catch-all for development (Express 5 uses regex for wildcards)
      app.get(/^(?!\/api).*/, async (req, res, next) => {
        const url = req.originalUrl;
        try {
          const indexPath = path.resolve(__dirname, 'index.html');
          let html = fs.readFileSync(indexPath, 'utf-8');
          html = await vite.transformIndexHtml(url, html);
          res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
        } catch (e) {
          next(e);
        }
      });
    } catch (e) {
      console.error('FAILED TO CREATE VITE SERVER:', e);
      process.exit(1);
    }
  } else {
    console.log('Starting server in PRODUCTION mode');
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get(/^(?!\/api).*/, (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  console.log('[Server] Initializing listeners...');
  app.listen(PORT, '0.0.0.0', () => {
    console.log('================================================');
    console.log(`🚀 SERVER RUNNING ON http://localhost:${PORT}`);
    console.log(`🌍 ACCESSIBLE ON http://0.0.0.0:${PORT}`);
    console.log('✅ API Routes: /api/health, /api/ping, /api/test, /api/wordpress-proxy');
    console.log('================================================');
  });
}

process.on('uncaughtException', (err) => {
  console.error('[UNCAUGHT EXCEPTION]:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[UNHANDLED REJECTION]:', reason);
});

startServer().catch(err => {
  console.error('CRITICAL SERVER STARTUP ERROR:', err);
});
