import config from "../config/gameConfig.js";
const WORDS = ['cat', 'dog', 'house', 'tree', 'car', 'book', 'computer','lado'];
export default class GameRound{
constructor(roundNumber){
    this.roundNumber=roundNumber;
    this.roundTime=config.ROUND_TIME;
    this.roundDelay=config.NEXT_ROUND_DELAY;
    this.chats=[];
    this.drawingState=[];
    this.wordToGuess=this.pickRandomWords();
    this.isActive=true;
    this.startTime=new Date().getTime();
    this.userScores=new Map();
}
pickRandomWords(){
 return WORDS[Math.floor(Math.random()*WORDS.length)]
};
assignUserScores(user,score){
this.userScores.set(user.id,score);
return true;
}
getUserScores(artistUserId ,users){
const usersScoreFinal={};
let correctGuess=0;
for(const user of users){
    if(user.id===artistUserId){
        continue;
    }
    const score=this.userScores.get(user.id);
    if(score){
        correctGuess++
        usersScoreFinal[user.id]=score;
    }else{
        usersScoreFinal[user.id]=0;
    };
    usersScoreFinal[artistUserId]=correctGuess*5;
    return usersScoreFinal;
}
}
didUserGuessed(artistUserId,user){
    if(user){
        if(user.id===artistUserId){
            return true;
        }
        return (this.userScores.get(user.id));
    }
    return false;
}
didAllUsersGuessed(artistUserId,users){
let yes;
for (const user of users){
    if(user.id===artistUserId){
        continue;
    }else{
        if(this.userScores.get(user.id)){
            yes=true;
            continue;
        }else{
            yes=false;
            break;
        }
    }
}
    return yes;
}

};