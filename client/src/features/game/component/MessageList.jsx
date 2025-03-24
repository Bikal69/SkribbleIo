import React, { useEffect, useState,useRef} from 'react'

const MessageList = ({socket,currentRoomId,currentPlayer,roundStarted,messages}) => {
console.log('roundStarted:',roundStarted)
  const [messageText,setMessageText]=useState('');
  const messagesEndRef=useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // Effect to scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage=(message)=>{
    console.log('sending message:',currentPlayer.username)
    const messageSchema={
      type:'chat',
      id:Date.now()+Math.random(),
      senderId:currentPlayer.id,
      senderUsername:currentPlayer.username,
      message:message
    }
    socket.emit('CHAT-MSG',messageSchema);
  }
  useEffect(()=>{
    return()=>{
    }
  },[socket])
  return (
  <>
    <div className='messageList'>
      <div className="messages">
      <ul>
          {messages.length>0?messages.map((message)=>(
              <li key={message.id} style={{color:message.type==='good'?'green':'red'}}>{
                message.senderUsername==='server'?(<p style={{fontWeight:'bold'}}>{message.message}</p>):(<p style={{color:'black'}}>{message.senderUsername+':'+message.message}</p>)
              }</li>
          )):<p>Oops no chat yet:(</p>}
        </ul>
        {/* ref to bottom of messages div */}
        <div  ref={messagesEndRef}/> 
      </div>
      <div className="messageBox">
          <input type="text"  id="messageBox" disabled={!roundStarted} onChange={(e)=>setMessageText(e.target.value)} onKeyDown={(e)=>{
            if(e.key==='Enter'){
            sendMessage(messageText);
            setMessageText('');
            e.target.value='';
            }
          }} />
      </div >   
    </div>
  </>
  )
}

export default MessageList