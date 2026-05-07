
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wine, Info, ChevronRight, Check } from 'lucide-react';

const SAKES = [
  {
    id: 'dassai',
    name: "Dassai 23",
    type: "Junmai Daiginjo",
    notes: "Floral, honey, melon",
    pairing: "Perfect with Otoro and delicate white fish.",
    img: "https://images.unsplash.com/photo-1510626176961-4b57d4fbad03?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 'kubota',
    name: "Kubota Manju",
    type: "Junmai Daiginjo",
    notes: "Elegant, pear, clean finish",
    pairing: "Pairs beautifully with sweet prawns and seasonal shellfish.",
    img: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 'isawa',
    name: "Isawa",
    type: "Sparkling Sake",
    notes: "Bubbly, white peach",
    pairing: "Excellent as a transition between appetizers and the main nigiri course.",
    img: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&q=80&w=800"
  }
];

const SakePairing: React.FC = () => {
  const [activeSake, setActiveSake] = useState(SAKES[0]);

  return (
    <section className="py-32 bg-[#080808] border-y border-white/5 overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-24 items-center">
          <div className="w-full lg:w-1/2">
            <span className="text-emerald-500 text-[10px] font-bold uppercase tracking-[0.5em] mb-6 block">Liquid Arts</span>
            <h2 className="text-5xl md:text-7xl font-serif text-white mb-12">
              Sake <span className="italic">Pairings</span>
            </h2>
            
            <div className="space-y-6">
              {SAKES.map((sake) => (
                <button
                  key={sake.id}
                  onClick={() => setActiveSake(sake)}
                  className={`w-full text-left p-8 rounded-3xl border transition-all duration-500 flex items-center justify-between group ${
                    activeSake.id === sake.id 
                      ? "bg-white/10 border-white/20" 
                      : "bg-transparent border-white/5 hover:border-white/10"
                  }`}
                >
                  <div>
                    <p className={`text-xs uppercase tracking-widest mb-2 transition-colors ${activeSake.id === sake.id ? "text-emerald-400" : "text-gray-500"}`}>
                      {sake.type}
                    </p>
                    <h3 className="text-2xl font-serif text-white">{sake.name}</h3>
                  </div>
                  <div className={`w-12 h-12 rounded-full border flex items-center justify-center transition-all ${
                    activeSake.id === sake.id 
                      ? "bg-emerald-500 border-emerald-500 text-black" 
                      : "bg-transparent border-white/10 text-white group-hover:border-white/30"
                  }`}>
                    {activeSake.id === sake.id ? <Check size={20} /> : <ChevronRight size={20} />}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="w-full lg:w-1/2 relative aspect-square">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSake.id}
                initial={{ opacity: 0, scale: 0.95, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 1.05, x: -20 }}
                transition={{ duration: 0.6, ease: "circOut" }}
                className="absolute inset-0"
              >
                <div className="relative h-full w-full rounded-[4rem] overflow-hidden border border-white/10 shadow-3xl">
                  <img 
                    src={activeSake.img} 
                    alt={activeSake.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-12 flex flex-col justify-end">
                    <div className="flex items-center gap-2 mb-4 text-emerald-400">
                      <Wine size={16} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Sommelier Choice</span>
                    </div>
                    <p className="text-2xl font-serif text-white mb-4">"{activeSake.pairing}"</p>
                    <div className="flex items-center gap-4 text-gray-400 text-xs uppercase tracking-widest">
                      <span className="flex items-center gap-2"><Info size={12} /> {activeSake.notes}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
            
            {/* Decorative background element */}
            <div className="absolute -top-12 -right-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px] -z-10" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default SakePairing;
