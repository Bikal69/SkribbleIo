import config from "../config/gameConfig.js";
const WORDS = ['cat', 'dog', 'house', 'tree', 'car', 'book', 'computer'];
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
didUserGuessed(userId){
    return (this.userScores.get(userId));
}
didAllUsersGuessed(artistUserId,users){
    for(const user of users){
        if(user.id===artistUserId){
            continue;
        }
        if(this.userScores.get(user.id)){
            return true;
        }else{
            return false;
        }
    }
}

};