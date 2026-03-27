import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

let socketInstance = null;

// Returns the shared socket, creating it once per session
const getSocket = () => {
  if (!socketInstance) {
    const token = localStorage.getItem('token');
    socketInstance = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
      auth: { token },
      autoConnect: true,
      reconnection: true,
    });
  }
  return socketInstance;
};

export const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
};

// useSocket(eventName, handler) — subscribes to one event, cleans up on unmount
const useSocket = (event, handler) => {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const socket = getSocket();
    const fn = (data) => handlerRef.current(data);
    socket.on(event, fn);
    return () => socket.off(event, fn);
  }, [event]);
};

export default useSocket;
