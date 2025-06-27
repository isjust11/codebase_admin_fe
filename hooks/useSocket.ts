// import { useEffect, useRef } from 'react';
// import { io, Socket } from 'socket.io-client';

// const SOCKET_SERVER_URL = 'http://localhost:4000';

// export const useSocket = () => {
//   const socketRef = useRef<Socket | null>(null);

//   useEffect(() => {
//     // Khởi tạo kết nối socket
//     socketRef.current = io(SOCKET_SERVER_URL, {
//       withCredentials: true,
//       transports: ['websocket', 'polling'], // or just ['websocket']
//     });
    
//     socketRef.current.on("initial_headers", (headers, req) => {
//       headers["Access-Control-Allow-Origin"] = process.env.CLIENT_URL || 'http://localhost:3000';
//       headers["Access-Control-Allow-Credentials"] = "true";
//     });
//     // Cleanup khi component unmount
//     return () => {
//       if (socketRef.current) {
//         socketRef.current.disconnect();
//       }
//     };
//   }, []);

//   const joinRoom = (room: string) => {
//     if (socketRef.current) {
//       socketRef.current.emit('joinRoom', room);
//     }
//   };

//   const leaveRoom = (room: string) => {
//     if (socketRef.current) {
//       socketRef.current.emit('leaveRoom', room);
//     }
//   };

//   const subscribeToEvent = (event: string, callback: (data: any) => void) => {
//     if (socketRef.current) {
//       socketRef.current.on(event, callback);
//     }
//   };

//   const unsubscribeFromEvent = (event: string, callback: (data: any) => void) => {
//     if (socketRef.current) {
//       socketRef.current.off(event, callback);
//     }
//   };

//   return {
//     socket: socketRef.current,
//     joinRoom,
//     leaveRoom,
//     subscribeToEvent,
//     unsubscribeFromEvent,
//   };
// }; 