import {v4 as uuidv4} from 'uuid';
import {wordHider} from '../helpers/gameHelper.js';
import GameRound from './GameRound.js'
import config  from '../config/gameConfig.js'
import {removeRoom} from '../dummyDB.js'
class GameRoom {
constructor(io,hostId){
    this.id=uuidv4();
    this.io=io;
    this.players=[];
    this.GameStarted=false; 
    this.GameFinished=false;
    this.endRoundTimeout=null;
    this.artistIndex=0;
    this.round=null;
    this.roundNumber=1;
    this.hostId=hostId;
}
isFull(){
    return this.players.length>=config.MAX_PLAYERS_PER_ROOM;

};
getArtist(){
    return this.players[this.artistIndex];
};
findPlayerIndex(userId){
return this.players.findIndex((player)=>player.id===userId)
}
addPlayer(user){
    if(user){
        if(this.isFull()){
            console.log('no. of players in room exceeded')
            return false;
        }
        const alreadyExistsIndex=this.players.findIndex((player)=>player.id===user.id);
        if(alreadyExistsIndex!==-1){
            // This is a reconnect - update the socket but maintain other player data
            const existingPlayer = this.players[alreadyExistsIndex];
            existingPlayer.socketId = user.socketId;
            existingPlayer.socket = user.socket;
        }else{
            this.players.push(user);
        }
        this.emitEvent('PLAYER-JOINED',user.getUserInfo(),[user.socketId])
        this.broadcastChatMessage({
            type:'good',
            id:Date.now()+Math.random(),
            senderUsername:'server',
            message:`User:${user.username} Joined the Game!`},
            [user]
        );
        return true;
    }else{
        throw new Error('please enter user to add');
    }
    }
removePlayer(user){
this.players=this.players.filter((player)=>player.id!==user.id);
this.emitEvent('PLAYER-LEFT',user.getUserInfo());
this.broadcastChatMessage({
    type:'bad',
    id:Date.now()+Math.random(),
    senderUsername:'server',
    message:`User:${user.username} left The Game!`
})
}
addChat(chatMsg){
    if(chatMsg&&this.round){
        //if user already guessed then only send message to correct Guessers so that he don't share word
        if(this.round.didUserGuessed(this.getArtist().id,this.players[this.findPlayerIndex(chatMsg.senderId)])){
            this.broadcastMessageToCorrectGuessers(chatMsg);
            return;
        }
        //if user guessed the correct word
        if(chatMsg.message===this.getRoundInfo().wordToGuess){
            this.round.assignUserScores(this.players[this.findPlayerIndex(chatMsg.senderId)],10);
            this.broadcastMessageToCorrectGuessers(chatMsg);
            this.emitEvent('WORD-GUESSED',chatMsg.senderId);
            this.broadcastChatMessage({
                type:'good',
                id:Date.now()+Math.random(),
                senderUsername:'server',
                message:`User:${chatMsg.senderUsername} Guessed The Word!`
            });
            if(this.round.didAllUsersGuessed(this.getArtist().id,this.players)){
                if(this.endRoundTimeout){
                    clearTimeout(this.endRoundTimeout);
                    this.endRoundTimeout=null;
                }
                this.endRound();
                this.startNextRound();
            }
            return;
      }
      this.broadcastChatMessage(chatMsg);
      this.round.chats.push(chatMsg);
    }
};
getRoundInfo(){
    if(!this.round){
        throw new Error('oops the round does not exist');
    }else{
        return {
            artistId:this.getArtist().id,
            drawingState:this.round.drawingState,
            roundNumber:this.round.roundNumber,
            roundTime:this.round.roundTime,
            chats:this.round.chats,
            wordToGuess:this.round.wordToGuess,
            isActive:this.round.isActive,
            startTime:this.round.startTime
        }
    }
}
startGame(){
    this.GameStarted=true;
   this.emitEvent('GAME-STARTED');
    this.startRound();
}
endGame(){
    if(this.endRoundTimeout){
        clearTimeout(this.endRoundTimeout);
    }
    this.emitEvent('GAME-END');
    this.endRoundTimeout=null;
    this.GameFinished=true;
    removeRoom(this.id);
};
startRound(){
    console.log('starting round')
    this.round=new GameRound(this.roundNumber);
    this.roundNumber++;
    const {chats,...roundInfo}=this.getRoundInfo();
    this.emitEvent('ROUND-START',{
        ...roundInfo,
        wordToGuess:wordHider(roundInfo.wordToGuess)
    },[this.getArtist()]);//don't emit this to the artist user
    this.getArtist()?.socket.emit('ROUND-START-ARTIST',roundInfo);//emit the full word to artist without hiding
    this.broadcastChatMessage({
        type:'alert',
        id:Date.now()+Math.random(),
        senderUsername:'server',
        message:`${this.getArtist()?.username} turn's to draw!`
    });
    if (this.endRoundTimeout) {
        clearTimeout(this.endRoundTimeout);
        this.endRoundTimeout=null;
    }
    this.endRoundTimeout=setTimeout(()=>{
        this.endRound();
        console.log('roundNumber from timeout:',this.roundNumber)
        setTimeout(()=>this.startNextRound(),this.round?.roundDelay*1000)
    },this.round.roundTime*1000)
};
endRound(){
    const artist=this.getArtist();
    if(!artist){
        return ;
    }
    this.emitEvent('WORD-REVEAL',this.round.wordToGuess);
    this.emitEvent('ROUND-END');
    this.round.isActive=false;
    const roundScores=this.round.getUserScores(this.getArtist(this.artistIndex).id,this.players);
    this.emitEvent('ROUND-SCORES',roundScores);
    for(const player of this.players){
        player.score+=roundScores[player.id]
    };
    this.emitEvent('TOTAL-SCORES',this.getPlayersTotalScore());
};
startNextRound(){
    this.artistIndex++;
    if(this.artistIndex>this.players.length-1||this.roundNumber>=4){
        this.endGame();
    }else{
        this.startRound();
    }

}
emitEvent(eventName,payload=null,excludedUsers=null){
    if(excludedUsers&&excludedUsers.length>0){
        const usersToSend=this.players.filter((player)=>!excludedUsers.some((user)=>user?.id===player.id));
        usersToSend.forEach((user)=>user.socket.emit(eventName,payload));
    }
    else{
        this.io.to(this.id).emit(eventName,payload);
    }

}
broadcastChatMessage(message,excludedUsers=null){
this.emitEvent('CHAT-MSG',message,excludedUsers);
}
broadcastMessageToCorrectGuessers(chatMessage){
    const correctGuessers=this.players.filter((player)=>this.round?.didUserGuessed(this.getArtist().id,player));
    correctGuessers.forEach((user)=>user.socket.emit('CHAT-MSG',chatMessage))
    // const correctGuessersSocketId=correctGuessers.map((player)=>player?.socketId);
    // this.io.to(correctGuessersSocketId.push(this.getArtist().socketId)).emit('CHAT-MSG',chatMessage);
}
getPlayersTotalScore(){
    let totalScores={};
    for(const player of this.players){
        totalScores[player.id]=player.score;
    }
    return totalScores;
}
}

export default GameRoom;