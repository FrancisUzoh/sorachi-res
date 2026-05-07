
import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

const HoursPage: React.FC = () => {
  return (
    <div className="min-h-screen pb-32 bg-[#0a0a0a]">
      {/* Hero Section */}
      <section className="relative pt-48 pb-24 overflow-hidden">
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
              <span className="text-emerald-500 font-bold uppercase tracking-[0.4em] text-[10px]">Visit Us</span>
            </div>
            <h1 className="text-6xl md:text-9xl font-serif text-white mb-10 leading-[1.1] tracking-tight">
              When to <span className="text-emerald-400 italic">Experience</span>
            </h1>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-7"
          >
            <div className="space-y-16">
              <div>
                <h3 className="text-emerald-500 font-bold uppercase tracking-[0.3em] text-[10px] mb-10">Service Hours</h3>
                <div className="space-y-8">
                  {[
                    { day: "Monday – Thursday", hours: "17:00 – 22:30", type: "Dinner Only" },
                    { day: "Friday – Saturday", hours: "12:00 – 14:30 | 17:30 – 23:30", type: "Lunch & Dinner" },
                    { day: "Sunday", hours: "12:00 – 21:00", type: "Continuous Service" }
                  ].map(slot => (
                    <div key={slot.day} className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/5 pb-8 group">
                      <div className="mb-2 md:mb-0">
                        <span className="text-2xl font-serif text-white group-hover:text-emerald-400 transition-colors">{slot.day}</span>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">{slot.type}</p>
                      </div>
                      <span className="text-xl text-gray-400 font-light">{slot.hours}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-10 bg-white/5 rounded-[2.5rem] border border-white/5">
                <h3 className="text-white font-serif text-xl mb-4 flex items-center gap-3">
                  <Clock size={20} className="text-emerald-500" />
                  Holiday Schedule
                </h3>
                <p className="text-gray-400 font-light leading-relaxed">
                  Sora Sushi observes traditional Japanese holidays. We are closed on New Year's Day and during the Golden Week festival in May. Please check our Instagram for specific dates.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-5"
          >
            <div className="bg-zinc-900/50 backdrop-blur-2xl rounded-[3rem] p-12 border border-white/5 sticky top-32 shadow-2xl">
              <h3 className="text-3xl font-serif text-white mb-12">Location & Contact</h3>
              
              <div className="space-y-10">
                <div className="flex gap-8">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20">
                    <MapPin className="text-emerald-500" size={24} />
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-2">Address</h4>
                    <p className="text-gray-400 font-light leading-relaxed">
                      42 Loampit Vale, Lewisham<br />
                      London SE13 7SN, United Kingdom
                    </p>
                  </div>
                </div>

                <div className="flex gap-8">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20">
                    <Phone className="text-emerald-500" size={24} />
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-2">Phone</h4>
                    <p className="text-gray-400 font-light">+81 3-5555-0123</p>
                  </div>
                </div>

                <div className="flex gap-8">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20">
                    <Mail className="text-emerald-500" size={24} />
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-2">Email</h4>
                    <p className="text-gray-400 font-light">reservations@sorasushi.jp</p>
                  </div>
                </div>
              </div>

              <div className="mt-16 h-64 rounded-[2.5rem] bg-zinc-800/50 flex items-center justify-center overflow-hidden border border-white/10 relative group">
                <img 
                  src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=1000" 
                  className="absolute inset-0 w-full h-full object-cover opacity-30 grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000"
                  alt="Map Placeholder"
                />
                <div className="relative z-10 text-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/40">
                    <MapPin className="text-black" size={20} />
                  </div>
                  <span className="text-[10px] text-white font-bold uppercase tracking-[0.2em]">View on Google Maps</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default HoursPage;
