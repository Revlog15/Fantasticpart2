import React from "react";
import "./Town.css";

function Home({ onReturn }) {
  return (
    <div className="town" style={{ backgroundImage: "url('/map-utama.jpg')" }}>
      <div className="town-header">
        <h1>Home</h1>
        <button className="return-button" onClick={onReturn}>
          Return to Map
        </button>
      </div>
      <div className="town-content">
        <p>
          Welcome to your home town! This is your starting point in the game.
        </p>
      </div>
    </div>
  );
}

export default Home;
