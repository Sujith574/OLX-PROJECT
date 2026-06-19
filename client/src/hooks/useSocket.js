import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import useAuthStore from '../store/authStore';
import useNotificationStore from '../store/notificationStore';
import toast from 'react-hot-toast';
import { FiBell } from 'react-icons/fi';

let socketInstance = null;

const useSocket = () => {
  const { user, isAuthenticated } = useAuthStore();
  const { addNotification } = useNotificationStore();
  const socketRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

    if (!socketInstance) {
      socketInstance = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        withCredentials: true,
      });
    }

    socketRef.current = socketInstance;
    const socket = socketRef.current;

    socket.emit('join', user._id);

    socket.on('notification', (data) => {
      // Add to store
      addNotification({
        _id: Date.now().toString(),
        type: data.type,
        title: data.title,
        message: data.message,
        isRead: false,
        createdAt: new Date().toISOString(),
      });

      // Show toast
      toast(data.message, {
        icon: '🔔',
        style: {
          background: '#1e293b',
          color: '#f1f5f9',
          border: '1px solid #334155',
          borderRadius: '12px',
        },
      });
    });

    socket.on('new_message', (data) => {
      // Could trigger a refresh of the messages page
      window.dispatchEvent(new CustomEvent('new_message', { detail: data }));
    });

    socket.on('connect_error', (err) => {
      console.warn('Socket connection error:', err.message);
    });

    return () => {
      socket.off('notification');
      socket.off('new_message');
    };
  }, [isAuthenticated, user?._id]);

  const getSocket = () => socketRef.current || socketInstance;

  return { getSocket };
};

export default useSocket;
