
import React from 'react';
import { motion } from 'framer-motion';

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen pb-32 bg-[#0a0a0a]">
      {/* Hero Section */}
      <section className="relative pt-48 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent opacity-50" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-px bg-emerald-500" />
                <span className="text-emerald-500 font-bold uppercase tracking-[0.4em] text-[10px]">Legacy</span>
              </div>
              <h1 className="text-6xl md:text-8xl font-serif text-white mb-10 leading-[1.1] tracking-tight">
                Artistry in <span className="text-emerald-400 italic">Every Grain</span>
              </h1>
              <div className="space-y-8 text-gray-400 text-xl leading-relaxed font-light">
                <p>
                  Founded in 2018, Sora Sushi was born from a desire to blend traditional Edomae techniques with modern urban aesthetics. Our name, "Sora" (meaning Sky), reflects our commitment to infinite quality and elevated perspective.
                </p>
                <p>
                  Every morning at 4:00 AM, our procurement team in Toyosu selects the finest catches. Our rice is seasoned with a unique blend of red vinegars, aged for three years to achieve the perfect acidity.
                </p>
                <p className="text-white font-serif italic text-2xl border-l-2 border-emerald-500 pl-8 py-2">
                  "We believe dining is more than just sustenance; it is a temporal performance between the chef, the ingredient, and the guest."
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="relative rounded-[4rem] overflow-hidden aspect-[4/5] bg-zinc-900 shadow-2xl"
            >
              <img 
                src="https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&q=80&w=1200" 
                alt="Chef Preparing Food" 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-1000 hover:scale-105"
              />
              <div className="absolute inset-0 bg-emerald-500/5 mix-blend-overlay" />
              <div className="absolute inset-0 border border-white/10 rounded-[4rem] pointer-events-none" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            { label: "Founded", value: "2018", desc: "A vision of modern tradition" },
            { label: "Daily Catch", value: "100% Fresh", desc: "Direct from Toyosu Market" },
            { label: "Michelin Guide", value: "2024", desc: "Recognized for excellence" }
          ].map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.8 }}
              className="p-12 bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-[3rem] text-center group hover:border-emerald-500/30 transition-all duration-500"
            >
              <h4 className="text-emerald-500 text-[10px] uppercase tracking-[0.4em] font-bold mb-4">{stat.label}</h4>
              <p className="text-5xl font-serif text-white mb-4 group-hover:text-emerald-400 transition-colors">{stat.value}</p>
              <p className="text-gray-500 text-sm font-light tracking-wide">{stat.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
