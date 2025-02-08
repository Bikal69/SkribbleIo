import { useEffect, useState } from "react"
import "./styles.css"
const LobbyForm = () => {
    const [playerName,setPlayerName]=useState('');
    useEffect(()=>{
        console.log(playerName)

    },[playerName])
  return (
    <div className="container">
            <input type="text" name="playerName" placeholder="Enter your InGame Name" onChange={(e)=>setPlayerName(e.target.value)}/>
            <button>Play</button>
            <button>Create room</button>
    </div>
  )
}

export default LobbyForm