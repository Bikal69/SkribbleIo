import express from 'express';
import { play } from './controller/play.controller.js';
import http from 'http'
import mongoose from 'mongoose';
import setupSocket from './config/socket.js';
import cookieParser from 'cookie-parser'
import cors from 'cors';
const app=express();
app.use(cookieParser())
app.use(cors(
    {
        origin:["http://localhost:5173","http://192.168.16.100:5173"],
        
    }
))
const server=http.createServer(app);
//database connection
mongoose.connect('mongodb://127.0.0.1:27017/skribble').then(()=>console.log('successfully connected to database'));
// app.get('/getCookie',(req,res)=>{
//     if(!req.cookies.cookie){
//         console.log('cookie doesnt exist');
//         const id=uuidv4();
//         if(id){
//            return  res.status(200).cookie('cookie',id,{
//             expires: new Date(Date.now() + (30*24*3600000)),  // 30 days in milliseconds   
//             secure: false,
//             httpOnly:true  // Optional: set to true for production
//            }).json({success:true});//for 30 daays
//         }
//     }
//     return res.status(400).json({success:false});
// })
//socket connection
const io= await setupSocket(server);

process.on('uncaughtException',(error)=>{
    console.log(`Error stack:${error.stack} and message:${error.message}`);
})
server.listen(5000,"0.0.0.0",()=>{
    console.log('server listening at:5000 port');
})

