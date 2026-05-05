import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, User, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

interface Post {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  author: string;
  slug: string;
  featuredImage?: string;
}

const Blog: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch('/api/wordpress-proxy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: `
              query GetPosts {
                posts(first: 10) {
                  nodes {
                    id
                    title
                    excerpt
                    date
                    slug
                    author {
                      node {
                        name
                      }
                    }
                    featuredImage {
                      node {
                        sourceUrl
                      }
                    }
                  }
                }
              }
            `
          })
        });
        const data = await response.json();
        if (data.data?.posts?.nodes) {
          setPosts(data.data.posts.nodes.map((node: any) => ({
            id: node.id,
            title: node.title,
            excerpt: node.excerpt.replace(/<[^>]*>/g, '').substring(0, 120) + '...',
            date: new Date(node.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
            author: node.author?.node?.name || 'Sora Sushi',
            slug: node.slug,
            featuredImage: node.featuredImage?.node?.sourceUrl || 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&q=80&w=1000'
          })));
        }
      } catch (err) {
        console.error('Failed to fetch posts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return (
    <div className="min-h-screen pt-20 bg-[#0a0a0a]">
      <SEO 
        title="Journal | Insights into Omakase & Japanese Culture"
        description="Explore stories about Edomae sushi philosophy, seasonal sourcing at Toyosu Market, and the art of omakase at Sora Sushi."
      />
      {/* Hero Section */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent opacity-50" />
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-px bg-emerald-500" />
              <span className="text-emerald-500 font-bold uppercase tracking-[0.4em] text-[10px]">Journal</span>
            </div>
            <h1 className="text-6xl md:text-9xl font-serif text-white mb-10 leading-[1.1] tracking-tight">
              Culinary <span className="text-emerald-400 italic">Chronicles</span>
            </h1>
            <p className="text-xl text-gray-400 leading-relaxed font-light max-w-2xl">
              A deep dive into the philosophy of Edomae sushi, seasonal sourcing, and the stories behind our craft.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="pb-48">
        <div className="container mx-auto px-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
              {[1, 2].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[16/10] bg-white/5 rounded-[2.5rem] mb-8" />
                  <div className="h-8 bg-white/5 rounded w-3/4 mb-6" />
                  <div className="h-4 bg-white/5 rounded w-full mb-3" />
                  <div className="h-4 bg-white/5 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-24">
              {posts.map((post, index) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.8 }}
                  className="group"
                >
                  <Link to={`/blog/${post.slug}`} className="block">
                    <div className="relative aspect-[16/10] overflow-hidden rounded-[2.5rem] mb-10 border border-white/5 shadow-2xl">
                      <img
                        src={post.featuredImage}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="absolute top-6 right-6 w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0 border border-white/10">
                        <ArrowRight size={24} className="text-white -rotate-45 group-hover:rotate-0 transition-transform duration-500" />
                      </div>
                    </div>
                    
                    <div className="px-4">
                      <div className="flex items-center gap-6 text-[10px] font-bold text-emerald-500 mb-6 uppercase tracking-[0.3em]">
                        <span className="flex items-center gap-2">
                          <Calendar size={14} />
                          {post.date}
                        </span>
                        <div className="w-1.5 h-1.5 bg-emerald-500/40 rounded-full" />
                        <span className="flex items-center gap-2">
                          <User size={14} />
                          {post.author}
                        </span>
                      </div>
                      
                      <h2 className="text-3xl md:text-4xl font-serif text-white mb-6 group-hover:text-emerald-400 transition-colors duration-500 leading-tight">
                        {post.title}
                      </h2>
                      
                      <p className="text-gray-400 leading-relaxed mb-8 font-light text-lg line-clamp-2">
                        {post.excerpt}
                      </p>
                      
                      <div className="inline-flex items-center gap-3 text-white font-medium border-b border-emerald-500/30 pb-2 group-hover:border-emerald-500 transition-all duration-500">
                        Explore Story
                      </div>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Blog;
