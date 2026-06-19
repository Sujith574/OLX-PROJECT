import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBell, FiCheck, FiTrash2 } from 'react-icons/fi';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getNotifications, markAllRead, markOneRead, deleteNotification as deleteNotif } from '../services/messageService';
import useNotificationStore from '../store/notificationStore';
import { formatDistanceToNow } from 'date-fns';
import Spinner from './ui/Spinner';

const NotificationBell = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const ref = useRef(null);
  const qc = useQueryClient();
  const { setNotifications, markAllRead: markAllReadLocal, removeNotification } = useNotificationStore();
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const notifications = useNotificationStore((s) => s.notifications);

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await getNotifications();
      setNotifications(res.data.notifications, res.data.unreadCount);
      return res.data;
    },
    refetchInterval: 30000,
  });

  const markAllMutation = useMutation({
    mutationFn: markAllRead,
    onSuccess: () => { markAllReadLocal(); qc.invalidateQueries(['notifications']); },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteNotif,
    onSuccess: (_, id) => { removeNotification(id); },
  });

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setIsOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const typeIcons = {
    claim_submitted: '📋',
    claim_approved:  '✅',
    claim_rejected:  '❌',
    item_resolved:   '🎉',
    new_message:     '💬',
    system:          '🔔',
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg text-dark-400 hover:text-dark-50 hover:bg-dark-700/50 transition-all"
        aria-label="Notifications"
        id="notification-bell-btn"
      >
        <FiBell size={20} />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-error text-white text-xs rounded-full flex items-center justify-center font-bold"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 glass-card border border-dark-600/50 z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-dark-600/50">
              <h3 className="font-semibold text-dark-50 text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllMutation.mutate()}
                  className="flex items-center gap-1 text-xs text-primary-400 hover:text-primary-300 transition-colors"
                >
                  <FiCheck size={12} /> Mark all read
                </button>
              )}
            </div>

            {/* Notifications list */}
            <div className="max-h-80 overflow-y-auto">
              {isLoading ? (
                <div className="py-8 flex justify-center"><Spinner /></div>
              ) : notifications.length === 0 ? (
                <div className="py-10 text-center">
                  <FiBell className="mx-auto mb-2 text-dark-600" size={28} />
                  <p className="text-dark-500 text-sm">No notifications</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n._id}
                    className={`flex items-start gap-3 px-4 py-3 border-b border-dark-700/30 hover:bg-dark-600/30 transition-colors ${!n.isRead ? 'bg-primary-500/5' : ''}`}
                  >
                    <span className="text-lg mt-0.5 flex-shrink-0">{typeIcons[n.type] || '🔔'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-dark-50 leading-tight">{n.title}</p>
                      <p className="text-xs text-dark-400 mt-0.5 leading-relaxed">{n.message}</p>
                      <p className="text-xs text-dark-600 mt-1">
                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteMutation.mutate(n._id)}
                      className="flex-shrink-0 text-dark-600 hover:text-error transition-colors mt-0.5"
                    >
                      <FiTrash2 size={13} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t border-dark-600/50">
              <Link
                to="/dashboard?tab=notifications"
                onClick={() => setIsOpen(false)}
                className="text-xs text-primary-400 hover:text-primary-300 transition-colors"
              >
                View all notifications →
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
