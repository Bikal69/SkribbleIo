import {v4 as uuidv4} from 'uuid'
import {createGame,joinRoom,deleteClient, addChat} from '../services/gameServices.js'
import usernameGenerator from '../utils/usernameGenerator.js'
import GameRoom from '../Class/GameRoom.js'
import GameRound from '../Class/GameRound.js'
import User from '../Class/User.js';
import config from '../config/gameConfig.js'
import {wordHider} from '../helpers/gameHelper.js'
const rooms=[];
const socketEvents = (io) => {
  console.log('room length:',rooms.length)
  io.on('connection', (socket) => {
    console.log('sockets:',io.sockets.sockets.size)
    let {playerId}=socket.handshake.query?.data;
    if(!playerId){
      playerId=uuidv4();
      socket.emit('PLAYERID',playerId)
    }

    const user=new User(playerId,socket,usernameGenerator());
  socket.data.roomIndex=-1;
  socket.data.room=null;

    // ----- Create Room -----
    socket.on('CREATE-ROOM',async()=>{
      console.log('Request for game creation');
      socket.data.room=new GameRoom(io,user.id);
      rooms.push(socket.data.room);
      console.log('rooms',rooms.length)
      socket.data.roomIndex=rooms.length-1;
      socket.emit('CREATED-ROOM',socket.data.roomIndex);
        console.log('room created')
    });

    // ----- Join Room -----
    socket.on('JOIN-ROOM', async (roomIndexFromClient) => {
      if(roomIndexFromClient>rooms.length-1){
        console.log('oops the roomIndex is wrong');
      }
      socket.data.room=rooms[roomIndexFromClient];
      socket.data.roomIndex=roomIndexFromClient;
      socket.data.room.addPlayer(user);
      socket.join(socket.data.room.id);
      socket.emit('PLAYERS-LIST',socket.data.room.players.map((player)=>player.getUserInfo()));
      socket.emit('ROOM-JOINED',user.getUserInfo());
      if(socket.data.room.round?.isActive){
        console.log('round is active');
        const roundInfo=socket.data.room?.getRoundInfo();
        roundInfo.wordToGuess=wordHider(roundInfo.wordToGuess);
        socket.emit('ROUND-INFO',roundInfo);
      }
      if(!socket.data.room.round?.isActive&&socket.data.room.players.length>=config.MIN_PLAYERS){
        socket.data.room.startGame();
      }
    });

    // ----- Drawing Events -----  
    // Registered once per connection, using the stored roomId from join-room.
    socket.on('START-DRAWING', ({ offsetX, offsetY }) => {
      if (socket.data.room) {
        socket.to(socket.data.room.id).emit('START-DRAWING', { offsetX, offsetY });
        socket.data.room.round?.drawingState.push({'moveTo':{offsetX,offsetY}});
      }
    });

    socket.on('DRAW', ({ offsetX, offsetY }) => {
      if (socket.data.room.id) {
        socket.to(socket.data.room.id).emit('DRAW', { offsetX, offsetY });
        socket.data.room.round?.drawingState.push({'lineTo':{offsetX,offsetY}});
      }
    });

    socket.on('STOPPED-DRAWING', () => {
      if (socket.data.room?.id) {
        socket.to(socket.data.room?.id).emit('STOPPED-DRAWING');
        socket.data.room.round?.drawingState.push({'closePath':true});
      }
    });

    // ----- Disconnect Event -----
    socket.once('disconnect', async () => {
      console.log('roomindex:',socket.data.roomIndex)
      console.log('Client disconnected:', user.username);
      if(socket.data.roomIndex!==-1){
        socket.data.room.removePlayer(user);
      }
    });

    // ----- Chat Event -----
    socket.on('CHAT-MSG', async(message) => {
      socket.data.room?.broadcastChatMessage(message);
      socket.data.room.addChat(message);
      return 
    });
  });
}

export default socketEvents;