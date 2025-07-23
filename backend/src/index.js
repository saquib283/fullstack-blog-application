// import connectDB from "./db/index.js";
// import dotenv from "dotenv";
// import { app } from "./app.js"

// dotenv.config({
//     path:'./.'
// })

// connectDB()
// .then(()=>{
//     app.listen(process.env.PORT || 8000 , ()=>{
//         console.log(`Server listening on ${process.env.PORT || 8000}`);
//     })
// })
// .catch()









import http from 'http';
import { Server } from 'socket.io';
import { initializeSocket } from './config/socket.js'; 
import connectDB from './db/index.js';
import dotenv from 'dotenv';
import { app } from './app.js';

dotenv.config({
    path: './.env'
});

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    },
});

initializeSocket(io); // 👈 Attach socket handlers

connectDB()
    .then(() => {
        server.listen(process.env.PORT || 8000, () => {
            console.log(`🚀 Server running at ${process.env.PORT || 8000}`);
        });
    })
    .catch((err) => {
        console.error('❌ DB Connection failed:', err);
    });
