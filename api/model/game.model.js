import mongoose from 'mongoose';

const playerSchema=new mongoose.Schema({
    username:{type:String,required:true},
    playerId:{type:String,required:true},
    isHost:{type:Boolean,default:false},
    avatar:{type:String,default:""},
    score:{type:Number,default:0},
});

const chatMessageSchema=new mongoose.Schema({
    sender:{type:String,required:true},
    messageContent:{type:String,required:true},
    isCorrectGuess:{type:Boolean,default:false},
},{timestamps:true});

const roundSchema=new mongoose.Schema({
    roundNumber:{type:Number,required:true},
    wordToGuess:{type:String,required:true},
    isActive:{type:Boolean,default:false},
    startTime:{type:Date,default:Date.now()},
});



const gameSchema=new mongoose.Schema({
players:[playerSchema],
host:{type:String,required:true},
chatMessages:[chatMessageSchema],
rounds:[roundSchema],
currentRound:{type:Number,default:1},
maxRound:{type:Number,default:3},
maxPlayers:{type:Number,default:8},
},{timestamps:true})

const Game=mongoose.model('Game',gameSchema);
export default Game;