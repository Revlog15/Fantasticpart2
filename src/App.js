import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CharacterSelect from "./components/CharacterSelect";
import Game from "./components/Game";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<CharacterSelect />} />
          <Route path="/game" element={<Game />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
