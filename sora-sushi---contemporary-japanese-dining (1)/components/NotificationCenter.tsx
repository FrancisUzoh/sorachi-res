
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, CheckCircle, AlertCircle, Info, Trash2 } from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, where, orderBy, onSnapshot, updateDoc, doc, deleteDoc } from 'firebase/firestore';

interface NotificationCenterProps {
  user: any;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      const path = 'notifications';
      const q = query(
        collection(db, path),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const notifs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setNotifications(notifs);
        setUnreadCount(notifs.filter((n: any) => !n.read).length);
      }, (err) => {
        handleFirestoreError(err, OperationType.LIST, path);
      });

      return () => unsubscribe();
    }
  }, [user]);

  const markAsRead = async (id: string) => {
    const path = `notifications/${id}`;
    try {
      const notifRef = doc(db, 'notifications', id);
      await updateDoc(notifRef, { read: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  const deleteNotification = async (id: string) => {
    const path = `notifications/${id}`;
    try {
      await deleteDoc(doc(db, 'notifications', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return < CheckCircle className="text-emerald-500" size={16} />;
      case 'warning': return <AlertCircle className="text-yellow-500" size={16} />;
      case 'error': return <AlertCircle className="text-red-500" size={16} />;
      default: return <Info className="text-blue-500" size={16} />;
    }
  };

  if (!user) return null;

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-300 hover:text-white transition-colors bg-white/5 rounded-xl border border-white/10"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-black border-2 border-[#0a0a0a]">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)} 
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-4 w-80 md:w-96 bg-zinc-900 border border-white/10 rounded-[2rem] shadow-2xl z-50 overflow-hidden"
            >
              <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
                <h3 className="font-serif text-lg">Notifications</h3>
                <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-white">
                  <X size={18} />
                </button>
              </div>

              <div className="max-h-[400px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-12 text-center">
                    <Bell className="mx-auto mb-4 text-gray-600" size={32} />
                    <p className="text-gray-500 text-sm">No notifications yet</p>
                  </div>
                ) : (
                  <div className="divide-y divide-white/5">
                    {notifications.map((notification) => (
                      <div 
                        key={notification.id}
                        className={`p-5 transition-colors hover:bg-white/5 relative group ${!notification.read ? 'bg-emerald-500/5' : ''}`}
                        onClick={() => !notification.read && markAsRead(notification.id)}
                      >
                        <div className="flex gap-4">
                          <div className="mt-1">{getIcon(notification.type)}</div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-1">
                              <h4 className={`text-sm font-bold ${!notification.read ? 'text-white' : 'text-gray-300'}`}>
                                {notification.title}
                              </h4>
                              <span className="text-[10px] text-gray-500">
                                {notification.createdAt?.toDate ? notification.createdAt.toDate().toLocaleDateString() : 'Just now'}
                              </span>
                            </div>
                            <p className="text-xs text-gray-400 leading-relaxed">
                              {notification.message}
                            </p>
                          </div>
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                          className="absolute right-4 bottom-4 p-1 text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {notifications.length > 0 && (
                <div className="p-4 bg-white/5 border-t border-white/10 text-center">
                  <button 
                    onClick={() => {
                      notifications.forEach(n => !n.read && markAsRead(n.id));
                    }}
                    className="text-xs text-emerald-500 font-bold hover:underline"
                  >
                    Mark all as read
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationCenter;

