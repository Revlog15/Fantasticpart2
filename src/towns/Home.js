import React, { useState, useEffect, useRef } from "react";
import "./Town.css";

function Home({ onReturn }) {
  const CHARACTER_SIZE = 200;
  const selectedCharacter =
    localStorage.getItem("selectedCharacter") || "revlog";
  const playerName = localStorage.getItem("playerName") || "Player";

  const [position, setPosition] = useState({ x: 100, y: 450 });
  const [direction, setDirection] = useState("right");
  const [characterImage, setCharacterImage] = useState(
    `${selectedCharacter}-idle`
  );
  const [moveInterval, setMoveInterval] = useState(null);
  const positionRef = useRef(position);
  const isMovingRef = useRef(false);

  // Add inventory state
  const [inventory, setInventory] = useState([]);
  const [showInventory, setShowInventory] = useState(false);

  // State for action button visibility
  const [showWorkEatButtons, setShowWorkEatButtons] = useState(false);
  const [showSleepButton, setShowSleepButton] = useState(false);
  const [showHygieneButton, setShowHygieneButton] = useState(false);
  const [showGoOutsideButton, setShowGoOutsideButton] = useState(false);

  // Character stats
  const [stats, setStats] = useState({
    happiness: 100,
    hunger: 100,
    sleep: 100,
    hygiene: 100,
    gold: 0,
  });

  // Update positionRef when position changes
  useEffect(() => {
    positionRef.current = position;
  }, [position]);

  // Update stats with limits
  const updateStats = () => {
    setStats((prevStats) => ({
      ...prevStats,
      happiness: Math.max(0, Math.min(100, prevStats.happiness)),
      hunger: Math.max(0, Math.min(100, prevStats.hunger)),
      sleep: Math.max(0, Math.min(100, prevStats.sleep)),
      hygiene: Math.max(0, Math.min(100, prevStats.hygiene)),
      gold: Math.max(0, prevStats.gold),
    }));
  };

  // Game actions
  const work = () => {
    setStats((prevStats) => ({
      ...prevStats,
      gold: prevStats.gold + 10,
      happiness: prevStats.happiness - 5,
      hunger: prevStats.hunger - 10,
      sleep: prevStats.sleep - 5,
      hygiene: prevStats.hygiene - 5,
    }));
    updateStats();
  };

  const eat = () => {
    if (stats.gold >= 5) {
      setStats((prevStats) => ({
        ...prevStats,
        gold: prevStats.gold - 5,
        hunger: prevStats.hunger + 20,
        happiness: prevStats.happiness + 5,
        hygiene: prevStats.hygiene - 2,
      }));
      updateStats();
    }
  };

  const sleep = () => {
    setStats((prevStats) => ({
      ...prevStats,
      sleep: prevStats.sleep + 30,
      hunger: prevStats.hunger - 10,
      hygiene: prevStats.hygiene - 5,
    }));
    updateStats();
  };

  const explore = () => {
    setStats((prevStats) => ({
      ...prevStats,
      happiness: prevStats.happiness + 15,
      hunger: prevStats.hunger - 10,
      sleep: prevStats.sleep - 10,
      hygiene: prevStats.hygiene - 10,
    }));
    updateStats();
  };

  // Define action area coordinates and radius
  const ACTION_RADIUS = 100; // Radius for detecting proximity to action areas
  const WORK_EAT_COORDS = { x: 40, y: 255 };
  const SLEEP_COORDS = { x: 865, y: 450 };
  const HYGIENE_COORDS = { x: 325, y: 465 };
  const GO_OUTSIDE_COORDS = { x: 1105, y: 180 };

  // Function to check proximity to action areas
  const checkNearActionArea = (charX, charY) => {
    const distanceToWorkEat = Math.sqrt(
      Math.pow(charX - WORK_EAT_COORDS.x, 2) +
        Math.pow(charY - WORK_EAT_COORDS.y, 2)
    );
    setShowWorkEatButtons(distanceToWorkEat < ACTION_RADIUS);

    const distanceToSleep = Math.sqrt(
      Math.pow(charX - SLEEP_COORDS.x, 2) + Math.pow(charY - SLEEP_COORDS.y, 2)
    );
    setShowSleepButton(distanceToSleep < ACTION_RADIUS);

    const distanceToHygiene = Math.sqrt(
      Math.pow(charX - HYGIENE_COORDS.x, 2) +
        Math.pow(charY - HYGIENE_COORDS.y, 2)
    );
    setShowHygieneButton(distanceToHygiene < ACTION_RADIUS);

    const distanceToGoOutside = Math.sqrt(
      Math.pow(charX - GO_OUTSIDE_COORDS.x, 2) +
        Math.pow(charY - GO_OUTSIDE_COORDS.y, 2)
    );
    setShowGoOutsideButton(distanceToGoOutside < ACTION_RADIUS);
  };

  // Effect to check proximity when character position changes
  useEffect(() => {
    checkNearActionArea(position.x, position.y);
  }, [position]);

  // Function to toggle inventory visibility
  const toggleInventory = () => {
    setShowInventory(!showInventory);
  };

  // Function to add item to inventory (placeholder)
  const addToInventory = (item) => {
    setInventory((prevInventory) => [...prevInventory, item]);
  };

  // Function to remove item from inventory (placeholder)
  const removeFromInventory = (index) => {
    setInventory((prevInventory) =>
      prevInventory.filter((_, i) => i !== index)
    );
  };

  // Function to handle character movement
  const moveCharacter = (moveDirection) => {
    if (!isMovingRef.current) return;

    const step = 15;
    let { x, y } = positionRef.current;

    // Define restricted areas (walls and furniture)
    const restrictedAreas = [
      // Walls
      { xMin: 0, xMax: window.innerWidth, yMin: 0, yMax: 150 }, // Top wall
      {
        xMin: 0,
        xMax: window.innerWidth,
        yMin: window.innerHeight - 100,
        yMax: window.innerHeight,
      },
    ];

    // Calculate new position
    let newX = x;
    let newY = y;

    switch (moveDirection) {
      case "left":
        newX = Math.max(x - step, 0);
        break;
      case "right":
        newX = Math.min(x + step, window.innerWidth - CHARACTER_SIZE);
        break;
      case "up":
        newY = Math.max(y - step, 0);
        break;
      case "down":
        newY = Math.min(y + step, window.innerHeight - CHARACTER_SIZE);
        break;
      default:
        return;
    }

    // Check if new position overlaps with any restricted area
    let canMove = true;
    for (const area of restrictedAreas) {
      const isOverlapping =
        newX < area.xMax &&
        newX + CHARACTER_SIZE > area.xMin &&
        newY < area.yMax &&
        newY + CHARACTER_SIZE > area.yMin;

      if (isOverlapping) {
        canMove = false;
        break;
      }
    }

    // Only update position if not in a restricted area
    if (canMove) {
      x = newX;
      y = newY;

      // Update direction and animation
      switch (moveDirection) {
        case "left":
          setDirection("left");
          setCharacterImage(`${selectedCharacter}-left`);
          break;
        case "right":
          setDirection("right");
          setCharacterImage(`${selectedCharacter}-right`);
          break;
        case "up":
          setDirection("up");
          setCharacterImage(`${selectedCharacter}-left`);
          break;
        case "down":
          setDirection("down");
          setCharacterImage(`${selectedCharacter}-right`);
          break;
      }
      setPosition({ x, y });
    }
  };

  // Handle continuous movement
  const handleButtonStart = (direction) => {
    isMovingRef.current = true;
    if (moveInterval) clearInterval(moveInterval);
    moveCharacter(direction);
    const interval = setInterval(() => {
      moveCharacter(direction);
    }, 100);
    setMoveInterval(interval);
  };

  const handleButtonEnd = () => {
    isMovingRef.current = false;
    if (moveInterval) {
      clearInterval(moveInterval);
      setMoveInterval(null);
    }
    setCharacterImage(`${selectedCharacter}-idle`);
  };

  // Handle keydown for keyboard movement
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (isMovingRef.current) return;

      switch (event.key) {
        case "ArrowLeft":
        case "a":
          handleButtonStart("left");
          break;
        case "ArrowRight":
        case "d":
          handleButtonStart("right");
          break;
        case "ArrowUp":
        case "w":
          handleButtonStart("up");
          break;
        case "ArrowDown":
        case "s":
          handleButtonStart("down");
          break;
        default:
          break;
      }
    };

    const handleKeyUp = (event) => {
      switch (event.key) {
        case "ArrowLeft":
        case "a":
        case "ArrowRight":
        case "d":
        case "ArrowUp":
        case "w":
        case "ArrowDown":
        case "s":
          handleButtonEnd();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [selectedCharacter]);

  // Clean up move interval on component unmount
  useEffect(() => {
    return () => {
      if (moveInterval) clearInterval(moveInterval);
    };
  }, [moveInterval]);

  return (
    <div
      className="town"
      style={{ backgroundImage: "url('/picture/home.jpg')" }}
    >
      <div className="town-header">
        <h1>Home</h1>
      </div>

      {/* Character Coordinate Display for Home */}
      <div
        style={{
          position: "absolute",
          bottom: "20px",
          left: "20px",
          backgroundColor: "rgba(0, 0, 0, 0.6)",
          color: "white",
          padding: "10px",
          borderRadius: "5px",
          zIndex: 150, // Ensure it's above other elements
          fontSize: "14px",
        }}
      >
        Coords: ({Math.round(position.x)}, {Math.round(position.y)})
      </div>

      {/* Character */}
      <div
        style={{
          position: "absolute",
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: `${CHARACTER_SIZE}px`,
          height: `${CHARACTER_SIZE}px`,
          backgroundImage: `url('/Picture/${characterImage}.png')`,
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          zIndex: 100,
        }}
      />

      {/* Character Stats */}
      <div className="character-stats">
        <div className="stat-item">
          <span>Happiness:</span>
          <div className="stat-bar happiness-bar">
            <div
              className="stat-fill"
              style={{ width: `${stats.happiness}%` }}
            ></div>
          </div>
          <span>{stats.happiness}%</span>
        </div>
        <div className="stat-item">
          <span>Hunger:</span>
          <div className="stat-bar hunger-bar">
            <div
              className="stat-fill"
              style={{ width: `${stats.hunger}%` }}
            ></div>
          </div>
          <span>{stats.hunger}%</span>
        </div>
        <div className="stat-item">
          <span>Sleep:</span>
          <div className="stat-bar sleep-bar">
            <div
              className="stat-fill"
              style={{ width: `${stats.sleep}%` }}
            ></div>
          </div>
          <span>{stats.sleep}%</span>
        </div>
        <div className="stat-item">
          <span>Hygiene:</span>
          <div className="stat-bar hygiene-bar">
            <div
              className="stat-fill"
              style={{ width: `${stats.hygiene}%` }}
            ></div>
          </div>
          <span>{stats.hygiene}%</span>
        </div>
        <div className="stat-item">
          <span>Gold:</span>
          <span className="gold-amount">{stats.gold}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <button className="inventory-button" onClick={toggleInventory}>
          Inventory
        </button>
        {showWorkEatButtons && (
          <>
            <button onClick={work}>Work</button>
            <button onClick={eat}>Eat</button>
          </>
        )}
        {showSleepButton && <button onClick={sleep}>Sleep</button>}
        {showHygieneButton && (
          <button
            onClick={() =>
              setStats((prevStats) => ({ ...prevStats, hygiene: 100 }))
            }
          >
            Shower
          </button>
        )}
        {showGoOutsideButton && (
          <button className="action-button" onClick={onReturn}>
            Go outside
          </button>
        )}
      </div>

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

      {/* Virtual Arrow Keys */}
      <div className="arrow-keys">
        <button
          onMouseDown={() => handleButtonStart("up")}
          onMouseUp={handleButtonEnd}
          onMouseLeave={handleButtonEnd}
          onTouchStart={() => handleButtonStart("up")}
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
            onTouchStart={() => handleButtonStart("left")}
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
            onTouchStart={() => handleButtonStart("right")}
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
          onTouchStart={() => handleButtonStart("down")}
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

export default Home;
