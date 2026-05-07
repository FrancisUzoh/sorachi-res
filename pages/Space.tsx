
import React from 'react';
import { motion } from 'framer-motion';

const SpacePage: React.FC = () => {
  const images = [
    { url: "https://picsum.photos/seed/sushi-counter/1200/1600", size: "lg", title: "The Counter" },
    { url: "https://picsum.photos/seed/private-dining/1200/1600", size: "sm", title: "Private Dining" },
    { url: "https://picsum.photos/seed/sushi-lounge/1200/1600", size: "sm", title: "The Lounge" },
    { url: "https://picsum.photos/seed/sushi-entrance/1200/1600", size: "md", title: "Entrance" }
  ];

  return (
    <div className="min-h-screen pb-32 bg-[#0a0a0a]">
      {/* Hero Section */}
      <section className="relative pt-48 pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent opacity-50" />
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="w-12 h-px bg-emerald-500" />
              <span className="text-emerald-500 font-bold uppercase tracking-[0.4em] text-[10px]">Architecture</span>
              <div className="w-12 h-px bg-emerald-500" />
            </div>
            <h1 className="text-6xl md:text-9xl font-serif text-white mb-10 leading-[1.1] tracking-tight">
              Architectural <span className="text-emerald-400 italic">Serenity</span>
            </h1>
            <p className="text-xl text-gray-400 leading-relaxed font-light max-w-2xl mx-auto">
              Designed by Kengo Kuma & Associates, our space utilizes Shou Sugi Ban wood and reclaimed granite to create a sanctuary of calm.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="container mx-auto px-6">
        <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
          {images.map((img, idx) => (
            <motion.div
              key={img.url}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.8 }}
              className="relative group rounded-[3rem] overflow-hidden cursor-pointer bg-zinc-900 border border-white/5 shadow-2xl"
            >
              <img 
                src={img.url} 
                alt={img.title} 
                referrerPolicy="no-referrer" 
                className="w-full h-auto transition-transform duration-1000 group-hover:scale-105" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-12">
                <p className="text-emerald-500 font-bold uppercase tracking-[0.3em] text-[10px] mb-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">The Space</p>
                <h3 className="text-3xl font-serif text-white translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-75">{img.title}</h3>
              </div>
              <div className="absolute inset-0 border border-white/10 rounded-[3rem] pointer-events-none" />
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default SpacePage;
