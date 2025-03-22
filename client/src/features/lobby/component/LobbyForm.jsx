import {  useEffect, useState } from "react"
 import "./styles.css";
import { useAsyncError, useNavigate } from "react-router-dom";
import {} from '@utils/utils.js'
import { storage } from "../../../utils/utils.js";
const LobbyForm = ({socket}) => {
const [playerName,setPlayerName]=useState(''); 
    //create room
    const createRoom=()=>{
        socket.emit('CREATE-ROOM');
    };
    
  return (
    <div className="container">
            <input type="text" name="playerName" placeholder="Enter your InGame Name" onChange={(e)=>setPlayerName(e.target.value)}/>
            <button>Play</button>
            <button onClick={createRoom}>Create room</button>
    </div>
  )
}

export default LobbyForm