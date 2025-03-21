import { generateUsername } from 'unique-username-generator';
import Game from '../model/game.model.js';
import usernameGenerator from '../utils/usernameGenerator.js';
export const createGame=async(playerId)=>{
    
    try{
      console.log('playerId',playerId)
        const game=new Game({
        players:[],
        host:playerId
    });
    await game.save();
    return game;
    }
    catch(error){
        console.log('error while creating game',error);
    }
};
export const joinRoom=async({roomId,playerId})=>{
    try{
      // Helper function to generate a unique username for a given room.
const generateUniqueUsername = async (roomId) => {
  // Fetch the game room and get current usernames.
  const gameRoom = await Game.findById(roomId).lean();
  if (!gameRoom) throw new Error("Room not found");
  
  const existingUsernames = gameRoom.players.map(player => player.username);
  
  // Generate a username and check if it already exists.
  let newUsername = usernameGenerator();
  while (existingUsernames.includes(newUsername)) {
    newUsername = usernameGenerator();
  }
  
  return newUsername;
};
      if(roomId&&playerId){
        const gameRoom = await Game.findOneAndUpdate(
          { _id: roomId },
          [
            {
              $set: {
                players: {
                  $cond: [
                    { $in: [playerId, "$players.playerId"] },
                    "$players",
                    {
                      $concatArrays: [
                        "$players",
                        [{ username:await generateUniqueUsername(roomId),playerId, isHost: { $eq: ["$host", playerId] },avatar: "",score: 0 }]
                      ]
                    }
                  ]
                }
              }
            }
          ],
          { new: true }
        ).lean();  
        const joinedPlayer=gameRoom.players.find((player)=>player.playerId===playerId);
        return {room:gameRoom,username:joinedPlayer.username};
      }else{
        console.log("oops roomId or playerId doesn't exist")
      }
    }catch(error){
        console.log('error while joining:',error)
    }
}
//remove client from game 
export const deleteClient=async({playerId,roomId})=>{
    try{
        const isClientDeleted=await Game.findByIdAndUpdate(
            roomId, 
            { $pull: { players: { playerId:playerId } } },
            {new:true}
          ) 
          return isClientDeleted;

    }catch(error){
        console.log('error in delete client:',error)
    }
}
//add chat to database
export const addChat=async({roomId,messageContent,sender})=>{
try{
const gameRoom=await Game.findById(roomId);
const chat={
  sender,
  messageContent,
};
const chatMessage=gameRoom.chatMessages.push(chat);
await gameRoom.save();
return ;
}catch(error){
console.log('error while adding chat:',error)
}
}