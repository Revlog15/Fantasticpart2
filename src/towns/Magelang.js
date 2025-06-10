import React from "react";
import "./Town.css";

function Magelang({ onReturn }) {
  return (
    <div className="town" style={{ backgroundImage: "url('/map-utama.jpg')" }}>
      <div className="town-header">
        <h1>Magelang</h1>
        <button className="return-button" onClick={onReturn}>
          Return to Map
        </button>
      </div>
      <div className="town-content">
        <p>Welcome to Magelang! Gateway to the magnificent Borobudur Temple.</p>
        {/* Add more town-specific content here */}
      </div>
    </div>
  );
}

export default Magelang;
