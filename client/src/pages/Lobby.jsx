// import LobbyForm from '@features/lobby/component/LobbyForm.jsx';
import LobbyForm from '../features/lobby/component/LobbyForm.jsx';
import { useSocket } from '../services/socket.jsx';
import { storage } from '../utils/utils.js';
import './lobby.css'
import { useEffect, useState } from 'react';
import { useSocketEvents } from '../hooks/useSocketEvents.jsx';
import { useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
const Lobby = () => {
 const { socket, socketReady } = useSocket();
 const [playerId,setPlayerId]=useState(storage.get('playerId'));
 const navigate=useNavigate();
 const eventHandlers=useMemo(()=>({
   'CREATED-ROOM':(roomIndex)=>{
     console.log('game created:',roomIndex)
     navigate(`/game/${roomIndex}`);
    },
    'PLAYERID':(playerId)=>{
      console.log('playerid received:',playerId)
      storage.set('playerId',playerId)
      setPlayerId(playerId);
    }
  }),[]);
  useSocketEvents(socket,socketReady,eventHandlers);
  return socketReady?(
    <div className='lobby-page'>
        <LobbyForm socket={socket} />
    </div>
  ):(<p>Wait loading....</p>)
}

export default Lobby