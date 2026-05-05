import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Loader2 } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';

interface MenuItemNode {
  id: string;
  title: string;
  menuItemDetails: {
    price: string;
    description: string;
    category: string | string[];
  };
  isFirestore?: boolean;
}

/**
 * WordPressMenu Component
 * Fetches menu items from both WordPress and Firestore.
 * Firestore items act as overrides or additions managed by the owner.
 */
const WordPressMenu: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItemNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      setError(null);
      
      let wpItems: MenuItemNode[] = [];
      let firestoreItems: MenuItemNode[] = [];

      // 1. Fetch WordPress with timeout and fallback
      const wpQuery = `
        query GetMenuItems {
          dishes {
            nodes {
              id
              title
              menuItemDetails {
                price
                description
                category
              }
            }
          }
        }
      `;

      const wpFallbackQuery = `
        query GetPosts {
          posts(first: 20) {
            nodes {
              id
              title
              excerpt
            }
          }
        }
      `;

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        const response = await fetch('/api/wordpress-proxy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: wpQuery }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);
        if (response.ok) {
          const json = await response.json();
          if (json.data?.dishes?.nodes) {
            wpItems = json.data.dishes.nodes;
            if (json._isMock) {
              console.info('Menu is using fallback mock data. WordPress site unreachable or misconfigured.');
            }
          } else if (json.data?.posts?.nodes) {
            // If dishes failed but posts exist, maybe the user used posts for menu items
            wpItems = json.data.posts.nodes.map((post: any) => ({
              id: post.id,
              title: post.title,
              menuItemDetails: {
                price: '0',
                description: post.excerpt?.replace(/<[^>]*>?/gm, '').substring(0, 100) || '',
                category: 'Seasonal'
              }
            }));
          } else if (!json.data && json._isMock) {
             // Fully mock data
             wpItems = json.data?.dishes?.nodes || [];
          }
        }
      } catch (err) {
        console.warn('WordPress Fetch Failed or Timed Out');
      }

      // 2. Fetch Firestore with careful timeout
      try {
        // Use a race to ensure we don't hang the UI if Firestore is unreachable
        const firestorePromise = getDocs(query(collection(db, 'menuItems'), where('isAvailable', '==', true)));
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Firestore timeout')), 4000)
        );

        const menuSnap = await Promise.race([firestorePromise, timeoutPromise]) as any;
        
        firestoreItems = menuSnap.docs.map((doc: any) => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.name,
            menuItemDetails: {
              price: data.price.toString(),
              description: data.description || '',
              category: data.category
            },
            isFirestore: true
          };
        });
      } catch (err) {
        console.warn('Firestore Menu Fetch Failed or Timed Out:', err);
      }

      // Merge items. If we have firestore items, we prioritize them OR just combine them.
      // Usually, if the owner uses the dashboard, they might want to ADD items.
      const combined = [...wpItems, ...firestoreItems];
      setMenuItems(combined);
      setLoading(false);
    };

    fetchAllData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        <p className="text-gray-400 font-serif italic">Curating our seasonal menu...</p>
      </div>
    );
  }

  // Helper to normalize category
  const getCategory = (item: MenuItemNode) => {
    const cat = item.menuItemDetails?.category;
    if (Array.isArray(cat)) return cat[0]?.trim() || 'Other';
    return (cat || 'Other').trim();
  };

  if (menuItems.length === 0) {
    return (
      <div className="text-center py-20 bg-zinc-900/30 rounded-[3rem] border border-white/5">
        <div className="inline-flex items-center justify-center p-6 bg-white/5 rounded-full mb-6">
          <AlertCircle size={48} className="text-gray-600" />
        </div>
        <h3 className="text-2xl font-serif mb-2">No items found</h3>
        <p className="text-gray-500 max-w-sm mx-auto">Our seasonal curation is being updated. Please check back shortly or visit us to see the daily specials.</p>
      </div>
    );
  }

  // Group items by category for better organization
  const categories = Array.from(new Set(menuItems.map(item => getCategory(item))));

  return (
    <div className="space-y-20">
      {categories.map((category, catIdx) => (
        <motion.div
          key={`category-${category}-${catIdx}`}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: catIdx * 0.1 }}
        >
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-serif mb-2 text-white">{category}</h2>
            <div className="w-12 h-px bg-emerald-500/30 mx-auto" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
            {menuItems
              .filter(item => getCategory(item) === category)
              .map((item, itemIdx) => (
                <div key={`${item.id || 'item'}-${itemIdx}`} className="group cursor-default border-b border-white/5 pb-6">
                  <div className="flex justify-between items-baseline mb-2">
                    <h4 className="text-xl font-medium text-white group-hover:text-emerald-400 transition-colors flex items-center gap-2">
                      {item.title}
                      {item.isFirestore && <span className="text-[8px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full uppercase tracking-widest border border-emerald-500/20">Chef's Selection</span>}
                    </h4>
                    <span className="text-emerald-500 font-serif">
                      £{item.menuItemDetails?.price || '0'}
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm font-light leading-relaxed">
                    {item.menuItemDetails?.description}
                  </p>
                </div>
              ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default WordPressMenu;
