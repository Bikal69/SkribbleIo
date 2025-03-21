import React, { useEffect, useState } from 'react'

const MessageList = ({socket,currentRoomId,currentPlayer,roundStarted,messages}) => {
console.log('roundStarted:',roundStarted)
  const [messageText,setMessageText]=useState('');
  const sendMessage=(message)=>{
    const messageSchema={
      type:'chat',
      id:Date.now()+Math.random(),
      sender:currentPlayer.username,
      roomId:currentRoomId,
      message:message
    }
    socket.emit('CHAT-MSG',messageSchema);
  }
  useEffect(()=>{
    socket.on();
    return()=>{
    }
  },[socket])
  return (
    <>
    <div className='messageList'>
        <ul>
          {messages.length>0?messages.map((message)=>(
              <li key={message.id}>{message.sender}:{message.message}</li>
          )):<p>Oops no chat yet:(</p>}
        </ul>
    <div className="messageBox">
      <input type="text"  id="messageBox" disabled={!roundStarted} onChange={(e)=>setMessageText(e.target.value)} onKeyDown={(e)=>{
        if(e.key==='Enter'){
          console.log('enter pressed')
          sendMessage(messageText);
          setMessageText('');
          e.target.value='';
        }
      }} />
    </div>   
    </div>
    </>
  )
}

export default MessageList