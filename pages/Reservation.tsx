import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Users, Clock, ArrowRight, CheckCircle2, AlertCircle, ChefHat } from 'lucide-react';
import { db, handleFirestoreError, OperationType, createNotification, notifyOwner } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { fetchWordPressMenu } from '../lib/wordpress';
import { useNavigate } from 'react-router-dom';
import { MenuItem } from '../types';
import SEO from '../components/SEO';
import { format, addDays } from 'date-fns';

interface ReservationPageProps {
  user: any;
}

const ReservationPage: React.FC<ReservationPageProps> = ({ user }) => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [menuOptions, setMenuOptions] = useState<MenuItem[]>([]);
  const [blockouts, setBlockouts] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({
    maxGuestsPerSlot: 10,
    autoConfirm: false,
    notice: 'A deposit of the full menu price per person is required to confirm all bookings.'
  });
  const [formData, setFormData] = useState({
    guests: '2',
    date: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
    time: '19:00',
    selected_menu: 'Sora Signature Omakase',
    name: '',
    email: '',
    phone: '',
    requests: ''
  });
  const navigate = useNavigate();

  const DEFAULT_MENUS: MenuItem[] = [
    { id: '1', item_name: "Sora Signature Omakase", price: 180, description: "18-course experience featuring rare seasonal imports", category: "Omakase" },
    { id: '2', item_name: "Sunset Tasting", price: 120, description: "12-course rapid service for late dining", category: "Omakase" },
    { id: '3', item_name: "Imperial Omakase", price: 250, description: "22-course ultra-premium experience with rare Toyosu imports", category: "Omakase" },
    { id: '4', item_name: "Vegetarian Zen", price: 100, description: "10-course plant-based journey through seasonal vegetables", category: "Omakase" },
    { id: '12', item_name: "Chef's Counter Exclusive", price: 300, description: "Personalized 25-course journey with Chef Kaito", category: "Omakase" },
    { id: '13', item_name: "Seasonal Truffle Menu", price: 220, description: "Omakase featuring fresh seasonal truffles in every course", category: "Omakase" }
  ];

  const getDepositAmount = () => {
    const selected = menuOptions.find(m => m.item_name === formData.selected_menu) || DEFAULT_MENUS[0];
    return parseInt(formData.guests) * selected.price;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Settings
        const settingsSnap = await getDoc(doc(db, 'settings', 'global'));
        if (settingsSnap.exists()) setSettings(settingsSnap.data());

        // Fetch Blockouts
        const blockSnap = await getDocs(collection(db, 'blockouts'));
        setBlockouts(blockSnap.docs.map(doc => doc.data()));

        // Fetch Menus
        const menuQuery = query(collection(db, 'menuItems'), where('isAvailable', '==', true));
        const menuSnap = await getDocs(menuQuery);
        
        if (!menuSnap.empty) {
          const firestoreMenus = menuSnap.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              item_name: data.name,
              price: data.price,
              description: data.description || '',
              category: data.category
            };
          });
          setMenuOptions(firestoreMenus);
          if (firestoreMenus.length > 0) {
            setFormData(prev => ({ ...prev, selected_menu: firestoreMenus[0].item_name }));
          }
        } else {
          const wpMenus = await fetchWordPressMenu();
          if (wpMenus && wpMenus.length > 0) {
            const filtered = wpMenus.filter(m => m.category === 'Omakase');
            setMenuOptions(filtered.length > 0 ? filtered : wpMenus);
            if (filtered.length > 0) setFormData(prev => ({ ...prev, selected_menu: filtered[0].item_name }));
          } else {
            setMenuOptions(DEFAULT_MENUS);
          }
        }
      } catch (err) {
        console.error("Error loading data:", err);
        setMenuOptions(DEFAULT_MENUS);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({ 
        ...prev, 
        email: user.email || '', 
        name: user.displayName || user.email?.split('@')[0] || '' 
      }));
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user) {
      setError('Please login to make a reservation.');
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    if (!formData.date) {
      setError('Please select a date for your reservation.');
      return;
    }

    if (blockouts.some(b => b.date === formData.date)) {
      setError('We are sorry, but we are closed on this date.');
      return;
    }

    setLoading(true);
    const depositAmount = getDepositAmount();

    const path = 'bookings';
    try {
      // Construct ISO date string with UTC offset
      const bookingDate = `${formData.date}T${formData.time}:00Z`;

      const bookingData = {
        clientId: user.uid,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        bookingDate: bookingDate,
        guests: parseInt(formData.guests),
        selectedMenu: formData.selected_menu,
        depositPaid: false,
        depositAmount: depositAmount,
        status: 'pending',
        requests: formData.requests,
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, path), bookingData);

      if (docRef.id) {
        // Create notification
        await createNotification(
          user.uid,
          'Reservation Requested',
          `Your request for ${formData.guests} guests for the ${formData.selected_menu} on ${formData.date} at ${formData.time} has been received.`,
          'success'
        );
        // Notify owner
        await notifyOwner(
          'New Booking Request',
          `${formData.name} requested ${formData.guests} guests for ${formData.selected_menu} on ${formData.date} at ${formData.time}.`
        );
        
        // Automatically trigger Stripe payment
        try {
          const response = await fetch('/api/create-checkout-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              bookingId: docRef.id,
              amount: depositAmount,
              name: formData.name,
              email: formData.email,
            }),
          });

          if (response.ok) {
            const session = await response.json();
            if (session.url) {
              const stripeWindow = window.open(session.url, '_blank');
              if (!stripeWindow) {
                window.location.href = session.url;
              }
            } else {
              setSubmitted(true);
            }
          } else {
            setSubmitted(true);
          }
        } catch (payErr) {
          console.error('Payment initiation error:', payErr);
          setSubmitted(true);
        }
      }
    } catch (err: any) {
      handleFirestoreError(err, OperationType.WRITE, path);
    } finally {
      setLoading(false);
    }
  };


  if (submitted) {
    return (
      <div className="max-w-xl mx-auto px-6 py-24 text-center">
        <SEO 
          title="Reservation Successful" 
          description="Your reservation request at Sora Sushi has been received. We look forward to welcoming you."
        />
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-emerald-500/10 border border-emerald-500/20 rounded-[3rem] p-12"
        >
          <CheckCircle2 className="text-emerald-500 mx-auto mb-6" size={64} />
          <h2 className="text-4xl font-serif mb-4">Reservation Requested</h2>
          <p className="text-gray-400 mb-8 font-light">
            We have received your request for {formData.guests} guests for the <span className="text-emerald-500 font-bold">{formData.selected_menu}</span> on {formData.date} at {formData.time}. 
            Please visit your dashboard to pay the £{getDepositAmount()} deposit to confirm your booking.
          </p>
          <div className="flex flex-col gap-4">
            <button 
              onClick={() => navigate('/dashboard')}
              className="px-8 py-4 bg-emerald-500 text-black rounded-2xl font-bold hover:bg-emerald-400 transition-all"
            >
              Go to Dashboard
            </button>
            <button 
              onClick={() => setSubmitted(false)}
              className="text-emerald-500 font-bold hover:underline"
            >
              Make another booking
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <SEO 
        title="Book a Table" 
        description="Reserve your seat at the Sora Sushi counter. Experience our legendary 18 or 22-course omakase. Bookings require a deposit to confirm."
      />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-7"
        >
          <h1 className="text-6xl font-serif mb-8 leading-tight">Secure Your Place at the Counter</h1>
          
          {!user && (
            <div className="mb-8 p-6 bg-yellow-500/10 border border-yellow-500/20 rounded-3xl flex items-center gap-4 text-yellow-500">
              <AlertCircle size={24} />
              <p className="text-sm">You must be logged in to make a reservation. <button onClick={() => navigate('/login')} className="font-bold underline">Login here</button></p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8 bg-zinc-900/50 border border-white/5 rounded-[3rem] p-8 md:p-12">
            {error && (
              <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-3xl flex items-center gap-4 text-red-500 mb-8">
                <AlertCircle size={24} />
                <p className="text-sm">{error}</p>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-gray-500 ml-1">Party Size</label>
                <div className="relative">
                  <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" size={18} />
                  <select 
                    value={formData.guests}
                    onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 appearance-none focus:outline-none focus:border-emerald-500 transition-colors"
                  >
                    <option value="1">1 Guest</option>
                    <option value="2">2 Guests</option>
                    <option value="3">3 Guests</option>
                    <option value="4">4 Guests</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-gray-500 ml-1">Date</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" size={18} />
                  <input 
                    type="date" 
                    required
                    min={format(addDays(new Date(), 1), 'yyyy-MM-dd')}
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className={`w-full bg-white/5 border rounded-2xl py-4 pl-12 pr-4 focus:outline-none transition-colors ${blockouts.some(b => b.date === formData.date) ? 'border-red-500 text-red-500' : 'border-white/10 focus:border-emerald-500'}`} 
                  />
                </div>
                {blockouts.some(b => b.date === formData.date) && (
                  <p className="text-[10px] text-red-500 ml-1">Closed: {blockouts.find(b => b.date === formData.date)?.reason || 'Not available'}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-gray-500 ml-1">Preferred Time</label>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {["17:30", "18:00", "19:00", "19:30", "20:30", "21:00"].map(time => (
                  <button 
                    key={time} 
                    type="button" 
                    onClick={() => setFormData({ ...formData, time })}
                    className={`py-3 text-sm rounded-xl border transition-all ${formData.time === time ? 'bg-emerald-500 text-black border-emerald-500' : 'border-white/10 hover:border-emerald-500 hover:text-emerald-500'}`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-gray-500 ml-1">Select Menu</label>
              <div className="relative">
                <ChefHat className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" size={18} />
                <select 
                  value={formData.selected_menu}
                  onChange={(e) => setFormData({ ...formData, selected_menu: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 appearance-none focus:outline-none focus:border-emerald-500 transition-colors"
                >
                  {menuOptions.map(menu => (
                    <option key={menu.id} value={menu.item_name}>
                      {menu.item_name} (£{menu.price})
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-[10px] text-gray-500 ml-1 italic">
                {menuOptions.find(m => m.item_name === formData.selected_menu)?.description}
              </p>
            </div>

            <div className="space-y-4 pt-4">
              <input 
                type="text" 
                placeholder="Full Name" 
                required 
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:border-emerald-500 transition-colors" 
              />
              <input 
                type="email" 
                placeholder="Email Address" 
                required 
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:border-emerald-500 transition-colors" 
              />
              <input 
                type="tel" 
                placeholder="Phone Number" 
                required 
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:border-emerald-500 transition-colors" 
              />
              <textarea 
                placeholder="Special Requests (Allergies, Celebrations)" 
                value={formData.requests}
                onChange={(e) => setFormData({ ...formData, requests: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 h-32 focus:outline-none focus:border-emerald-500 transition-colors" 
              />
            </div>

            <button 
              type="submit" 
              disabled={loading || !user}
              className="w-full py-6 bg-emerald-500 text-black rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/20 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  Confirm Request
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-5 space-y-8"
        >
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-[2rem] p-8">
            <h3 className="text-xl font-serif text-emerald-500 mb-4">Restaurant Policy</h3>
            <div className="space-y-4 text-gray-300 font-light text-sm leading-relaxed whitespace-pre-wrap">
              {settings.notice}
            </div>
          </div>

          <div className="rounded-[2rem] overflow-hidden aspect-video relative">
            <img 
              src="https://picsum.photos/seed/sushi-counter-res/1200/800" 
              alt="Restaurant Counter" 
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ReservationPage;
