import {  useEffect, useState } from "react"
 import "./styles.css";
import { useAsyncError, useNavigate } from "react-router-dom";
import {} from '@utils/utils.js'
import { storage } from "../../../utils/utils.js";
const LobbyForm = ({socket}) => {
    const [playerName,setPlayerName]=useState('');
    const [playerId,setPlayerId]=useState();
    const navigate=useNavigate();
    //create room
    const createRoom=()=>{
        socket.emit('CREATE-ROOM');
    };
    useEffect(()=>{
      //events listners
        socket.on('CREATED-ROOM',(roomIndex)=>{
          console.log('game created:',roomIndex)
          navigate(`/game/${roomIndex}`);
        });
        
      socket.on('PLAYERID',(playerId)=>{
        console.log('playerid received:',playerId)
        storage.set('playerId',playerId)
        setPlayerId(playerId);
      })

      return ()=>{
        socket.off('CREATED-ROOM');
      }

    },[socket])
    
  return (
    <div className="container">
            <input type="text" name="playerName" placeholder="Enter your InGame Name" onChange={(e)=>setPlayerName(e.target.value)}/>
            <button>Play</button>
            <button onClick={createRoom}>Create room</button>
    </div>
  )
}

export default LobbyForm