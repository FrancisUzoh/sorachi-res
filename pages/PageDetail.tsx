import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';

const PageDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPage = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/wordpress-proxy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: `
              query GetPage($slug: ID!) {
                page(id: $slug, idType: URI) {
                  title
                  content
                  featuredImage {
                    node {
                      sourceUrl
                    }
                  }
                }
              }
            `,
            variables: { slug: slug?.startsWith('/') ? slug : `/${slug}/` }
          })
        });

        if (!response.ok) {
          throw new Error('Server returned an error while fetching the page.');
        }

        const json = await response.json();
        
        if (json.data?.page) {
          setPage(json.data.page);
        } else if (json._isMock) {
          // If we got mock data but it doesn't have the specific page,
          // create a high-quality mock page based on the slug
          setPage({
            title: slug ? slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' ') : 'Sora Sushi',
            content: `
              <p>Experience the culmination of centuries of Japanese culinary tradition at Sora Sushi. Our ${slug || 'restaurant'} is a sanctuary where precision meets passion.</p>
              <p>Every piece of nigiri is a testament to our commitment to excellence, sourced directly from Toyosu Market and prepared with aged red vinegar rice.</p>
              <h3>The Sora Philosophy</h3>
              <p>We believe that dining is an multisensory journey. From the temperature of the sake to the texture of the hand-crafted ceramics, every element is curated to elevate your evening.</p>
            `,
            featuredImage: {
              node: {
                sourceUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&q=80&w=1200'
              }
            }
          });
        }
      } catch (err) {
        console.warn('WordPress Page Fetch failed, using fallback content:', err);
        // Fallback content so the user doesn't see a blank page
        setPage({
          title: 'Our Story',
          content: '<p>Welcome to Sora Sushi. We are currently updating our digital experience. Please visit us at our Lewisham location to experience our full omakase menu.</p>',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, [slug]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
      <div className="w-12 h-12 border-t-2 border-emerald-500 rounded-full animate-spin" />
    </div>
  );
  
  if (!page) return (
    <div className="min-h-screen flex flex-col items-center justify-center text-white bg-[#0a0a0a] px-6 text-center">
      <h2 className="text-4xl font-serif mb-4">Discovery in Progress</h2>
      <p className="text-gray-500 max-w-md">The page you are looking for is currently being prepared by our digital curators. Please explore our menu or make a reservation.</p>
    </div>
  );

  return (
    <div className="min-h-screen pb-32 bg-[#0a0a0a]">
      {/* Page Hero */}
      <section className="relative pt-48 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent opacity-50" />
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-5xl"
          >
            <div className="w-12 h-1 bg-emerald-500 mb-8" />
            <h1 className="text-6xl md:text-9xl font-serif text-white mb-12 leading-[1.1] tracking-tight">
              {page.title}
            </h1>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="max-w-5xl mx-auto"
        >
          {page.featuredImage && (
            <div className="relative aspect-[21/9] rounded-[3rem] overflow-hidden mb-24 group">
              <img 
                src={page.featuredImage.node.sourceUrl} 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                alt={page.title}
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-500" />
              <div className="absolute inset-0 border border-white/10 rounded-[3rem] pointer-events-none" />
            </div>
          )}
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            <div className="lg:col-span-4">
              <div className="sticky top-32">
                <p className="text-emerald-500 font-bold uppercase tracking-[0.3em] text-[10px] mb-6">Discovery</p>
                <h3 className="text-2xl font-serif text-white mb-8 leading-snug">
                  Experience the essence of Sora Sushi through our philosophy and craft.
                </h3>
                <div className="flex flex-col gap-4">
                  <div className="h-px bg-white/10 w-full" />
                  <p className="text-gray-500 text-sm font-light leading-relaxed">
                    Every detail of our space and service is designed to transport you to the heart of Japanese culinary tradition.
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-8">
              <article className="prose prose-invert prose-emerald max-w-none">
                <div 
                  className="text-gray-300 leading-[1.9] text-xl font-light space-y-12 wordpress-content selection:bg-emerald-500/30"
                  dangerouslySetInnerHTML={{ __html: page.content }} 
                />
              </article>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PageDetail;
