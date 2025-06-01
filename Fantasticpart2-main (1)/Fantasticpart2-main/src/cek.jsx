import React, { useState } from 'react';

function MouseTracker() {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    setPosition({ x: e.clientX, y: e.clientY });
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      className="w-full h-screen bg-gray-100"
    >
      <p className="fixed top-2 left-2 bg-white p-2 shadow rounded">
        X: {position.x}, Y: {position.y}
      </p>
    </div>
  );
}

export default MouseTracker;
