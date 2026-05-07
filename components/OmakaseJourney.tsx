
import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const JOURNEY_STEPS = [
  {
    title: "Zensai",
    desc: "A trio of delicate appetizers to awaken the palate.",
    img: "https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&q=80&w=800"
  },
  {
    title: "Sashimi",
    desc: "Wild-caught Bluefin Tuna and Amberjack, sliced with precision.",
    img: "https://images.unsplash.com/photo-1534422298391-e4f8c170db06?auto=format&fit=crop&q=80&w=800"
  },
  {
    title: "Nigiri (Hon Maguro)",
    desc: "Bluefin tuna marinated in aged soy, served over warm shari.",
    img: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&q=80&w=800"
  },
  {
    title: "Agemono",
    desc: "Kobe beef spring roll with seasonal mountain vegetables.",
    img: "https://images.unsplash.com/photo-1580822184713-fc5400e7fe10?auto=format&fit=crop&q=80&w=800"
  },
  {
    title: "The Signature",
    desc: "Our legendary Uni & Truffle handroll.",
    img: "https://images.unsplash.com/photo-1611143669185-af224c5e3252?auto=format&fit=crop&q=80&w=800"
  },
  {
    title: "Mizumono",
    desc: "Yuzu sorbet with gold leaf and seasonal berries.",
    img: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&q=80&w=800"
  }
];

const OmakaseJourney: React.FC = () => {
  const targetRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
  });

  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-80%"]);

  return (
    <section ref={targetRef} className="relative h-[300vh] bg-[#050505]">
      <div className="sticky top-0 h-screen flex items-center overflow-hidden">
        <div className="absolute top-24 left-6 md:left-24 z-10">
          <span className="text-emerald-500 text-[10px] font-bold uppercase tracking-[1em] mb-4 block">The Experience</span>
          <h2 className="text-6xl md:text-8xl font-serif text-white mix-blend-difference">
            Omakase <span className="italic">Journey</span>
          </h2>
        </div>

        <motion.div style={{ x }} className="flex gap-24 pl-6 md:pl-24 pr-48">
          {JOURNEY_STEPS.map((step, i) => (
            <div key={i} className="group relative flex-shrink-0 w-[400px] md:w-[600px]">
              <div className="aspect-[16/9] overflow-hidden rounded-[2rem] border border-white/10 mb-12 relative">
                <img 
                  src={step.img} 
                  alt={step.title}
                  className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-6 left-6 w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white font-serif text-xl border border-white/20">
                  0{i + 1}
                </div>
              </div>
              <div>
                <h3 className="text-4xl font-serif text-white mb-4">{step.title}</h3>
                <p className="text-gray-400 font-light max-w-md leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
          
          {/* Final Call */}
          <div className="flex-shrink-0 w-[400px] flex flex-col justify-center">
            <h3 className="text-6xl font-serif text-white italic mb-12">And 16 more course awaits...</h3>
            <div className="w-24 h-px bg-emerald-500" />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default OmakaseJourney;
