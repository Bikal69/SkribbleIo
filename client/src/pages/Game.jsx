import UserList from "@features/game/component/UserList.jsx"
import DrawingBoard from "../features/game/component/DrawingBoard.jsx"
import MessageList from "../features/game/component/MessageList.jsx"
import './game.css'
const Game = () => {
  return (
    <div className="game-page">
        <UserList/>
        <DrawingBoard/>
        <MessageList/>
    </div>
  )
}

export default Game