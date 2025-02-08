import express from 'express';
import { play } from './controller/play.controller.js';
import http from 'http'
import mongoose from 'mongoose';
import {Server} from 'socket.io'
const app=express();
const server=http.createServer(app);
app.post('/play/:roomId',play);
const io=new Server(server);

mongoose.connect('mongodb://127.0.0.1:27017/skribble').then(()=>console.log('successfully connected to database'));

app.listen(5000,()=>{
    console.log('server listening at:5000 port');
})