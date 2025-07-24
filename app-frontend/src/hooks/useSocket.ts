'use client';

import { useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client'; 

const useSocket = () => {

    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

        const newSocket = io(socketUrl, {
            withCredentials: true,
        });

        newSocket.on('connect', () => {
            console.log('✅ Socket.IO connected:', newSocket.id);
        });

        newSocket.on('disconnect', (reason) => {
            console.log('❌ Socket.IO disconnected:', reason);
        });

        newSocket.on('connect_error', (error) => {
            console.error('⚠️ Socket.IO connection error:', error);
        });

        setSocket(newSocket);

        return () => {
            console.log('🧹 Disconnecting Socket.IO...');
            newSocket.disconnect();
        };
    }, []);

    return socket;
};

export default useSocket;