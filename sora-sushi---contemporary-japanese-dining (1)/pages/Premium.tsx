import React from 'react';
import { motion } from 'framer-motion';
import { Star, ShieldCheck, Gem, Sparkles, ArrowRight, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PremiumPage: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Gem className="text-emerald-500" size={32} />,
      title: "Rare Ingredients",
      description: "Direct imports from Toyosu Market, including A5+ Wagyu and seasonal Bluefin Tuna."
    },
    {
      icon: <Star className="text-emerald-500" size={32} />,
      title: "Chef's Private Counter",
      description: "Exclusive seating directly in front of Chef Kaito for an intimate 1-on-1 experience."
    },
    {
      icon: <ShieldCheck className="text-emerald-500" size={32} />,
      title: "Priority Booking",
      description: "Access to prime-time slots and last-minute cancellations before they go public."
    },
    {
      icon: <Sparkles className="text-emerald-500" size={32} />,
      title: "Vintage Sake Pairing",
      description: "A curated selection of aged sakes and rare whiskies included with your meal."
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&q=80&w=2000" 
            alt="Premium Sushi" 
            className="w-full h-full object-cover opacity-40 scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black" />
        </div>

        <div className="relative z-10 text-center max-w-4xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block px-4 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold uppercase tracking-[0.3em] mb-6">
              The Imperial Experience
            </span>
            <h1 className="text-7xl md:text-9xl font-serif mb-8 leading-tight">
              Beyond <span className="text-emerald-500 italic">Omakase</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 font-light max-w-2xl mx-auto leading-relaxed mb-12">
              An uncompromising journey into the soul of Japanese gastronomy. Reserved for those who seek the extraordinary.
            </p>
            <button 
              onClick={() => navigate('/reservation')}
              className="px-12 py-5 bg-emerald-500 text-black rounded-2xl font-bold text-lg hover:bg-emerald-400 transition-all shadow-2xl shadow-emerald-500/30 flex items-center gap-3 mx-auto group"
            >
              Reserve the Counter
              <ArrowRight className="group-hover:translate-x-2 transition-transform" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-6 py-32">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {features.map((feature, idx) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="p-8 rounded-[2.5rem] bg-zinc-900/50 border border-white/5 hover:border-emerald-500/30 transition-all group"
            >
              <div className="mb-6 group-hover:scale-110 transition-transform duration-500">{feature.icon}</div>
              <h3 className="text-2xl font-serif mb-4">{feature.title}</h3>
              <p className="text-gray-400 font-light leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* The Menu Preview */}
      <section className="max-w-7xl mx-auto px-6 py-32 border-t border-white/5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl md:text-7xl font-serif mb-8">The <span className="text-emerald-500 italic">Imperial</span> Menu</h2>
            <p className="text-gray-400 text-lg font-light mb-12 leading-relaxed">
              A 22-course masterpiece that evolves with the moon and the tides. Each dish is a testament to centuries of tradition, elevated by modern technique.
            </p>
            <div className="space-y-8">
              {[
                { name: "Bluefin Trio", desc: "Akami, Chutoro, and Otoro aged for 14 days" },
                { name: "Wagyu A5+ Ishiyaki", desc: "Sizzling over volcanic stone with fresh wasabi" },
                { name: "Golden Uni Don", desc: "Hokkaido Uni with 24k gold leaf and truffle" }
              ].map((item) => (
                <div key={item.name} className="flex gap-6 items-start">
                  <div className="w-1 h-12 bg-emerald-500/30 rounded-full" />
                  <div>
                    <h4 className="text-xl font-medium mb-1">{item.name}</h4>
                    <p className="text-gray-500 text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="aspect-[4/5] rounded-[3rem] overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&q=80&w=1000" 
                alt="Chef preparing sushi" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-10 -left-10 bg-emerald-500 p-10 rounded-[2rem] hidden md:block">
              <p className="text-black font-serif text-3xl leading-tight">
                "Perfection is not a goal, it is our standard."
              </p>
              <p className="text-black/60 text-sm mt-4 uppercase tracking-widest font-bold">- Chef Kaito</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-6 py-32">
        <div className="bg-emerald-500 rounded-[4rem] p-12 md:p-24 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
            </svg>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative z-10"
          >
            <h2 className="text-5xl md:text-7xl font-serif text-black mb-8">Ready for the <span className="italic">Extraordinary?</span></h2>
            <p className="text-black/70 text-xl max-w-2xl mx-auto mb-12">
              Limited to 6 guests per evening. Reservations are released on the 1st of every month.
            </p>
            <button 
              onClick={() => navigate('/reservation')}
              className="px-12 py-5 bg-black text-white rounded-2xl font-bold text-lg hover:bg-zinc-900 transition-all flex items-center gap-3 mx-auto"
            >
              <Calendar size={20} />
              Book Your Experience
            </button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default PremiumPage;
