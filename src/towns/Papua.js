import React from "react";
import "./Town.css";

function Papua({ onReturn }) {
  return (
    <div className="town" style={{ backgroundImage: "url('/map-utama.jpg')" }}>
      <div className="town-header">
        <h1>Papua</h1>
        <button className="return-button" onClick={onReturn}>
          Return to Map
        </button>
      </div>
      <div className="town-content">
        <p>Welcome to Papua! Land of the beautiful Raja Ampat.</p>
        {/* Add more town-specific content here */}
      </div>
    </div>
  );
}

export default Papua;
