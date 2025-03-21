import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from "react-router-dom";
import Lobby from "./pages/Lobby.jsx";
import Game from "./pages/Game.jsx";
import { SocketProvider } from "./services/socket.jsx";
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/">
      <Route index element={<Lobby />} />
      <Route path="game/:room_id" element={<Game />} />
    </Route>
  )
);


export default function App() {
  return <RouterProvider router={router} />
}

