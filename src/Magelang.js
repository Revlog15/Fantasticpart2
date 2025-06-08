import React, { useState, useEffect } from "react";
import "./Town.css";

function Magelang({ onReturn, stats, updateStats }) {
  const CHARACTER_SIZE = 150;
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [characterImage, setCharacterImage] = useState("revlog-idle");
  const [isLeaving, setIsLeaving] = useState(false);
  const [showClouds, setShowClouds] = useState(true);

  // Get selected character from localStorage
  const selectedCharacter = localStorage.getItem("selectedCharacter") || "revlog";

  // Function to handle character movement
  const moveCharacter = (direction) => {
    setPosition((prev) => {
      let { x, y } = prev;
      const step = 1;
      switch (direction) {
        case "left":
          x = Math.max(x - step, 0);
          setCharacterImage(`${selectedCharacter}-left`);
          break;
        case "right":
          x = Math.min(x + step, 100);
          setCharacterImage(`${selectedCharacter}-right`);
          break;
        case "up":
          y = Math.max(y - step, 0);
          setCharacterImage(`${selectedCharacter}-left`);
          break;
        case "down":
          y = Math.min(y + step, 100);
          setCharacterImage(`${selectedCharacter}-right`);
          break;
        default:
          return prev;
      }
      return { x, y };
    });
  };

  // Handle keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case "ArrowLeft":
        case "a":
          moveCharacter("left");
          break;
        case "ArrowRight":
        case "d":
          moveCharacter("right");
          break;
        case "ArrowUp":
        case "w":
          moveCharacter("up");
          break;
        case "ArrowDown":
        case "s":
          moveCharacter("down");
          break;
      }
    };

    const handleKeyUp = () => {
      setCharacterImage(`${selectedCharacter}-idle`);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [selectedCharacter]);

  // Handle return to main map
  const handleReturn = () => {
    setIsLeaving(true);
    setShowClouds(true);
    setTimeout(() => {
      onReturn();
    }, 800);
  };

  return (
    <div className="town">
      {/* Stats display */}
      <div className="character-stats">
        <div className="stat-item">
          <span>Happiness:</span>
          <div className="stat-bar happiness-bar">
            <div className="stat-fill" style={{ width: `${stats.happiness}%` }}></div>
          </div>
          <span>{stats.happiness}%</span>
        </div>
        <div className="stat-item">
          <span>Hunger:</span>
          <div className="stat-bar hunger-bar">
            <div className="stat-fill" style={{ width: `${stats.hunger}%` }}></div>
          </div>
          <span>{stats.hunger}%</span>
        </div>
        <div className="stat-item">
          <span>Sleep:</span>
          <div className="stat-bar sleep-bar">
            <div className="stat-fill" style={{ width: `${stats.sleep}%` }}></div>
          </div>
          <span>{stats.sleep}%</span>
        </div>
        <div className="stat-item">
          <span>Hygiene:</span>
          <div className="stat-bar hygiene-bar">
            <div className="stat-fill" style={{ width: `${stats.hygiene}%` }}></div>
          </div>
          <span>{stats.hygiene}%</span>
        </div>
        <div className="stat-item">
          <span>Gold:</span>
          <span className="gold-amount">{stats.gold}</span>
        </div>
      </div>

      {/* Map with transition effects */}
      <div
        className={`town-map-container ${isLeaving ? "leaving" : ""}`}
        style={{
          backgroundImage: "url('/Picture/Map Magelang.jpg')",
          backgroundSize: "100% 100%",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          imageRendering: "pixelated",
        }}
      />

      {/* Cloud transition effect */}
      <div className={`clouds-container ${showClouds ? "visible" : ""}`}>
        <div className="cloud cloud-1"></div>
        <div className="cloud cloud-2"></div>
        <div className="cloud cloud-3"></div>
        <div className="cloud-small cloud-small-1"></div>
        <div className="cloud-small cloud-small-2"></div>
      </div>

      {/* Character */}
      <div
        style={{
          position: "absolute",
          left: `${position.x}%`,
          top: `${position.y}%`,
          width: `${CHARACTER_SIZE}px`,
          height: `${CHARACTER_SIZE}px`,
          backgroundImage: `url('/Picture/${characterImage}.png')`,
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          zIndex: 100,
          transform: "translate(-50%, -50%)",
        }}
      />

      {/* Return Button */}
      <button className="return-button" onClick={handleReturn}>
        Return to Map
      </button>

      {/* Coordinate Display */}
      <div
        style={{
          position: "fixed",
          top: "10px",
          left: "10px",
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          color: "white",
          padding: "8px 15px",
          borderRadius: "5px",
          border: "2px solid #ffd700",
          fontSize: "14px",
          zIndex: 1000,
          fontFamily: "monospace",
        }}
      >
        X: {Math.round(position.x)}% | Y: {Math.round(position.y)}%
      </div>
    </div>
  );
}

export default Magelang; 