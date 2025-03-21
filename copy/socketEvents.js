import {v4 as uuidv4} from 'uuid'
import {createGame,joinRoom,deleteClient, addChat} from '../services/gameServices.js'
const activeUsers=new Map();
const rooms={};
const socketEvents = (io) => {
  io.on('connection', (socket) => {
    console.log('New connection:', socket.id);

    // ----- Player Initialization -----
    socket.on('initializePlayer', () => {
      const playerId = uuidv4();
      socket.emit('createdPlayer', playerId);
    });

    // ----- Create Room -----
    socket.on('create-room',async(playerId)=>{
      console.log('Request for game creation');
      try {
        const game = await createGame(playerId);
        if (game) {
          console.log('Game created');
          const roomId = game._id.toString();
          rooms[roomId]=game;
          socket.emit('created-room', roomId);
        }
      } catch (error) {
        console.log('Error during room creation:', error);
      }
    });

    // ----- Join Room -----
    socket.on('join-room', async ({ roomId, playerId }, callback) => {
      try {
        const response = await joinRoom({ roomId, playerId });
        if (response) {
          const { room, username: joinedPlayerUsername } = response;
          activeUsers.set(playerId, joinedPlayerUsername);
          if (room) {
            room[roomId]=room;
            console.log('Room joined:', roomId);
            socket.join(roomId);
            socket.to(roomId).emit('chat',{sender:"server",messageContent:`User:${joinedPlayerUsername} joined the Game!`})
            // Store room and player info on the socket for later events
            socket.data = { roomId, playerId,username:joinedPlayerUsername};

            // Notify other players in the room
            socket.to(roomId).emit('playerJoined', { playerId, username: joinedPlayerUsername });
            socket.emit('room-joined', { playerId, username: joinedPlayerUsername });
            socket.emit('playersList', Array.from(activeUsers));
            socket.emit('chat-list',{chats:room.chatMessages});
            callback(null, { status: 'ok' });
          } else {
            callback(new Error('Room does not exist'));
          }
        } else {
          callback(new Error('Failed to join room'));
        }
      } catch (error) {
        console.error('Error joining room:', error);
        callback(error);
      }
    });

    // ----- Drawing Events -----  
    // Registered once per connection, using the stored roomId from join-room.
    socket.on('startDrawing', ({ offsetX, offsetY }) => {
      const roomId = socket.data?.roomId;
      if (roomId) {
        socket.to(roomId).emit('startDrawing', { offsetX, offsetY });
      }
    });

    socket.on('draw', ({ offsetX, offsetY }) => {
      const roomId = socket.data?.roomId;
      if (roomId) {
        socket.to(roomId).emit('draw', { offsetX, offsetY });
      }
    });

    socket.on('stoppedDrawing', () => {
      const roomId = socket.data?.roomId;
      if (roomId) {
        socket.to(roomId).emit('stoppedDrawing');
      }
    });

    // ----- Disconnect Event -----
    socket.on('disconnect', async () => {
      const { roomId, playerId,username } = socket.data || {};
      try {
        if (playerId) {
          activeUsers.delete(playerId);
        }
        await deleteClient({playerId});
        if (roomId && playerId) {
          console.log('Client disconnected:', socket.id);
          socket.to(roomId).emit('chat',{sender:"server",messageContent:`User:${username} left the Game!`})
          socket.to(roomId).emit('playerDisconnected', playerId);
        }
      } catch (error) {
        console.log('Error during disconnect cleanup:', error);
      }
    });

    // ----- Chat Event -----
    socket.on('chat', async(message) => {
      io.to(message.roomId).emit('chat', message);
      await addChat({roomId:message.roomId,sender:message.sender,messageContent:message.messageContent});
      return;
    });
    socket.on('start-game',async({roomId})=>{
      const room=rooms[roomId];
      room.currentRound=1;
    })
  });
};

export default socketEvents;