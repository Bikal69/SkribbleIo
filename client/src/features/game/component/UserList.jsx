import "./styles.css";
import React, { useEffect, useState } from 'react'

const UserList = ({socket,currentRoomId,currentPlayer,players,guessedPlayersId}) => {
  console.log('currentplayer',currentPlayer)
  return (
    <div className="userList">
      <ul>
      {players?.map((player)=>(
          <li key={player.id}>{currentPlayer.username===player.username?(<span style={{display:'inline-flex',flexDirection:"row",flexShrink:0}}><b style={{color:"red"}}>YOU-</b><p>{currentPlayer.username}</p></span>):player.username}</li>
        ))}
      </ul>

    </div>
  )
}
export default UserList