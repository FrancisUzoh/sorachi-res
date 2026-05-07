import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, User, ChevronLeft, Share2, Bookmark } from 'lucide-react';
import SEO from '../components/SEO';

const PostDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch('/api/wordpress-proxy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: `
              query GetPost($slug: ID!) {
                post(id: $slug, idType: SLUG) {
                  title
                  content
                  excerpt
                  date
                  slug
                  author {
                    node {
                      name
                      description
                      avatar {
                        url
                      }
                    }
                  }
                  featuredImage {
                    node {
                      sourceUrl
                    }
                  }
                }
              }
            `,
            variables: { slug }
          })
        });
        const data = await response.json();
        setPost(data.data?.post);
      } catch (err) {
        console.error('Failed to fetch post:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!post) return <div className="min-h-screen flex items-center justify-center text-white">Post not found</div>;

  return (
    <div className="min-h-screen pb-32 bg-[#0a0a0a]">
      <SEO 
        title={post.title}
        description={post.excerpt?.replace(/<[^>]*>/g, '').substring(0, 160) || `Read more about ${post.title} at Sora Sushi.`}
        ogImage={post.featuredImage?.node?.sourceUrl}
        ogType="article"
        canonical={`https://sora-sushi.com/blog/${slug}`}
        schemaData={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          "headline": post.title,
          "image": post.featuredImage?.node?.sourceUrl,
          "datePublished": post.date,
          "author": {
            "@type": "Person",
            "name": post.author?.node?.name
          },
          "publisher": {
            "@type": "Organization",
            "name": "Sora Sushi",
            "logo": {
              "@type": "ImageObject",
              "url": "https://sora-sushi.com/fish-logo.svg"
            }
          }
        }}
      />
      {/* Post Header */}
      <header className="relative h-[85vh] flex items-end pb-24 overflow-hidden">
        <motion.div 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <img
            src={post.featuredImage?.node?.sourceUrl || 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&q=80&w=2000'}
            className="w-full h-full object-cover"
            alt={post.title}
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent" />
        </motion.div>
        
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Link to="/blog" className="inline-flex items-center gap-2 text-emerald-400 font-medium mb-12 group">
              <div className="w-10 h-10 rounded-full border border-emerald-500/30 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-black transition-all duration-300">
                <ChevronLeft size={20} />
              </div>
              <span className="tracking-widest uppercase text-xs">Back to Stories</span>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="max-w-5xl"
          >
            <div className="flex items-center gap-6 text-[10px] font-bold text-emerald-500 mb-8 uppercase tracking-[0.3em]">
              <span className="flex items-center gap-2">
                <Calendar size={14} />
                {new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
              <div className="w-1.5 h-1.5 bg-emerald-500/40 rounded-full" />
              <span className="flex items-center gap-2">
                <User size={14} />
                {post.author?.node?.name}
              </span>
            </div>
            <h1 className="text-5xl md:text-8xl font-serif text-white leading-[1.1] mb-12 tracking-tight">
              {post.title}
            </h1>
          </motion.div>
        </div>
      </header>

      {/* Post Content */}
      <div className="container mx-auto px-6 -mt-12 relative z-20">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="bg-zinc-900/50 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] p-8 md:p-16 shadow-2xl"
          >
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between py-10 border-b border-white/5 mb-16 gap-8">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <img 
                    src={post.author?.node?.avatar?.url || "https://api.dicebear.com/7.x/avataaars/svg?seed=Sora"} 
                    className="w-16 h-16 rounded-full border-2 border-emerald-500/20 p-1"
                    alt={post.author?.node?.name}
                  />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-4 border-zinc-900 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                  </div>
                </div>
                <div>
                  <p className="text-white text-lg font-serif italic">{post.author?.node?.name}</p>
                  <p className="text-[10px] text-emerald-500 uppercase tracking-[0.2em] font-bold mt-1">Executive Chef & Storyteller</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-gray-400 hover:bg-emerald-500 hover:text-black transition-all duration-300 group">
                  <Share2 size={20} className="group-hover:scale-110 transition-transform" />
                </button>
                <button className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-gray-400 hover:bg-emerald-500 hover:text-black transition-all duration-300 group">
                  <Bookmark size={20} className="group-hover:scale-110 transition-transform" />
                </button>
              </div>
            </div>

            <article className="prose prose-invert prose-emerald max-w-none">
              <div 
                className="text-gray-300 leading-[1.8] text-xl font-light space-y-10 wordpress-content selection:bg-emerald-500/30"
                dangerouslySetInnerHTML={{ __html: post.content }} 
              />
            </article>

            {/* Author Bio Section */}
            {post.author?.node?.description && (
              <div className="mt-24 pt-16 border-t border-white/5">
                <div className="bg-white/5 rounded-3xl p-8 flex flex-col md:flex-row gap-8 items-center text-center md:text-left">
                  <img 
                    src={post.author?.node?.avatar?.url || "https://api.dicebear.com/7.x/avataaars/svg?seed=Sora"} 
                    className="w-24 h-24 rounded-2xl object-cover"
                    alt={post.author?.node?.name}
                  />
                  <div>
                    <h3 className="text-xl font-serif text-white mb-2">About {post.author?.node?.name}</h3>
                    <p className="text-gray-400 leading-relaxed font-light">
                      {post.author?.node?.description}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default PostDetail;
