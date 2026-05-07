import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { auth, db, handleFirestoreError, OperationType, createNotification, notifyOwner } from '../lib/firebase';
import { collection, query, where, getDocs, updateDoc, doc, onSnapshot, orderBy } from 'firebase/firestore';
import { Booking } from '../types';
import { Calendar, Users, CreditCard, Clock, XCircle, CheckCircle, AlertCircle, X, Star } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';

const Dashboard: React.FC = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [payingBookingId, setPayingBookingId] = useState<string | null>(null);
  const [cancelingBookingId, setCancelingBookingId] = useState<string | null>(null);
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'canceled' | null>(null);
  const [activeTab, setActiveTab] = useState<'bookings' | 'profile' | 'rewards'>('bookings');
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        navigate('/login');
        return;
      }
      setUser(currentUser);
      const unsubscribeBookings = fetchBookingsRealtime(currentUser.uid);
      return () => unsubscribeBookings();
    });

    return () => unsubscribeAuth();
  }, [navigate]);

  useEffect(() => {
    // Wait for user to be loaded before checking searchParams
    if (!user) return;

    // Handle Stripe redirect parameters
    const handlePaymentSuccess = async (bookingId: string) => {
      const path = `bookings/${bookingId}`;
      try {
        const bookingRef = doc(db, 'bookings', bookingId);
        await updateDoc(bookingRef, { 
          depositPaid: true,
          status: 'confirmed'
        });
        
        await createNotification(
          auth.currentUser?.uid || '',
          'Payment Successful',
          'Your deposit has been received and your booking is now confirmed.',
          'success'
        );
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, path);
      }
    };

    if (searchParams.get('success')) {
      const bookingId = searchParams.get('booking_id');
      setPaymentStatus('success');
      if (bookingId) {
        handlePaymentSuccess(bookingId);
      }
      setSearchParams({}, { replace: true });
    } else if (searchParams.get('canceled')) {
      setPaymentStatus('canceled');
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const fetchBookingsRealtime = (userId: string) => {
    const path = 'bookings';
    const q = query(
      collection(db, path), 
      where('clientId', '==', userId),
      orderBy('bookingDate', 'asc')
    );

    return onSnapshot(q, (snapshot) => {
      const bookingsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBookings(bookingsData);
      setLoading(false);
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, path);
      setLoading(false);
    });
  };

  const handleCancel = async (bookingId: string) => {
    setCancelingBookingId(bookingId);
    setError(null);
    const path = `bookings/${bookingId}`;

    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      await updateDoc(bookingRef, { status: 'canceled' });
      
      const booking = bookings.find(b => b.id === bookingId);
      if (booking) {
        await createNotification(
          user.uid,
          'Booking Canceled',
          `Your reservation for ${new Date(booking.bookingDate).toLocaleDateString()} has been successfully canceled.`,
          'warning'
        );
        await notifyOwner(
          'Booking Canceled',
          `${booking.name} canceled their reservation for ${new Date(booking.bookingDate).toLocaleDateString()}.`
        );
      }

      setConfirmCancelId(null);
    } catch (err: any) {
      handleFirestoreError(err, OperationType.UPDATE, path);
      setError('Failed to cancel booking. Please try again.');
    } finally {
      setCancelingBookingId(null);
    }
  };

  const handlePayDeposit = async (booking: any) => {
    if (payingBookingId) return;
    setPayingBookingId(booking.id);
    setError(null);
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking.id,
          amount: booking.depositAmount,
          name: booking.name,
          email: booking.email,
        }),
      });

      const session = await response.json();
      if (session.url) {
        const stripeWindow = window.open(session.url, '_blank');
        if (!stripeWindow) {
          window.location.href = session.url;
        }
      } else {
        throw new Error(session.error || 'Failed to create checkout session');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      setError(error.message || 'Failed to initiate payment. Please try again.');
    } finally {
      setPayingBookingId(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="text-emerald-500" size={18} />;
      case 'canceled': return <XCircle className="text-red-500" size={18} />;
      default: return <Clock className="text-yellow-500" size={18} />;
    }
  };

  const upcomingBookings = bookings.filter(b => new Date(b.bookingDate) >= new Date() && b.status !== 'canceled');
  const pastBookings = bookings.filter(b => new Date(b.bookingDate) < new Date() || b.status === 'canceled');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-24">
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-8 p-6 rounded-3xl flex items-center justify-between gap-4 border bg-red-500/10 border-red-500/20 text-red-400"
          >
            <div className="flex items-center gap-4">
              <AlertCircle size={24} />
              <p className="font-bold">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
              <X size={20} />
            </button>
          </motion.div>
        )}
        {paymentStatus && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`mb-8 p-6 rounded-3xl flex items-center justify-between gap-4 border ${
              paymentStatus === 'success' 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}
          >
            <div className="flex items-center gap-4">
              {paymentStatus === 'success' ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
              <div>
                <p className="font-bold">{paymentStatus === 'success' ? 'Payment Successful!' : 'Payment Canceled'}</p>
                <p className="text-sm opacity-80">
                  {paymentStatus === 'success' 
                    ? 'Your deposit has been received and your booking is now confirmed.' 
                    : 'Your deposit payment was not completed. Please try again to secure your booking.'}
                </p>
              </div>
            </div>
            <button onClick={() => setPaymentStatus(null)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
              <X size={20} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <h1 className="text-4xl md:text-6xl font-serif mb-4">Customer <span className="text-emerald-500 italic">Portal</span></h1>
            <p className="text-gray-400">Welcome back, {user?.email}</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/reservation')}
              className="px-6 py-3 bg-emerald-500 text-black rounded-xl font-bold hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20"
            >
              New Reservation
            </button>
            <button
              onClick={async () => {
                await auth.signOut();
                navigate('/login');
              }}
              className="px-6 py-3 bg-white/5 border border-white/10 text-white rounded-xl font-bold hover:bg-white/10 transition-all"
            >
              Sign Out
            </button>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex items-center gap-8 border-b border-white/10 mb-12">
        {[
          { id: 'bookings', label: 'My Bookings', icon: Calendar },
          { id: 'profile', label: 'Profile', icon: Users },
          { id: 'rewards', label: 'Sora Rewards', icon: Star },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 pb-4 text-sm font-bold tracking-widest uppercase transition-all relative ${
              activeTab === tab.id ? 'text-emerald-500' : 'text-gray-500 hover:text-white'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500"
              />
            )}
          </button>
        ))}
      </div>

      {activeTab === 'bookings' && (
        <div className="space-y-12">
          {/* Upcoming Section */}
          <section>
            <h2 className="text-2xl font-serif mb-6 flex items-center gap-3">
              Upcoming <span className="text-emerald-500 italic">Experiences</span>
              <span className="text-xs font-sans bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full border border-emerald-500/20">
                {upcomingBookings.length}
              </span>
            </h2>
            {upcomingBookings.length === 0 ? (
              <div className="bg-zinc-900/50 border border-white/10 rounded-3xl p-12 text-center">
                <p className="text-gray-500">No upcoming reservations.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingBookings.map((booking) => (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-zinc-900/50 border border-white/10 rounded-3xl p-6 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs uppercase tracking-widest">
                            {getStatusIcon(booking.status)}
                            <span>{booking.status}</span>
                          </div>
                          {(booking.selectedMenu?.includes('Imperial') || booking.selectedMenu?.includes('Exclusive')) && (
                            <div className="flex items-center gap-1 text-[10px] text-emerald-500 font-bold uppercase tracking-tighter">
                              <Star size={10} fill="currentColor" />
                              Premium Experience
                            </div>
                          )}
                        </div>
                        <span className="text-gray-500 text-xs">ID: {booking.id.slice(0, 8)}</span>
                      </div>

                      <div className="space-y-4 mb-8">
                        <div className="flex items-center gap-3 text-gray-300">
                          <Calendar size={18} className="text-emerald-500" />
                          <span>{new Date(booking.bookingDate).toLocaleDateString()} at {new Date(booking.bookingDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-300">
                          <Users size={18} className="text-emerald-500" />
                          <span>{booking.guests} Guests — {booking.selectedMenu}</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-300">
                          <CreditCard size={18} className="text-emerald-500" />
                          <span>Deposit: £{booking.depositAmount} ({booking.depositPaid ? 'Paid' : 'Pending'})</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      {!booking.depositPaid && booking.status !== 'canceled' && (
                        <button
                          onClick={() => handlePayDeposit(booking)}
                          disabled={payingBookingId === booking.id}
                          className="w-full py-3 bg-emerald-500 text-black rounded-xl font-bold hover:bg-emerald-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {payingBookingId === booking.id ? (
                            <>
                              <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                              Processing...
                            </>
                          ) : (
                            'Pay Deposit'
                          )}
                        </button>
                      )}
                      <div className="flex flex-col gap-3">
                        {confirmCancelId === booking.id ? (
                          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 space-y-3">
                            <p className="text-xs text-red-400 font-bold text-center">Are you sure you want to cancel?</p>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleCancel(booking.id)}
                                disabled={cancelingBookingId === booking.id}
                                className="flex-1 py-2 bg-red-500 text-white rounded-lg text-xs font-bold hover:bg-red-600 transition-all disabled:opacity-50"
                              >
                                {cancelingBookingId === booking.id ? 'Canceling...' : 'Yes, Cancel'}
                              </button>
                              <button
                                onClick={() => setConfirmCancelId(null)}
                                className="flex-1 py-2 bg-white/5 text-white rounded-lg text-xs font-bold hover:bg-white/10 transition-all"
                              >
                                No, Keep
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmCancelId(booking.id)}
                            className="w-full py-3 bg-white/5 border border-white/10 text-white rounded-xl font-bold hover:bg-red-500/20 hover:border-red-500/50 transition-all"
                          >
                            Cancel Booking
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </section>

          {/* Past Section */}
          <section>
            <h2 className="text-2xl font-serif mb-6 text-gray-500">Past & <span className="italic">Canceled</span></h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-60 grayscale hover:grayscale-0 transition-all">
              {pastBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-zinc-900/30 border border-white/5 rounded-3xl p-6"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] uppercase tracking-widest">
                      {getStatusIcon(booking.status)}
                      <span>{booking.status}</span>
                    </div>
                    <span className="text-gray-600 text-xs">ID: {booking.id.slice(0, 8)}</span>
                  </div>
                  <div className="space-y-3 text-sm text-gray-500">
                    <div className="flex items-center gap-3">
                      <Calendar size={16} />
                      <span>{new Date(booking.bookingDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Users size={16} />
                      <span>{booking.guests} Guests — {booking.selectedMenu}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {activeTab === 'profile' && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="max-w-2xl bg-zinc-900/50 border border-white/10 rounded-[3rem] p-8 md:p-12"
        >
          <h2 className="text-3xl font-serif mb-8">Personal <span className="text-emerald-500 italic">Information</span></h2>
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-gray-500 ml-1">Email Address</label>
                <div className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-gray-300">
                  {user?.email}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-gray-500 ml-1">Account Status</label>
                <div className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-emerald-500 font-bold">
                  Verified Member
                </div>
              </div>
            </div>
            <div className="p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-3xl">
              <h3 className="text-emerald-500 font-bold mb-2">Security</h3>
              <p className="text-sm text-gray-400 mb-4">Your account is secured via Firebase Authentication. Your data is protected by industry-standard protocols.</p>
              <button className="text-xs font-bold uppercase tracking-widest text-white hover:text-emerald-500 transition-colors">
                Request Security Update
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'rewards' && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-8"
        >
          <div className="bg-gradient-to-br from-emerald-500/20 to-transparent border border-emerald-500/20 rounded-[3rem] p-12 relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 bg-emerald-500 text-black rounded-2xl">
                  <Star size={32} fill="currentColor" />
                </div>
                <div>
                  <h2 className="text-4xl font-serif">Sora <span className="italic">Gold Member</span></h2>
                  <p className="text-emerald-500 font-bold tracking-widest uppercase text-xs">Exclusive Tier</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                <div className="bg-black/40 backdrop-blur-md rounded-3xl p-6 border border-white/10">
                  <p className="text-gray-500 text-xs uppercase tracking-widest mb-2">Points Balance</p>
                  <p className="text-3xl font-serif">2,450 <span className="text-sm font-sans text-emerald-500">pts</span></p>
                </div>
                <div className="bg-black/40 backdrop-blur-md rounded-3xl p-6 border border-white/10">
                  <p className="text-gray-500 text-xs uppercase tracking-widest mb-2">Next Reward</p>
                  <p className="text-3xl font-serif">550 <span className="text-sm font-sans text-gray-500">to go</span></p>
                </div>
                <div className="bg-black/40 backdrop-blur-md rounded-3xl p-6 border border-white/10">
                  <p className="text-gray-500 text-xs uppercase tracking-widest mb-2">Visits This Year</p>
                  <p className="text-3xl font-serif">4</p>
                </div>
              </div>
            </div>
            <div className="absolute -right-20 -bottom-20 opacity-5">
              <Star size={400} fill="currentColor" className="text-emerald-500" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-zinc-900/50 border border-white/10 rounded-[2rem] p-8">
              <h3 className="text-xl font-serif mb-6">Available <span className="text-emerald-500 italic">Perks</span></h3>
              <ul className="space-y-4">
                {[
                  'Priority booking for seasonal truffle menu',
                  'Complimentary welcome sake for you and your guests',
                  'Access to the secret "Chef\'s Counter" reservations',
                  '10% points back on all beverage pairings'
                ].map((perk, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-400">
                    <CheckCircle className="text-emerald-500 mt-1 shrink-0" size={16} />
                    {perk}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-zinc-900/50 border border-white/10 rounded-[2rem] p-8">
              <h3 className="text-xl font-serif mb-6">Recent <span className="text-emerald-500 italic">Activity</span></h3>
              <div className="space-y-4">
                {[
                  { label: 'Omakase Dinner', pts: '+450', date: 'Mar 12, 2026' },
                  { label: 'Sake Pairing Bonus', pts: '+120', date: 'Mar 12, 2026' },
                  { label: 'Birthday Celebration Reward', pts: '+500', date: 'Feb 20, 2026' }
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                    <div>
                      <p className="text-sm font-bold">{item.label}</p>
                      <p className="text-[10px] text-gray-500">{item.date}</p>
                    </div>
                    <span className="text-emerald-500 font-bold">{item.pts}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Dashboard;
