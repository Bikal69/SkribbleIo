import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from "react-router-dom";
import Lobby from "./pages/Lobby";
import Game from "./pages/Game";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" errorElement={<p>Oops, route not found!</p>}>
      <Route index element={<Lobby />} />
      <Route path="game/:room_id" element={<Game />} />
    </Route>
  )
);

export default function App() {
  return <RouterProvider router={router} />;
}
