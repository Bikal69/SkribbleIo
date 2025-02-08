import mongoose from 'mongoose';

const playerSchema=new mongoose.Schema({
    username:{type:String,required:true},
    socketId:{type:String,required:true},
    isHost:{type:Boolean,required:true},
    avatar:{type:String,default:""},
    score:{type:Number}
});

const chatMessageSchema=new mongoose.Schema({
    sender:{type:String,required:true},
    message:{type:String,required:true},
    isCorrectGuess:{type:Boolean,default:false},
},{timestamps:true});

const roundSchema=new mongoose.Schema({
    roundNumber:{type:Number,required:true},
    drawers:[{type:String,}],
    wordToGuess:{type:String,required:true},
    startTime:{type:Date,default:Date.now()},
    startTime:{type:Date}
});



const gameSchema=new mongoose.Schema({
players:[playerSchema],
chatMessages:[chatMessageSchema],
rounds:[roundSchema],
currentRound:{type:Number,default:1},
maxRound:{type:Number,default:5},
maxPlayers:{type:Number,default:8},
},{timestamps:true})

const Game=mongoose.model('Game',gameSchema);
export default Game;