import {Server} from "socket.io";
const setupSocket=async(httpServer)=>{
const io=new Server(httpServer,{
    pingTimeout: 3000,     // Faster disconnect detection
    pingInterval: 5000,   // More frequent pings
    connectTimeout: 10000, 
    cors:{
        origin: ["http://localhost:5173"], // Allow frontend URL
        methods: ["GET", "POST"],
}});
(await import('../events/socketEvents.js')).default(io);
return io;
};
export default setupSocket;