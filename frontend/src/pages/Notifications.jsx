import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { notificationService } from '../api/services';
import { Bell, Calendar, CheckCircle, XCircle, Info, RefreshCw, AlertCircle, Clock } from 'lucide-react';
import { formatDistanceToNow, parseISO } from 'date-fns';

const NotificationIcon = ({ type }) => {
  switch (type) {
    case 'booking':
      return <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600"><Calendar size={20} /></div>;
    case 'update':
      return <div className="h-10 w-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-600"><RefreshCw size={20} /></div>;
    case 'system':
      return <div className="h-10 w-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-600"><Info size={20} /></div>;
    default:
      return <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary"><Bell size={20} /></div>;
  }
};

const getNotificationColor = (message) => {
  const lowercaseMsg = message.toLowerCase();
  if (lowercaseMsg.includes('accepted')) return 'bg-green-50 border-green-200';
  if (lowercaseMsg.includes('declined') || lowercaseMsg.includes('rejected') || lowercaseMsg.includes('❌')) return 'bg-red-50 border-red-200';
  if (lowercaseMsg.includes('rescheduled') || lowercaseMsg.includes('🔄')) return 'bg-orange-50 border-orange-200';
  if (lowercaseMsg.includes('booking request') || lowercaseMsg.includes('📅')) return 'bg-blue-50 border-blue-200';
  return 'bg-white border-gray-100';
};

const Notifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await notificationService.getNotifications();
      if (res.data?.data) {
        setNotifications(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            Notifications 
            {unreadCount > 0 && (
              <span className="bg-primary text-white text-xs px-2.5 py-0.5 rounded-full font-bold">
                {unreadCount} New
              </span>
            )}
          </h1>
          <p className="text-sm text-gray-500 mt-1">Stay updated on your mentorship activities</p>
        </div>

        {unreadCount > 0 && (
          <button 
            onClick={handleMarkAllAsRead}
            className="text-sm font-semibold text-primary hover:text-primary/80 bg-primary/5 hover:bg-primary/10 px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <CheckCircle size={16} /> Mark all as read
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col gap-4 animate-pulse">
           {[...Array(4)].map((_, i) => (
             <div key={i} className="h-24 bg-gray-100 rounded-xl w-full" />
           ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-16 bg-white border border-gray-100 rounded-2xl shadow-sm">
          <div className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <Bell size={28} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">All caught up!</h3>
          <p className="text-gray-500 mt-2 max-w-sm mx-auto text-sm">
            You don't have any notifications right now. When you do, they'll show up here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={notification.id}
              className={`relative overflow-hidden p-5 flex gap-4 rounded-xl border transition-all ${
                !notification.isRead 
                  ? 'bg-white border-primary/20 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]' 
                  : 'bg-gray-50/50 border-gray-100 shadow-none'
              } ${getNotificationColor(notification.message)}`}
            >
              {!notification.isRead && (
                <div className="absolute top-0 left-0 bottom-0 w-1 bg-primary border-t border-b border-l border-primary/20 rounded-l-xl" />
              )}
              
              <div className="shrink-0 mt-1">
                 <NotificationIcon type={notification.type} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2 mb-1">
                  <p className={`text-[15px] leading-snug ${!notification.isRead ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                    {notification.message}
                  </p>
                </div>
                
                <div className="flex items-center gap-3 mt-2 text-xs font-semibold text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                  </span>
                  
                  {!notification.isRead && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                      <button 
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="text-primary hover:underline font-bold"
                      >
                        Mark as read
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
