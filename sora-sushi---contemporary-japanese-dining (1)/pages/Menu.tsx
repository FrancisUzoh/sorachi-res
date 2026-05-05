import React from 'react';
import { motion } from 'framer-motion';
import WordPressMenu from '../components/WordPressMenu';
import SEO from '../components/SEO';
import OmakaseJourney from '../components/OmakaseJourney';
import SakePairing from '../components/SakePairing';

const MenuPage: React.FC = () => {
  return (
    <div className="min-h-screen pb-32 bg-[#0a0a0a]">
      <SEO 
        title="Our Menu | Seasonal Sushi & Omakase"
        description="Explore the Sora Sushi menu. From our 22-course Imperial Omakase to seasonal nigiri and A5 Wagyu, our menu celebrates contemporary Japanese excellence."
      />
      {/* Hero Section */}
      <section className="relative pt-48 pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent opacity-50" />
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="w-12 h-px bg-emerald-500" />
              <span className="text-emerald-500 font-bold uppercase tracking-[0.4em] text-[10px]">Season 2024</span>
              <div className="w-12 h-px bg-emerald-500" />
            </div>
            <h1 className="text-6xl md:text-9xl font-serif text-white mb-10 leading-[1.1] tracking-tight">
              The <span className="text-emerald-400 italic">Menu</span>
            </h1>
            <p className="text-xl text-gray-400 leading-relaxed font-light max-w-2xl mx-auto">
              Our menu is sourced directly from our headless WordPress CMS, featuring seasonal ingredients and contemporary Japanese techniques.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-6">
        <div className="max-w-5xl mx-auto">
          {/* The new WordPress fetching component */}
          <WordPressMenu />
          
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-32 text-center p-16 md:p-24 bg-zinc-900/50 backdrop-blur-2xl rounded-[4rem] border border-white/5 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <p className="text-white font-serif italic text-3xl md:text-4xl mb-8 leading-relaxed relative z-10">
              "We respect the ingredients and the seasons above all else."
            </p>
            <div className="flex flex-col items-center gap-4 relative z-10">
              <div className="w-12 h-px bg-emerald-500/50" />
              <span className="font-serif text-emerald-400 text-xl">- Chef Kaito Sora</span>
            </div>
          </motion.div>
        </div>
      </div>

      <SakePairing />
      <OmakaseJourney />
    </div>
  );
};

export default MenuPage;
