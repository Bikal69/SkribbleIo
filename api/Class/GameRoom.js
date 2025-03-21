import {v4 as uuidv4} from 'uuid';
import {wordHider} from '../helpers/gameHelper.js';
import GameRound from './GameRound.js'
const MAX_PLAYERS = 3;
const MIN_PLAYERS=2;
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
    return this.players.length>=MAX_PLAYERS;

};
getArtist(){
    return this.players[this.artistIndex];
};
findPlayerIndex(user){
return this.players.findIndex((player)=>player.id===user.id)
}
addPlayer(user){
    if(user){
        if(this.isFull()){console.log('no. of players in room exceeded')}
        const alreadyExistsIndex=this.players.findIndex((player)=>player.id===user.id);
        if(alreadyExistsIndex!==-1){
            this.players[alreadyExistsIndex]=user;
        }else{
            this.players.push(user);
        }
        this.emitEvent('PLAYER-JOINED',user.getUserInfo(),[user.socketId])
        this.broadcastChatMessage({
            type:'good',
            message:`User:${user.username} Joined the Game!`},
            [user]
        );
    }else{
        throw new Error('please enter user to add');
    }
    }
removePlayer(user){
this.players=this.players.filter((player)=>player.id!==user.id);
this.emitEvent('PLAYER-LEFT',user.getUserInfo(),[user.socketId]);
this.broadcastChatMessage({
    type:'bad',
    message:`User:${user.username} left The Game!`
})
}
addChat(chatMsg){
    if(chatMsg&&this.round){
        this.round.chats.push(chatMsg);
        return;
    }
}
getRoundInfo(){
    if(!this.round){
        throw new Error('oops the round does not exist');
    }else{
        return {
            artistId:this.getArtist().id,
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
    this.GameFinished=true;
    this.round=null;
    this.artistIndex=0;
    this.endRoundTimeout=null;
    this.players=[];
};
startRound(){
    console.log('starting round')
    this.round=new GameRound(this.roundNumber);
    this.roundNumber++;
    const {chats,...roundInfo}=this.getRoundInfo();
    this.emitEvent('ROUND-START',{
        ...roundInfo,
        wordToGuess:wordHider(roundInfo.wordToGuess)
    },[this.getArtist()?.id]);//don't emit this to the artist user
    this.getArtist()?.socket.emit('ROUND-START-ARTIST',roundInfo.wordToGuess);//emit the full word to artist without hiding
    this.broadcastChatMessage({
        type:'alert',
        message:`${this.getArtist()?.username} turn's to draw!`
    });
    if (this.endRoundTimeout) {
        clearTimeout(this.endRoundTimeout);
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
    const roundScores=this.round.getUserScores(this.getArtist(this.artistIndex),this.players);
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
    const correctGuessers=this.players.filter((player)=>this.round?.didUserGuessed(player.id)).push(this.getArtist());
    const correctGuessersSocketId=correctGuessers.map((player)=>player?.socketId);
    this.io.to(correctGuessersSocketId).emit('CHAT-MSG',chatMessage);
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