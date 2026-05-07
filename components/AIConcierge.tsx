
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChefHat, X, Send, Loader2 } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

const AIConcierge: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([
    { role: 'assistant', text: "Irrashaimase! I'm Chef Sora's AI assistant. How can I help you with your dining experience today?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userMsg,
        config: {
          systemInstruction: `You are the AI Concierge for "Sora Sushi", a high-end contemporary Japanese restaurant in London. 
          Your tone is sophisticated, welcoming, and knowledgeable. 
          Restaurant Details: 
          - Location: 42 Loampit Vale, Lewisham, London SE13 7SN.
          - Specialty: Edomae Omakase with modern twists.
          - Price: $180 for Signature Omakase.
          - Chef: Chef Kaito Sora.
          - Policy: 48h cancellation, no vegan options.
          Provide brief, helpful answers about the menu, space, or general Japanese dining etiquette.`,
        },
      });

      setMessages(prev => [...prev, { role: 'assistant', text: response.text || "I apologize, but I'm having trouble processing that request right now." }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', text: "I seem to be disconnected from the kitchen. Please try again in a moment." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-8 w-16 h-16 bg-emerald-500 text-black rounded-full flex items-center justify-center shadow-2xl shadow-emerald-500/30 hover:scale-110 transition-transform z-50"
      >
        <ChefHat size={32} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-24 right-8 w-[350px] md:w-[400px] h-[550px] bg-zinc-900 border border-white/10 rounded-[2.5rem] shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-black/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-black">
                  <ChefHat size={20} />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-white">AI Concierge</h4>
                  <span className="text-[10px] text-emerald-500 uppercase tracking-widest font-bold flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                    Online
                  </span>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm ${
                    msg.role === 'user' 
                    ? 'bg-emerald-500 text-black font-medium' 
                    : 'bg-white/5 border border-white/10 text-gray-200'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white/5 border border-white/10 px-4 py-3 rounded-2xl text-gray-400">
                    <Loader2 className="animate-spin" size={16} />
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-white/5">
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask about our omakase..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-12 focus:outline-none focus:border-emerald-500 transition-colors"
                />
                <button
                  onClick={handleSend}
                  disabled={loading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-emerald-500 text-black flex items-center justify-center hover:bg-emerald-400 disabled:opacity-50 transition-colors"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIConcierge;
