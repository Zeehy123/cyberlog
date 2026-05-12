import App from "./App";
import Login from "./Login";
import { useState } from "react";
export default function Root() {
  const [authed, setAuthed] = useState(false);
  return authed ? <App /> : <Login onLogin={() => setAuthed(true)} />;
}
