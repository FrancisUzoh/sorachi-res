
import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowUpRight, Calendar, ChevronRight, Star, Quote, MapPin, Clock, Instagram, Facebook, Share2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { restaurantSchema } from '../constants/seoData';

const Home: React.FC = () => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const y2 = useTransform(scrollY, [0, 500], [0, -150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <SEO 
        title="Contemporary Omakase & Japanese Dining"
        schemaData={restaurantSchema}
      />
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <motion.div 
          style={{ y: y1 }}
          className="absolute inset-0 z-0"
        >
          <img 
            src="https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&q=80&w=2000" 
            alt="Sora Hero" 
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-50 grayscale hover:grayscale-0 transition-all duration-[3000ms]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-[#0a0a0a]" />
        </motion.div>

        <div className="container mx-auto px-6 relative z-10 text-center">
          <motion.div
            style={{ y: y2, opacity }}
          >
            <span className="text-emerald-500 text-[10px] font-bold uppercase tracking-[0.5em] mb-6 block">Contemporary Japanese Dining</span>
            <h1 className="text-[12vw] md:text-[16vw] font-serif leading-[0.75] tracking-tighter mb-12 mix-blend-difference">
              Sora <span className="text-emerald-500 italic block md:inline">Sushi</span>
            </h1>
            <div className="flex flex-col md:flex-row items-center justify-center gap-8">
              <Link to="/reservation" className="group flex items-center gap-4 px-12 py-6 bg-emerald-500 text-black rounded-full font-bold text-lg hover:bg-emerald-400 transition-all shadow-2xl shadow-emerald-500/20">
                <span>Book a Table</span>
                <ArrowUpRight size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </Link>
              <Link to="/menu" className="px-12 py-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full font-bold text-lg hover:bg-white/10 transition-all">
                Explore Menu
              </Link>
            </div>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4"
        >
          <span className="text-[10px] uppercase tracking-widest text-gray-500">Scroll to explore</span>
          <div className="w-px h-12 bg-gradient-to-b from-emerald-500 to-transparent" />
        </motion.div>
      </section>

      {/* Bento Grid Section */}
      <section className="py-32 container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-[1200px] md:h-[800px]">
          {/* The Craft */}
          <motion.div 
            whileInView={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 20 }}
            viewport={{ once: true }}
            className="md:col-span-8 relative rounded-[3rem] overflow-hidden group"
          >
            <img 
              src="https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&q=80&w=1200" 
              alt="The Craft" 
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-12 flex flex-col justify-end">
              <span className="text-emerald-500 text-[10px] font-bold uppercase tracking-[0.3em] mb-4">The Artistry</span>
              <h2 className="text-5xl font-serif mb-6">Technical Mastery</h2>
              <p className="text-gray-300 max-w-md font-light leading-relaxed">
                Every slice is a testament to years of dedication. Our chefs honor tradition while embracing modern precision.
              </p>
            </div>
          </motion.div>

          {/* The Space */}
          <motion.div 
            whileInView={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 20 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="md:col-span-4 relative rounded-[3rem] overflow-hidden group"
          >
            <img 
              src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800" 
              alt="The Space" 
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-10 flex flex-col justify-end">
              <h3 className="text-3xl font-serif mb-2">The Space</h3>
              <Link to="/space" className="text-emerald-500 text-xs font-bold uppercase tracking-widest flex items-center gap-2 group/link">
                Explore <ChevronRight size={14} className="group-hover/link:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>

          {/* The Ingredients */}
          <motion.div 
            whileInView={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 20 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="md:col-span-4 relative rounded-[3rem] overflow-hidden group"
          >
            <img 
              src="https://images.unsplash.com/photo-1534422298391-e4f8c170db06?auto=format&fit=crop&q=80&w=800" 
              alt="Ingredients" 
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-10 flex flex-col justify-end">
              <h3 className="text-3xl font-serif mb-2">Seasonal</h3>
              <p className="text-gray-400 text-sm font-light">Sourced daily from Toyosu Market and local artisans.</p>
            </div>
          </motion.div>

          {/* Premium Experience */}
          <motion.div 
            whileInView={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 20 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="md:col-span-8 relative rounded-[3rem] overflow-hidden group"
          >
            <img 
              src="https://images.unsplash.com/photo-1580822184713-fc5400e7fe10?auto=format&fit=crop&q=80&w=1200" 
              alt="Premium" 
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/90 via-transparent to-transparent p-12 flex flex-col justify-end">
              <div className="flex items-center gap-2 mb-4">
                <Star size={16} className="text-emerald-400 fill-emerald-400" />
                <span className="text-emerald-400 text-[10px] font-bold uppercase tracking-[0.4em]">Exclusive Tier</span>
              </div>
              <h2 className="text-5xl font-serif mb-6">Imperial Omakase</h2>
              <Link to="/premium" className="px-8 py-4 bg-emerald-500 text-black rounded-2xl font-bold w-fit hover:bg-emerald-400 transition-all">
                Discover Premium
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Signature Dishes Section */}
      <section className="py-32 bg-white/5">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
            <div>
              <span className="text-emerald-500 text-[10px] font-bold uppercase tracking-[0.5em] mb-4 block">The Menu</span>
              <h2 className="text-6xl font-serif">Signature <span className="italic">Dishes</span></h2>
            </div>
            <p className="text-gray-400 max-w-sm font-light leading-relaxed">
              A curated selection of our most celebrated creations, balancing traditional flavors with contemporary flair.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { 
                name: "Otoro Nigiri", 
                desc: "Bluefin tuna belly with aged soy and fresh wasabi", 
                img: "https://images.unsplash.com/photo-1611143669185-af224c5e3252?auto=format&fit=crop&q=80&w=800" 
              },
              { 
                name: "Hokkaido Uni", 
                desc: "Sea urchin with crispy nori and truffle salt", 
                img: "https://images.unsplash.com/photo-1534422298391-e4f8c170db06?auto=format&fit=crop&q=80&w=800" 
              },
              { 
                name: "Wagyu Aburi", 
                desc: "A5 Miyazaki beef lightly torched with garlic chips", 
                img: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=800" 
              }
            ].map((dish, i) => (
              <motion.div 
                key={i}
                whileInView={{ opacity: 1, y: 0 }}
                initial={{ opacity: 0, y: 30 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="group"
              >
                <div className="aspect-[4/5] rounded-[2.5rem] overflow-hidden mb-8 relative">
                  <img 
                    src={dish.img} 
                    alt={dish.name} 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />
                </div>
                <h3 className="text-2xl font-serif mb-2">{dish.name}</h3>
                <p className="text-gray-500 text-sm font-light">{dish.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-48 relative overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Quote size={64} className="text-emerald-500/20 mx-auto mb-12" />
            <motion.h2 
              whileInView={{ opacity: 1 }}
              initial={{ opacity: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-6xl font-serif leading-tight mb-16 italic"
            >
              "Sushi is the ultimate expression of minimalism. It is the art of removing everything that is unnecessary until only the essence remains."
            </motion.h2>
            <div className="flex items-center justify-center gap-6">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-emerald-500/30">
                <img 
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=Kenji" 
                  alt="Chef Kenji" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-left">
                <p className="font-bold text-xl">Chef Kenji</p>
                <p className="text-emerald-500 text-xs uppercase tracking-widest">Executive Chef</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-emerald-500/5 rounded-full blur-[120px] -z-10" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[150px] -z-10" />
      </section>

      {/* Press Section */}
      <section className="py-24 border-y border-white/5 bg-black">
        <div className="container mx-auto px-6">
          <p className="text-[10px] uppercase tracking-[0.5em] text-gray-500 text-center mb-12">Recognized By</p>
          <div className="flex flex-wrap items-center justify-center gap-12 md:gap-24 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
            {["MICHELIN", "VOGUE", "THE NEW YORK TIMES", "FORBES", "TIME OUT"].map((press) => (
              <span key={press} className="text-xl md:text-2xl font-serif tracking-widest">{press}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-48 bg-[#0a0a0a]">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center">
            <span className="text-emerald-500 text-[10px] font-bold uppercase tracking-[0.5em] mb-6 block">The Inner Circle</span>
            <h2 className="text-5xl font-serif mb-8">Join Our <span className="italic">Mailing List</span></h2>
            <p className="text-gray-400 font-light mb-12 leading-relaxed">
              Receive exclusive invitations to seasonal menu launches, private tastings, and chef's table events.
            </p>
            <form className="flex flex-col md:flex-row gap-4">
              <input 
                type="email" 
                placeholder="Your email address" 
                className="flex-1 bg-white/5 border border-white/10 rounded-full px-8 py-4 focus:outline-none focus:border-emerald-500/50 transition-colors"
              />
              <button className="px-10 py-4 bg-white text-black rounded-full font-bold hover:bg-emerald-500 transition-all">
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 border-t border-white/5">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-7xl font-serif mb-12">Begin Your <span className="italic">Journey</span></h2>
          <Link to="/reservation" className="inline-flex items-center gap-4 px-16 py-8 bg-white text-black rounded-full font-bold text-xl hover:bg-emerald-500 transition-all group">
            <span>Secure Your Seat</span>
            <ArrowUpRight size={24} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
