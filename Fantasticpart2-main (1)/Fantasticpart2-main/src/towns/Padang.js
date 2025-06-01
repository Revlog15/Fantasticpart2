import React from "react";
import "./Town.css";

function Padang({ onReturn }) {
  return (
    <div className="town" style={{ backgroundImage: "url('/map-utama.jpg')" }}>
      <div className="town-header">
        <h1>Padang</h1>
        <button className="return-button" onClick={onReturn}>
          Return to Map
        </button>
      </div>
      <div className="town-content">
        <p>Welcome to Padang! Home of the famous Rendang.</p>
        {/* Add more town-specific content here */}
      </div>
    </div>
  );
}

export default Padang;
