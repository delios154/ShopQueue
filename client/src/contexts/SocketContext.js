import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const newSocket = io(process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000');
    
    newSocket.on('connect', () => {
      console.log('Connected to server');
      setConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setConnected(false);
    });

    newSocket.on('queue-updated', (data) => {
      toast.success(`Queue updated: ${data.newBooking?.customer} joined`);
    });

    newSocket.on('booking-status-updated', (data) => {
      toast.info(`Booking ${data.queueNumber} status: ${data.status}`);
    });

    newSocket.on('booking-cancelled', (data) => {
      toast.info(`Booking ${data.queueNumber} was cancelled`);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const joinShop = (shopId) => {
    if (socket) {
      socket.emit('join-shop', shopId);
    }
  };

  const joinQueue = (queueId) => {
    if (socket) {
      socket.emit('join-queue', queueId);
    }
  };

  const value = {
    socket,
    connected,
    joinShop,
    joinQueue,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};