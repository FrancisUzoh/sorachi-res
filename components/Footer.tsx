
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, Instagram, Facebook, Share2 } from 'lucide-react';

interface RestaurantSettings {
  address: string;
  phone: string;
  currentStatus: string;
}

const Footer: React.FC = () => {
  const [settings, setSettings] = useState<RestaurantSettings>({
    address: '42 Loampit Vale, London SE13 7SN',
    phone: '',
    currentStatus: 'Open today 12:00–23:00'
  });

  useEffect(() => {
    const fetchSettings = async () => {
      // This query assumes you've set up an ACF Options page exposed to GraphQL
      // If not, it will just use the default state above
      const query = `
        query GetRestaurantSettings {
          restaurantSettings {
            contactInfo {
              address
              phone
              currentStatus
            }
          }
        }
      `;

      try {
        const response = await fetch('/api/wordpress-proxy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`WordPress Settings Proxy Error: status ${response.status}, text: ${errorText}`);
          return;
        }

        const json = await response.json();
          const wpSettings = json.data?.restaurantSettings?.contactInfo;
          if (wpSettings) {
            setSettings({
              address: wpSettings.address || settings.address,
              phone: wpSettings.phone || settings.phone,
              currentStatus: wpSettings.currentStatus || settings.currentStatus
            });
          }
      } catch (err) {
        console.error('Failed to fetch restaurant settings:', err);
      }
    };

    fetchSettings();
  }, []);

  return (
    <footer className="w-full py-24 border-t border-white/5">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-24">
          <div className="md:col-span-2">
            <h2 className="text-4xl font-serif mb-8">Sora <span className="text-emerald-500 italic">Sushi</span></h2>
            <p className="text-gray-400 max-w-sm font-light leading-relaxed mb-8">
              Experience the essence of contemporary Japanese cuisine. Precision, tradition, and seasonal excellence in every bite.
            </p>
            <div className="flex items-center gap-4">
              <button className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all"><Instagram size={18} /></button>
              <button className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all"><Facebook size={18} /></button>
              <button className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all"><Share2 size={18} /></button>
            </div>
          </div>
          
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest mb-8">Location</h4>
            <div className="flex items-start gap-3 text-gray-400 font-light">
              <MapPin size={16} className="text-emerald-500 mt-1" />
              <span>{settings.address}</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest mb-8">Hours</h4>
            <div className="flex items-start gap-3 text-gray-400 font-light">
              <Clock size={16} className="text-emerald-500 mt-1" />
              <span>{settings.currentStatus}</span>
            </div>
          </div>
        </div>

        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 text-[10px] uppercase tracking-widest text-gray-500">
          <p>© 2026 Sora Sushi. All rights reserved.</p>
          <div className="flex gap-8">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
