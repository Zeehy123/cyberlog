// Root.jsx
// Entry-level component that conditionally renders the `Login`
// screen or the main `App` dashboard depending on a simple
// `authed` flag stored in component state. This is intentionally
// minimal for demo purposes.

import App from "./App";
import Login from "./Login";
import { useState } from "react";

export default function Root() {
  const [authed, setAuthed] = useState(false);
  return authed ? <App /> : <Login onLogin={() => setAuthed(true)} />;
}
