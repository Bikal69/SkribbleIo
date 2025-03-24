import UserList from "@features/game/component/UserList.jsx"
import DrawingBoard from "../features/game/component/DrawingBoard.jsx"
import MessageList from "../features/game/component/MessageList.jsx"
import {useParams} from 'react-router-dom';
import {useSocket} from "../services/socket.jsx";
import './game.css'
import { useEffect, useMemo, useRef, useState } from "react"
import {storage} from '../utils/utils.js'
import GameState from "../features/game/component/GameState.jsx";
const Game = () => {
const {socket,socketReady}=useSocket();
  console.log('soket:',socket.id)
  const {room_id} =useParams();
  const [joinedRoom,setJoinedRoom]=useState(false);
const [currentPlayer,setCurrentPlayer]=useState({id:storage.get('playerId')});
const [players,setPlayers]=useState([]);
const [guessedPlayersId,setGuessedPlayersId]=useState([]);
const [roundInfo,setRoundInfo]=useState(null);
const [timer,setTimer]=useState(null);
const [messages,setMessages]=useState([]);
const timerInterval=useRef(null);
function handlePlayerJoined({id:joinedPlayerId,username,isHost,score})  {
  console.log('timer interval:',timerInterval.current)
  setPlayers((prevPlayers)=>{
    if(prevPlayers?.some((player)=>player.id===joinedPlayerId)){
      return prevPlayers;
    } else{
      return [...prevPlayers,{id:joinedPlayerId,username,isHost,score}]
    }
    
  })
};

function handlePlayerDisconnected({id})  {
  console.log('player left:',id)
  setPlayers((prevPlayers) =>
    (prevPlayers.filter((player) => player.id !== id))
);
};
function handleRoundStart(roundInfo){
  console.log('new round started',roundInfo)
  setRoundInfo(roundInfo);
  if(timerInterval.current){
    clearInterval(timerInterval.current);
    timerInterval.current=null;
  }
  const {roundTime,startTime}=roundInfo;
  const timeDifference=Math.max(0,Math.round((new Date().getTime() - startTime)/1000));
  console.log('timeDiff is:',timeDifference);
  setTimer(roundTime-timeDifference);
  console.log('round-diff:',roundTime-timeDifference)
    timerInterval.current = setInterval(() => {
      console.log('from setinterval')
      setTimer((prevTime) => {
        console.log('prevTime is:',prevTime)
        // Stop the interval when timer reaches 0
        if (prevTime <= 1) {
          clearInterval(timerInterval.current);
          timerInterval.current = null;
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    console.log('from roundStart:tiemr ',timerInterval.current)
}
function handleChatMsg(chatMsg){
  console.log('message received',chatMsg)
  setMessages((prevMessages)=>[...prevMessages,chatMsg]);
};
const eventHandlers = {
  'PLAYERID':(playerId)=>{
    storage.set('playerId',playerId);
  },
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
  'ROUND-START-ARTIST':(roundInfo)=>{
    handleRoundStart(roundInfo);
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
    setMessages([]);
    setRoundInfo((prevInfo)=>({...prevInfo,isActive:false}));
  },
  'ROUND-INFO':(roundInfoFromServer)=>{
    const{chats,...roundInfo}=roundInfoFromServer;
    console.log('round info from server:',roundInfo);
    handleRoundStart(roundInfo);
    setMessages((prevMessages)=>[...prevMessages,...chats]);
  },
  'WORD-GUESSED':(playerId)=>{
    console.log('user guesed:')
    setGuessedPlayersId((prevPlayersId)=>[...prevPlayersId,playerId]);
  },
  'ROUND-SCORES':()=>{

  },
  'TOTAL-SCORES':()=>{
  
  },
  // 'START-DRAWING':handleStartDrawing,
  // 'DRAW':handleDrawing,
  // 'STOPPED-DRAWING':handleFinishDrawing
}
useEffect(() => {

  if(!socketReady) return;
    console.log("joined room:", joinedRoom)
    if(!joinedRoom){
      console.log('emitting join-room')
      socket.emit('JOIN-ROOM',room_id);
    }

  return ()=>{
  
  }

}, [currentPlayer?.id, joinedRoom, socketReady, socket]);
useEffect(()=>{
  Object.entries(eventHandlers).forEach(([event,handler])=>{
      socket.on(event,handler);
  });
  return ()=>{
      Object.entries(eventHandlers).forEach(([event,handler])=>{
          socket.off(event);
      });
      if(timerInterval.current){
        clearInterval(timerInterval.current)
        timerInterval.current=null;
      }
  }
  },[socket,socketReady])

  return joinedRoom?(
    <div className="game-page">
      <div className="left-col">
        <GameState timer={timer} roundInfo={roundInfo}/>
        <UserList socket={socket} currentRoomId={room_id} currentPlayer={currentPlayer} players={players} guessedPlayersId={guessedPlayersId}/>
      </div>
        <DrawingBoard socket={socket} currentRoomId={room_id} playerId={currentPlayer.id} artistId={roundInfo?.artistId} missedDrawingState={roundInfo?.drawingState}/>
        <MessageList socket={socket} currentRoomId={room_id} currentPlayer={currentPlayer} roundStarted={roundInfo?roundInfo.isActive:false} messages={messages}/>
    </div>
  ):(<p>Oops the roomId is invalid!</p>)
}

export default Game