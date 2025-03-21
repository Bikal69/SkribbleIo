import UserList from "@features/game/component/UserList.jsx"
import DrawingBoard from "../features/game/component/DrawingBoard.jsx"
import MessageList from "../features/game/component/MessageList.jsx"
import {useParams} from 'react-router-dom';
import {useSocket} from "../services/socket.jsx";
import './game.css'
import { useEffect, useRef, useState } from "react"
import {storage} from '../utils/utils.js'
import GameState from "../features/game/component/GameState.jsx";
import {useSocketEvents} from '../hooks/useSocketEvents.jsx'
const Game = () => {
const {socket,socketReady}=useSocket();
  console.log('soket:',socket.id)
  const {room_id} =useParams();
  const [joinedRoom,setJoinedRoom]=useState(false);
const [currentPlayer,setCurrentPlayer]=useState({id:storage.get('playerId')});
const [players,setPlayers]=useState([]);
const [roundInfo,setRoundInfo]=useState(null);
const [timer,setTimer]=useState(null);
const [messages,setMessages]=useState([]);
const timerInterval=useRef(null);
console.log('timer:',timer);
console.log('roundInfo:',roundInfo)
const handlePlayerJoined = ({id:joinedPlayerId,username,isHost,score}) => {
  setPlayers((prevPlayers)=>{
    if(prevPlayers?.some((player)=>player.id===joinedPlayerId)){
      return prevPlayers;
    } else{
      return [...prevPlayers,{id:joinedPlayerId,username,isHost,score}]
    }
    
  })
};

const handlePlayerDisconnected = ({id}) => {
  console.log('player left:',id)
  setPlayers((prevPlayers) =>
    prevPlayers.filter((player) => player.id !== id)
);
};
const handleRoundStart=(roundInfo)=>{
  console.log('round started:',roundInfo)
  setRoundInfo(roundInfo);
  const {roundTime,startTime}=roundInfo;
  const timeDifference=Math.round((new Date().getTime() - startTime)/1000);
  console.log('timeDiff is:',timeDifference);
  setTimer(roundTime-timeDifference);
  if(timerInterval.current){
    clearInterval(timerInterval.current);
  }
timerInterval.current=setInterval(()=>{
      setTimer(prevTime => prevTime > 0 ? prevTime - 1 : 0);
  },1000);
}
const handleChatMsg=({type,sender,message})=>{
  console.log('message received')
  setMessages((prevMessages)=>[...prevMessages,{sender,message}]);
};

useEffect(() => {

  if(!socketReady) return;
    console.log("joined room:", joinedRoom)
    if(!joinedRoom&&currentPlayer.id){
      console.log('emitting join-room')
      socket.emit('JOIN-ROOM',room_id);
    }

}, [currentPlayer?.id, joinedRoom, socketReady, socket])

useEffect(()=>{
  //event handlers for events
const eventHandlers = {
  'PLAYER-JOINED': handlePlayerJoined,
  'PLAYER-LEFT': handlePlayerDisconnected,
  'PLAYERS-LIST': (players) => {
    setPlayers((prevPlayers)=>{
    let newArray=players.filter((player)=>!prevPlayers.some((prevPlayer)=>prevPlayer.id===player.id));
    return [...prevPlayers,...newArray];
  });
  },
  'ROOM-JOINED':(Player)=>{
    console.log('roomjoined:',Player)
    setCurrentPlayer(Player);
  setJoinedRoom(true);
  },
  'CHAT-MSG':handleChatMsg,
  'GAME-STARTED':()=>{},
  'GAME-END':()=>{},
  'ROUND-START':handleRoundStart,
  'ROUND-START-ARTIST':(wordToDraw)=>{
   setRoundInfo((prevInfo)=>({...prevInfo,wordToGuess:wordToDraw}));
  },
  'WORD-REVEAL':(word)=>{
    console.log('wordREveal:',word)
    setRoundInfo((prevInfo)=>({...prevInfo,wordToGuess:word}));
  },
  'ROUND-END':()=>{ 
    console.log('round end')
    if(timerInterval.current){
      clearInterval(timerInterval.current);
      timerInterval.current=null;
    }
    setTimer(0);
    setRoundInfo((prevInfo)=>({...prevInfo,isActive:false}));
  },
  'ROUND-INFO':(roundInfoFromServer)=>{
  console.log('round info',roundInfoFromServer);
  const{chats,...roundInfo}=roundInfoFromServer;
  setRoundInfo(roundInfo);
  setMessages((prevMessages)=>[...prevMessages,chats]);
  },
  'ROUND-SCORES':()=>{
    clearInterval(timerInterval.current);
  },
  'TOTAL-SCORES':()=>{
  
  }
  };
useSocketEvents(socket,socketReady,eventHandlers);
// Cleanup the event listeners when the component unmounts
  return () => {
    if(timerInterval.current){
      clearInterval(timerInterval.current)
    }

  };
},[socket,socketReady]);
  return joinedRoom?(
    <div className="game-page">
      <div className="left-col">
        <GameState timer={timer} roundInfo={roundInfo}/>
        <UserList socket={socket} currentRoomId={room_id} currentPlayer={currentPlayer} players={players}/>
      </div>
        <DrawingBoard socket={socket} currentRoomId={room_id} playerId={currentPlayer.id} artistId={roundInfo?.artistId}/>
        <MessageList socket={socket} currentRoomId={room_id} currentPlayer={currentPlayer} roundStarted={roundInfo?roundInfo.isActive:false} messages={messages}/>
    </div>
  ):(<p>Oops the roomId is invalid!</p>)
}

export default Game