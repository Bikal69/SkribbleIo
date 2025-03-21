// import LobbyForm from '@features/lobby/component/LobbyForm.jsx';
import LobbyForm from '../features/lobby/component/LobbyForm.jsx';
import { useSocket } from '../services/socket.jsx';
import { storage } from '../utils/utils.js';
import './lobby.css'
import { useEffect, useState } from 'react';
const Lobby = () => {
 const { socket, socketReady } = useSocket();
 useEffect(()=>{
   console.log('socket:',socket)
    try{
      socket.on('PLAYERID',(playerId)=>{
        console.log('playerid received:',playerId)
        storage.set('playerId',playerId)
      })

    }catch(error){
      console.log('error occured at lobby:',error)
    }
  },[]);
  return socketReady?(
    <div className='lobby-page'>
        <LobbyForm socket={socket}/>
    </div>
  ):(<p>Wait loading....</p>)
}

export default Lobby