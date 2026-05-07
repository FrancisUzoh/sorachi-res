import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { 
  collection, query, orderBy, onSnapshot, updateDoc, doc, 
  addDoc, deleteDoc, setDoc, getDoc, serverTimestamp 
} from 'firebase/firestore';
import { 
  Calendar, Users, CreditCard, Clock, CheckCircle, XCircle, 
  Search, Filter, TrendingUp, ShoppingBag, CalendarDays,
  Mail, Phone, MoreVertical, Plus, Trash2, Edit2, Save, X, Utensils
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { format, subDays } from 'date-fns';

const categories = ["Starters", "Nigiri", "Maki", "Signature Rolls", "Drinks", "Desserts"];

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'bookings' | 'menu' | 'schedule' | 'settings'>('bookings');
  const [bookings, setBookings] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [blockouts, setBlockouts] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({
    maxGuestsPerSlot: 10,
    autoConfirm: false,
    notice: 'Please inform us of any allergies.'
  });
  
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    price: 0,
    category: categories[0],
    isAvailable: true,
    imageUrl: ''
  });

  const [newBlockout, setNewBlockout] = useState({
    date: '',
    reason: ''
  });
  
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    today: 0,
    revenue: 0,
    chartData: [] as any[]
  });

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (!user || user.email !== 'francasayo@gmail.com') {
        navigate('/');
        return;
      }
      
      const unsubscribeBookings = fetchBookingsRealtime();
      const unsubscribeMenu = fetchMenuRealtime();
      const unsubscribeBlockouts = fetchBlockoutsRealtime();
      fetchSettings();
      
      return () => {
        unsubscribeBookings();
        unsubscribeMenu();
        unsubscribeBlockouts();
      };
    });

    return () => unsubscribeAuth();
  }, [navigate]);

  const fetchBookingsRealtime = () => {
    const path = 'bookings';
    const q = query(collection(db, path), orderBy('bookingDate', 'desc'));

    return onSnapshot(q, (snapshot) => {
      const allBookings = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBookings(allBookings);
      calculateStats(allBookings);
      setLoading(false);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, path);
      setLoading(false);
    });
  };

  const fetchMenuRealtime = () => {
    const path = 'menuItems';
    const q = query(collection(db, path), orderBy('category', 'asc'));

    return onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMenuItems(items);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, path);
    });
  };

  const fetchBlockoutsRealtime = () => {
    const path = 'blockouts';
    const q = query(collection(db, path), orderBy('date', 'desc'));
    return onSnapshot(q, (snapshot) => {
      setBlockouts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, path);
    });
  };

  const fetchSettings = async () => {
    try {
      const snap = await getDoc(doc(db, 'settings', 'global'));
      if (snap.exists()) setSettings(snap.data());
    } catch (err) {}
  };

  const calculateStats = (bks: any[]) => {
    const now = new Date();
    const todayStr = format(now, 'yyyy-MM-dd');
    
    const pending = bks.filter(b => b.status === 'pending').length;
    const today = bks.filter(b => b.bookingDate.split('T')[0] === todayStr).length;
    const revenue = bks
      .filter(b => b.status === 'confirmed' && b.depositPaid)
      .reduce((sum, b) => sum + (b.depositAmount || 0), 0);

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = subDays(new Date(), 6 - i);
      const dateStr = format(d, 'yyyy-MM-dd');
      const dailyRevenue = bks
        .filter(b => b.bookingDate.split('T')[0] === dateStr && b.status === 'confirmed' && b.depositPaid)
        .reduce((sum, b) => sum + (b.depositAmount || 0), 0);
      const dailyBookings = bks.filter(b => b.bookingDate.split('T')[0] === dateStr).length;
      return {
        name: format(d, 'EEE'),
        revenue: dailyRevenue,
        bookings: dailyBookings
      };
    });

    setStats({
      total: bks.length,
      pending,
      today,
      revenue,
      chartData: last7Days
    });
  };

  const updateBooking = async (id: string, updates: any) => {
    const path = `bookings/${id}`;
    try {
      const bookingRef = doc(db, 'bookings', id);
      await updateDoc(bookingRef, updates);
      if (selectedBooking?.id === id) {
        setSelectedBooking((prev: any) => ({ ...prev, ...updates }));
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  const handleAddBlockout = async () => {
    if (!newBlockout.date) return;
    try {
      await addDoc(collection(db, 'blockouts'), {
        ...newBlockout,
        createdAt: serverTimestamp()
      });
      setNewBlockout({ date: '', reason: '' });
    } catch (err) {}
  };

  const handleDeleteBlockout = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'blockouts', id));
    } catch (err) {}
  };

  const handleUpdateSettings = async () => {
    try {
      await setDoc(doc(db, 'settings', 'global'), settings);
      alert('Settings updated successfully');
    } catch (err) {}
  };

  const handleAddMenuItem = async () => {
    const path = 'menuItems';
    try {
      await addDoc(collection(db, path), newItem);
      setIsAddingItem(false);
      setNewItem({
        name: '',
        description: '',
        price: 0,
        category: categories[0],
        isAvailable: true,
        imageUrl: ''
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  };

  const handleDeleteMenuItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return;
    const path = `menuItems/${id}`;
    try {
      await deleteDoc(doc(db, 'menuItems', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  const filteredBookings = bookings.filter(b => {
    const matchesSearch = 
      (b.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      b.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.id.includes(searchTerm));
    
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl md:text-6xl font-serif mb-4">Owner <span className="text-emerald-500 italic">Command Center</span></h1>
          <p className="text-gray-400">Manage your restaurant's reservations and performance.</p>
        </div>
        <div className="flex bg-zinc-900/50 p-1 rounded-2xl border border-white/10 overflow-x-auto no-scrollbar">
          {(['bookings', 'menu', 'schedule', 'settings'] as const).map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === tab ? 'bg-emerald-500 text-black' : 'text-gray-400 hover:text-white'}`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'bookings' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { label: 'Pending Requests', value: stats.pending, icon: Clock, color: 'text-yellow-500' },
              { label: "Today's Guests", value: stats.today, icon: CalendarDays, color: 'text-emerald-500' },
              { label: 'Monthly Revenue', value: `£${stats.revenue}`, icon: TrendingUp, color: 'text-purple-500' },
              { label: 'Active Menu Items', value: menuItems.filter(i => i.isAvailable).length, icon: Utensils, color: 'text-blue-500' },
            ].map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-zinc-900/50 border border-white/10 rounded-3xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-2xl bg-white/5 ${stat.color}`}><stat.icon size={24} /></div>
                  <span className="text-[10px] uppercase tracking-widest text-gray-500">Live</span>
                </div>
                <div className="text-3xl font-serif mb-1">{stat.value}</div>
                <div className="text-xs text-gray-500 uppercase tracking-wider">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            <div className="lg:col-span-2 bg-zinc-900/50 border border-white/10 rounded-[2.5rem] p-8">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <TrendingUp size={20} className="text-emerald-500" /> Performance Analysis
              </h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.chartData}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                    <XAxis dataKey="name" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `£${val}`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '12px' }}
                      itemStyle={{ color: '#10b981' }}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#10b981" fillOpacity={1} fill="url(#colorRev)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="bg-zinc-900/50 border border-white/10 rounded-[2.5rem] p-8">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Users size={20} className="text-blue-500" /> Quick Status
              </h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Confirmation Rate</span>
                    <span className="text-white">{(stats.total > 0 ? (bookings.filter(b => b.status === 'confirmed').length / stats.total * 100).toFixed(0) : 0)}%</span>
                  </div>
                  <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full" style={{ width: `${(stats.total > 0 ? (bookings.filter(b => b.status === 'confirmed').length / stats.total * 100) : 0)}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Payment Completion</span>
                    <span className="text-white">{(bookings.filter(b => b.status === 'confirmed').length > 0 ? (bookings.filter(b => b.status === 'confirmed' && b.depositPaid).length / bookings.filter(b => b.status === 'confirmed').length * 100).toFixed(0) : 0)}%</span>
                  </div>
                  <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full" style={{ width: `${(bookings.filter(b => b.status === 'confirmed').length > 0 ? (bookings.filter(b => b.status === 'confirmed' && b.depositPaid).length / bookings.filter(b => b.status === 'confirmed').length * 100) : 0)}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input 
                type="text" 
                placeholder="Search by name, email, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-zinc-900/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-zinc-900/50 border border-white/10 rounded-2xl py-4 pl-12 pr-10 appearance-none focus:outline-none focus:border-emerald-500 transition-colors"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="bg-zinc-900/50 border border-white/10 rounded-[2.5rem] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-white/5">
                    <th className="px-6 py-5 text-xs uppercase tracking-widest text-gray-500 font-bold">Client</th>
                    <th className="px-6 py-5 text-xs uppercase tracking-widest text-gray-500 font-bold">Booking Details</th>
                    <th className="px-6 py-5 text-xs uppercase tracking-widest text-gray-500 font-bold">Status</th>
                    <th className="px-6 py-5 text-xs uppercase tracking-widest text-gray-500 font-bold">Payment</th>
                    <th className="px-6 py-5 text-xs uppercase tracking-widest text-gray-500 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-white/[0.02] transition-colors group cursor-pointer" onClick={() => setSelectedBooking(booking)}>
                      <td className="px-6 py-6 font-medium">{booking.name}</td>
                      <td className="px-6 py-6">
                        <div className="text-sm">{new Date(booking.bookingDate).toLocaleDateString()} at {new Date(booking.bookingDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        <div className="text-xs text-gray-500">{booking.guests} Guests</div>
                      </td>
                      <td className="px-6 py-6 text-xs uppercase font-bold tracking-widest">
                        <span className={booking.status === 'confirmed' ? 'text-emerald-500' : booking.status === 'pending' ? 'text-yellow-500' : 'text-red-500'}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-6">
                        <span className={`text-xs font-bold ${booking.depositPaid ? 'text-emerald-500' : 'text-gray-500'}`}>£{booking.depositAmount} {booking.depositPaid ? '(Paid)' : '(Unpaid)'}</span>
                      </td>
                      <td className="px-6 py-6 text-right" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                           {booking.status === 'pending' && (
                             <button onClick={() => updateBooking(booking.id, { status: 'confirmed' })} className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg hover:bg-emerald-500 hover:text-black transition-all">
                               <CheckCircle size={18} />
                             </button>
                           )}
                           {booking.status !== 'cancelled' && (
                             <button onClick={() => updateBooking(booking.id, { status: 'cancelled' })} className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all">
                               <XCircle size={18} />
                             </button>
                           )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredBookings.length === 0 && (
                <div className="p-24 text-center text-gray-500">
                  <Search size={48} className="mx-auto mb-4 opacity-20" />
                  <p>No bookings found matching your criteria.</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {activeTab === 'menu' && (
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-serif">Menu <span className="text-emerald-500 italic">Inventory</span></h2>
            <button onClick={() => setIsAddingItem(true)} className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-black rounded-xl font-bold hover:bg-emerald-400 transition-all"><Plus size={20} /> Add Item</button>
          </div>

          <AnimatePresence>
            {isAddingItem && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-zinc-900 border border-emerald-500/30 rounded-3xl p-8">
                <div className="flex justify-between items-center mb-6"><h3 className="text-xl font-bold">Add New Menu Item</h3><button onClick={() => setIsAddingItem(false)}><X size={24} /></button></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-2"><label className="text-xs uppercase tracking-widest text-gray-500">Item Name</label><input type="text" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 focus:border-emerald-500 outline-none" /></div>
                  <div className="space-y-2"><label className="text-xs uppercase tracking-widest text-gray-500">Price (£)</label><input type="number" value={newItem.price} onChange={e => setNewItem({...newItem, price: parseInt(e.target.value) || 0})} className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 focus:border-emerald-500 outline-none" /></div>
                  <div className="space-y-2"><label className="text-xs uppercase tracking-widest text-gray-500">Category</label><select value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 focus:border-emerald-500 outline-none appearance-none">{categories.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                  <div className="md:col-span-2 space-y-2"><label className="text-xs uppercase tracking-widest text-gray-500">Description</label><textarea value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 focus:border-emerald-500 outline-none h-24" /></div>
                  <div className="space-y-2"><label className="text-xs uppercase tracking-widest text-gray-500">Image URL</label><input type="text" value={newItem.imageUrl} onChange={e => setNewItem({...newItem, imageUrl: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 focus:border-emerald-500 outline-none" /></div>
                </div>
                <div className="mt-8 flex justify-end gap-4"><button onClick={() => setIsAddingItem(false)} className="px-6 py-3 text-gray-400 hover:text-white">Cancel</button><button onClick={handleAddMenuItem} className="px-8 py-3 bg-emerald-500 text-black rounded-xl font-bold">Save Item</button></div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menuItems.map((item) => (
              <motion.div layout key={item.id} className={`bg-zinc-900 border border-white/10 rounded-3xl p-6 flex flex-col ${!item.isAvailable && 'opacity-60 grayscale'}`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-emerald-500 font-bold mb-1 block">{item.category}</span>
                    <h4 className="text-xl font-serif">{item.name}</h4>
                  </div>
                  <div className="text-xl font-bold">£{item.price}</div>
                </div>
                <p className="text-gray-500 text-sm mb-6 line-clamp-2">{item.description}</p>
                <div className="flex items-center justify-between mt-auto pt-6 border-t border-white/5">
                   <button onClick={() => updateDoc(doc(db, 'menuItems', item.id), { isAvailable: !item.isAvailable })} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${item.isAvailable ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                     {item.isAvailable ? 'Available' : 'Unavailable'}
                   </button>
                   <button onClick={() => handleDeleteMenuItem(item.id)} className="text-gray-500 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'schedule' && (
        <div className="space-y-12">
          <div className="bg-zinc-900/50 border border-white/10 rounded-[2.5rem] p-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Calendar size={24} className="text-emerald-500" /> Block Specific Dates</h2>
            <div className="flex flex-col md:flex-row gap-4">
              <input type="date" value={newBlockout.date} onChange={e => setNewBlockout({ ...newBlockout, date: e.target.value })} className="bg-black/40 border border-white/10 rounded-xl py-3 px-4 focus:border-emerald-500 outline-none text-white" />
              <input type="text" placeholder="Reason (Optional)" value={newBlockout.reason} onChange={e => setNewBlockout({ ...newBlockout, reason: e.target.value })} className="flex-1 bg-black/40 border border-white/10 rounded-xl py-3 px-4 focus:border-emerald-500 outline-none text-white" />
              <button onClick={handleAddBlockout} className="px-8 py-3 bg-emerald-500 text-black rounded-xl font-bold">Block Date</button>
            </div>
          </div>

          <div className="bg-zinc-900/50 border border-white/10 rounded-[2.5rem] overflow-hidden">
            <table className="w-full text-left">
              <thead><tr className="border-b border-white/5 bg-white/5"><th className="px-6 py-5 text-xs">Date</th><th className="px-6 py-5 text-xs">Reason</th><th className="px-6 py-5 text-xs text-right">Action</th></tr></thead>
              <tbody className="divide-y divide-white/5">
                {blockouts.map(b => (
                  <tr key={b.id}><td className="px-6 py-6 font-medium">{format(new Date(b.date), 'PP')}</td><td className="px-6 py-6 text-gray-400">{b.reason || 'Not specified'}</td><td className="px-6 py-6 text-right"><button onClick={() => handleDeleteBlockout(b.id)} className="text-red-500 hover:text-red-400">Unlock</button></td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="max-w-2xl bg-zinc-900/50 border border-white/10 rounded-[2.5rem] p-8 space-y-8">
          <h2 className="text-2xl font-bold">Global Configuration</h2>
          <div className="space-y-6">
            <div className="space-y-2"><label className="text-sm text-gray-400">Max Guests Per Time Slot</label><input type="number" value={settings.maxGuestsPerSlot} onChange={e => setSettings({...settings, maxGuestsPerSlot: parseInt(e.target.value) || 1 })} className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4" /></div>
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
              <div><div className="font-bold">Auto-Confirm Bookings</div><div className="text-xs text-gray-500">Automatically confirm all new reservation requests</div></div>
              <input type="checkbox" checked={settings.autoConfirm} onChange={e => setSettings({...settings, autoConfirm: e.target.checked})} className="w-6 h-6 rounded accent-emerald-500" />
            </div>
            <div className="space-y-2"><label className="text-sm text-gray-400">Reservation Notice / Policy</label><textarea value={settings.notice} onChange={e => setSettings({...settings, notice: e.target.value })} className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 h-32" /></div>
            <button onClick={handleUpdateSettings} className="w-full py-4 bg-emerald-500 text-black rounded-xl font-bold hover:bg-emerald-400 transition-all flex items-center justify-center gap-2"><Save size={20} /> Save All Changes</button>
          </div>
        </div>
      )}

      {/* Booking Detail Modal */}
      <AnimatePresence>
        {selectedBooking && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setSelectedBooking(null)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-zinc-900 border border-white/10 rounded-[2.5rem] p-8 max-w-2xl w-full" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-3xl font-serif mb-1">{selectedBooking.name}</h2>
                  <p className="text-gray-500 text-sm">Booking ID: {selectedBooking.id}</p>
                </div>
                <button onClick={() => setSelectedBooking(null)} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-all"><X size={24} /></button>
              </div>

              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg"><Calendar size={20} /></div>
                    <div><div className="text-[10px] uppercase tracking-widest text-gray-500">Scheduled For</div><div className="font-medium">{format(new Date(selectedBooking.bookingDate), 'PPp')}</div></div>
                  </div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg"><Users size={20} /></div>
                    <div><div className="text-[10px] uppercase tracking-widest text-gray-500">Party Size</div><div className="font-medium">{selectedBooking.guests} People ({selectedBooking.selectedMenu})</div></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-purple-500/10 text-purple-500 rounded-lg"><Mail size={20} /></div>
                    <div><div className="text-[10px] uppercase tracking-widest text-gray-500">Email Address</div><div className="font-medium truncate max-w-[180px]">{selectedBooking.email}</div></div>
                  </div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-yellow-500/10 text-yellow-500 rounded-lg"><Phone size={20} /></div>
                    <div><div className="text-[10px] uppercase tracking-widest text-gray-500">Phone Number</div><div className="font-medium">{selectedBooking.phone}</div></div>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 rounded-3xl p-6 mb-8">
                <div className="text-[10px] uppercase tracking-widest text-gray-500 mb-2">Special Requests / Notes</div>
                <p className="text-sm text-gray-300 italic">"{selectedBooking.requests || 'No special requests provided.'}"</p>
              </div>

              <div className="flex items-center justify-between border-t border-white/5 pt-8">
                <div className="flex items-center gap-4">
                  <div className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                    selectedBooking.status === 'confirmed' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
                    selectedBooking.status === 'cancelled' ? 'bg-red-500/10 border-red-500/20 text-red-500' :
                    'bg-yellow-500/10 border-yellow-500/20 text-yellow-500'
                  }`}>{selectedBooking.status}</div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Deposit:</span>
                    <button onClick={() => updateBooking(selectedBooking.id, { depositPaid: !selectedBooking.depositPaid })} className={`text-xs font-bold hover:underline ${selectedBooking.depositPaid ? 'text-emerald-500' : 'text-gray-400'}`}>
                      £{selectedBooking.depositAmount} {selectedBooking.depositPaid ? 'Paid' : 'Unpaid'}
                    </button>
                  </div>
                </div>
                <div className="flex gap-3">
                  {selectedBooking.status !== 'confirmed' && <button onClick={() => updateBooking(selectedBooking.id, { status: 'confirmed' })} className="px-6 py-3 bg-emerald-500 text-black rounded-xl font-bold hover:bg-emerald-400">Confirm</button>}
                  {selectedBooking.status !== 'cancelled' && <button onClick={() => updateBooking(selectedBooking.id, { status: 'cancelled' })} className="px-6 py-3 bg-white/5 text-white rounded-xl font-bold hover:bg-white/10">Cancel</button>}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
