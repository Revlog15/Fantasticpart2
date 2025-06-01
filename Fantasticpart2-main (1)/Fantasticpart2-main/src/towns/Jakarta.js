import React from "react";
import "./Town.css";

function Jakarta({ onReturn }) {
  return (
    <div className="town" style={{ backgroundImage: "url('/map-utama.jpg')" }}>
      <div className="town-header">
        <h1>Jakarta</h1>
        <button className="return-button" onClick={onReturn}>
          Return to Map
        </button>
      </div>
      <div className="town-content">
        <p>Welcome to Jakarta! The capital city of Indonesia.</p>
        {/* Add more town-specific content here */}
      </div>
    </div>
  );
}

export default Jakarta;
