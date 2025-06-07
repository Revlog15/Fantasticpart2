import React, { useState, useEffect } from "react";
import "./Game.css";

// Import town components
import Jakarta from "./towns/Jakarta";
import Padang from "./towns/Padang";
import Papua from "./towns/Papua";
import Magelang from "./towns/Magelang";
import Home from "./towns/Home";

function Game() {
  const CHARACTER_SIZE = 50;
  const [position, setPosition] = useState({ x: 50, y: 50 }); // Changed to percentage
  const [direction, setDirection] = useState("right");
  const [moveInterval, setMoveInterval] = useState(null); // State untuk menyimpan interval
  // Add state for stats
  const [health, setHealth] = useState(100);
  const [score, setScore] = useState(0);
  // Add inventory state
  const [inventory, setInventory] = useState([]);
  const [showInventory, setShowInventory] = useState(false);
  const [currentTown, setCurrentTown] = useState(null);
  const [showExploreButton, setShowExploreButton] = useState(false);
  const [nearSign, setNearSign] = useState(null);
  const [showSignDetails, setShowSignDetails] = useState(false);

  // Define signs for the main map with percentage coordinates
  const signs = [
    {
      id: 1,
      x: 27,
      y: 67,
      name: "Town Hall",
      description:
        "The central administrative building of the town. Here you can find important information and quests.",
    },
    {
      id: 2,
      x: 85,
      y: 52,
      name: "Market",
      description:
        "A bustling marketplace where you can buy and sell items. Various merchants offer their wares here.",
    },
    {
      id: 3,
      x: 87,
      y: 24,
      name: "Training Ground",
      description:
        "A place to train and improve your skills. Various training facilities are available for different abilities.",
    },
  ];

  // Define town coordinates with percentage values
  const towns = {
    home: { x: 80, y: 40, name: "Home" },
    jakarta: { x: 15, y: 44, name: "Jakarta" },
    padang: { x: 62, y: 65, name: "Padang" },
    papua: { x: 90, y: 65, name: "Papua" },
    magelang: { x: 85, y: 23, name: "Magelang" },
  };

  // Check if character is near a town
  const checkNearTown = (x, y) => {
    const TOWN_DETECTION_RADIUS = 5; // Changed to percentage
    for (const [townId, town] of Object.entries(towns)) {
      const distance = Math.sqrt(
        Math.pow(x - town.x, 2) + Math.pow(y - town.y, 2)
      );
      if (distance < TOWN_DETECTION_RADIUS) {
        setShowExploreButton(true);
        return townId;
      }
    }
    setShowExploreButton(false);
    return null;
  };

  // Check if character is near a sign
  const checkNearSign = (x, y) => {
    const SIGN_DETECTION_RADIUS = 5; // Changed to percentage
    for (const sign of signs) {
      const distance = Math.sqrt(
        Math.pow(x - sign.x, 2) + Math.pow(y - sign.y, 2)
      );
      if (distance < SIGN_DETECTION_RADIUS) {
        setNearSign(sign);
        return;
      }
    }
    setNearSign(null);
  };

  // Function to handle character movement
  const moveCharacter = (moveDirection) => {
    const step = 1; // Changed to percentage
    let { x, y } = position;

    switch (moveDirection) {
      case "left":
        x = Math.max(x - step, 0);
        setDirection("left");
        break;
      case "right":
        x = Math.min(x + step, 100);
        setDirection("right");
        break;
      case "up":
        y = Math.max(y - step, 0);
        setDirection("up");
        break;
      case "down":
        y = Math.min(y + step, 100);
        setDirection("down");
        break;
      default:
        return;
    }
    setPosition({ x, y });
    checkNearTown(x, y);
    checkNearSign(x, y);
  };

  // Handle keydown for keyboard movement
  useEffect(() => {
    const handleKeyDown = (event) => {
      switch (event.key) {
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
        default:
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [position]);

  // Handle button press (hold) and release
  const handleButtonStart = (direction) => {
    moveCharacter(direction); // Move once on tap/initial press
    // Clear any existing interval first
    if (moveInterval) clearInterval(moveInterval);
    // Start continuous movement after a delay
    const interval = setInterval(() => {
      moveCharacter(direction);
    }, 100); // Adjust interval for speed (ms)
    setMoveInterval(interval);
  };

  const handleButtonEnd = () => {
    // Stop continuous movement on release
    if (moveInterval) {
      clearInterval(moveInterval);
      setMoveInterval(null);
    }
  };

  // Clean up interval on component unmount
  useEffect(() => {
    return () => {
      if (moveInterval) clearInterval(moveInterval);
    };
  }, [moveInterval]);

  // Function to toggle inventory visibility
  const toggleInventory = () => {
    setShowInventory(!showInventory);
  };

  // Function to add item to inventory
  const addToInventory = (item) => {
    setInventory([...inventory, item]);
  };

  // Function to remove item from inventory
  const removeFromInventory = (index) => {
    const newInventory = [...inventory];
    newInventory.splice(index, 1);
    setInventory(newInventory);
  };

  // Function to explore town
  const exploreTown = () => {
    const townId = checkNearTown(position.x, position.y);
    if (townId) {
      setCurrentTown(townId);
    }
  };

  // Function to return to main map
  const returnToMainMap = () => {
    setCurrentTown(null);
  };

  const handleCheckOut = () => {
    if (nearSign) {
      setShowSignDetails(true);
    }
  };

  const closeSignDetails = () => {
    setShowSignDetails(false);
  };

  // Render town component if in a town
  if (currentTown) {
    const TownComponent = {
      home: Home,
      jakarta: Jakarta,
      padang: Padang,
      papua: Papua,
      magelang: Magelang,
    }[currentTown];

    return (
      <div className="town-container">
        <TownComponent onReturn={returnToMainMap} />
      </div>
    );
  }

  return (
    <div
      className="game-container"
      style={{
        backgroundImage: "url('/map-utama.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        width: "100vw",
        height: "100vh",
        position: "relative",
      }}
    >
      {/* Action Bar */}
      <div className="action-bar">
        <button className="inventory-button" onClick={toggleInventory}>
          Inventory
        </button>
        {showExploreButton && (
          <button className="explore-button" onClick={exploreTown}>
            Explore
          </button>
        )}
        {nearSign && (
          <button className="check-out-button" onClick={handleCheckOut}>
            Check out {nearSign.name}
          </button>
        )}
      </div>

      {/* Sign Details Modal */}
      {showSignDetails && nearSign && (
        <div className="sign-details-modal">
          <div className="sign-details-content">
            <h2>{nearSign.name}</h2>
            <p>{nearSign.description}</p>
            <button className="close-button" onClick={closeSignDetails}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* Inventory Modal */}
      {showInventory && (
        <div className="inventory-modal">
          <div className="inventory-content">
            <h2>Inventory</h2>
            <div className="inventory-items">
              {inventory.length === 0 ? (
                <p>Your inventory is empty</p>
              ) : (
                inventory.map((item, index) => (
                  <div key={index} className="inventory-item">
                    <span>{item}</span>
                    <button onClick={() => removeFromInventory(index)}>
                      Remove
                    </button>
                  </div>
                ))
              )}
            </div>
            <button className="close-inventory" onClick={toggleInventory}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* Stat Bar */}
      <div className="stat-bar">
        <div>Health:</div>
        <div className="health-bar-container">
          <div className="health-bar" style={{ width: `${health}%` }}></div>
        </div>
        <div>Score: {score}</div>
        <div>
          Position: ({Math.round(position.x)}%, {Math.round(position.y)}%)
        </div>
      </div>

      {/* Character */}
      <div
        style={{
          position: "absolute",
          left: `${position.x}%`,
          top: `${position.y}%`,
          width: `${CHARACTER_SIZE}px`,
          height: `${CHARACTER_SIZE}px`,
          backgroundImage: `url('/Picture/${direction}.png')`,
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          transform: "translate(-50%, -50%)", // Center the character
          zIndex: 100,
        }}
      />

      {/* Town Markers */}
      {Object.entries(towns).map(([townId, town]) => (
        <div
          key={townId}
          style={{
            position: "absolute",
            left: `${town.x}%`,
            top: `${town.y}%`,
            transform: "translate(-50%, -50%)", // Center the marker
            width: "40px",
            height: "40px",
            backgroundImage: "url('/Picture/town-marker.png')",
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            zIndex: 90,
          }}
        />
      ))}

      {/* Signs */}
      {signs.map((sign) => (
        <div
          key={sign.id}
          className="sign"
          style={{
            position: "absolute",
            left: `${sign.x}%`,
            top: `${sign.y}%`,
            transform: "translate(-50%, -50%)", // Center the sign
            zIndex: 90,
          }}
        >
          <div className="sign-icon">ℹ️</div>
        </div>
      ))}

      {/* Explore Button */}
      {showExploreButton && (
        <button
          className="explore-button"
          onClick={exploreTown}
          style={{
            position: "absolute",
            left: `${position.x}%`,
            top: `${position.y - 10}%`,
            transform: "translate(-50%, -50%)", // Center the button
            zIndex: 1000,
          }}
        >
          Explore
        </button>
      )}

      {/* Virtual Arrow Keys */}
      <div className="arrow-keys">
        <button
          onMouseDown={() => handleButtonStart("up")}
          onMouseUp={handleButtonEnd}
          onMouseLeave={handleButtonEnd}
          onTouchStart={() => handleButtonStart("up")} // Add touch support
          onTouchEnd={handleButtonEnd}
          onTouchCancel={handleButtonEnd}
          className="arrow-button up"
        >
          ▲
        </button>
        <div className="left-right">
          <button
            onMouseDown={() => handleButtonStart("left")}
            onMouseUp={handleButtonEnd}
            onMouseLeave={handleButtonEnd}
            onTouchStart={() => handleButtonStart("left")} // Add touch support
            onTouchEnd={handleButtonEnd}
            onTouchCancel={handleButtonEnd}
            className="arrow-button left"
          >
            ◀
          </button>
          <button
            onMouseDown={() => handleButtonStart("right")}
            onMouseUp={handleButtonEnd}
            onMouseLeave={handleButtonEnd}
            onTouchStart={() => handleButtonStart("right")} // Add touch support
            onTouchEnd={handleButtonEnd}
            onTouchCancel={handleButtonEnd}
            className="arrow-button right"
          >
            ▶
          </button>
        </div>
        <button
          onMouseDown={() => handleButtonStart("down")}
          onMouseUp={handleButtonEnd}
          onMouseLeave={handleButtonEnd}
          onTouchStart={() => handleButtonStart("down")} // Add touch support
          onTouchEnd={handleButtonEnd}
          onTouchCancel={handleButtonEnd}
          className="arrow-button down"
        >
          ▼
        </button>
      </div>
    </div>
  );
}

export default Game;
