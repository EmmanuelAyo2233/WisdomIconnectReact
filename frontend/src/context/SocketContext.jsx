import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (user) {
      // Connect to the /chat namespace as specified in docs
      const token = localStorage.getItem('activeToken') || '';
      const newSocket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000/chat', {
        withCredentials: true,
        transports: ['websocket', 'polling'],
        auth: { token },
      });

      newSocket.on('connect', () => {
        console.log('Socket connected');
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    } else {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
