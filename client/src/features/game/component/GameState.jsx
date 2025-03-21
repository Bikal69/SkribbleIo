
const GameState = ({timer,roundInfo}) => {
  if(roundInfo){console.log('roundState :',roundInfo)}
return   roundInfo?(
    <div className="game-state">Timer:{timer}
    Word:{roundInfo.wordToGuess}
    </div>
  ):<p>round is not started</p>
}

export default GameState