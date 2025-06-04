import React, { useState, useEffect } from "react";
import "../styles/Game.css";

function Home({ onReturn, stats, updateStats, work, eat, sleep }) {
  const CHARACTER_SIZE = 200;
  const selectedCharacter =
    localStorage.getItem("selectedCharacter") || "revlog";
  const playerName = localStorage.getItem("playerName") || "Player";

  const [position, setPosition] = useState({ x: 100, y: 450 });
  const [characterImage, setCharacterImage] = useState(
    `${selectedCharacter}-idle`
  );
  const [inventory, setInventory] = useState([]);
  const [showInventory, setShowInventory] = useState(false);
  const [showWorkEatButtons, setShowWorkEatButtons] = useState(false);
  const [showSleepButton, setShowSleepButton] = useState(false);
  const [showHygieneButton, setShowHygieneButton] = useState(false);
  const [showGoOutsideButton, setShowGoOutsideButton] = useState(false);

  // Simple movement function
  const moveCharacter = (direction) => {
    const step = 15;
    let newX = position.x;
    let newY = position.y;

    switch (direction) {
      case "left":
        newX = Math.max(position.x - step, 0);
        setCharacterImage(`${selectedCharacter}-left`);
        break;
      case "right":
        newX = Math.min(position.x + step, window.innerWidth - CHARACTER_SIZE);
        setCharacterImage(`${selectedCharacter}-right`);
        break;
      case "up":
        newY = Math.max(position.y - step, 0);
        setCharacterImage(`${selectedCharacter}-left`);
        break;
      case "down":
        newY = Math.min(position.y + step, window.innerHeight - CHARACTER_SIZE);
        setCharacterImage(`${selectedCharacter}-right`);
        break;
      default:
        return;
    }

    setPosition({ x: newX, y: newY });
  };

  // Basic keyboard handler
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
  }, [position, selectedCharacter]);

  // Check proximity to action areas
  useEffect(() => {
    const ACTION_RADIUS = 100;
    const WORK_EAT_COORDS = { x: 40, y: 255 };
    const SLEEP_COORDS = { x: 865, y: 450 };
    const HYGIENE_COORDS = { x: 325, y: 465 };
    const GO_OUTSIDE_COORDS = { x: 1105, y: 180 };

    const distanceToWorkEat = Math.sqrt(
      Math.pow(position.x - WORK_EAT_COORDS.x, 2) +
        Math.pow(position.y - WORK_EAT_COORDS.y, 2)
    );
    setShowWorkEatButtons(distanceToWorkEat < ACTION_RADIUS);

    const distanceToSleep = Math.sqrt(
      Math.pow(position.x - SLEEP_COORDS.x, 2) +
        Math.pow(position.y - SLEEP_COORDS.y, 2)
    );
    setShowSleepButton(distanceToSleep < ACTION_RADIUS);

    const distanceToHygiene = Math.sqrt(
      Math.pow(position.x - HYGIENE_COORDS.x, 2) +
        Math.pow(position.y - HYGIENE_COORDS.y, 2)
    );
    setShowHygieneButton(distanceToHygiene < ACTION_RADIUS);

    const distanceToGoOutside = Math.sqrt(
      Math.pow(position.x - GO_OUTSIDE_COORDS.x, 2) +
        Math.pow(position.y - GO_OUTSIDE_COORDS.y, 2)
    );
    setShowGoOutsideButton(distanceToGoOutside < ACTION_RADIUS);
  }, [position]);

  return (
    <div
      className="town"
      style={{ backgroundImage: "url('/picture/home.jpg')" }}
    >
      <div className="town-header">
        <h1>Home</h1>
      </div>

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

      <div className="action-buttons">
        <button
          className="inventory-button"
          onClick={() => setShowInventory(!showInventory)}
        >
          Inventory
        </button>
        {showWorkEatButtons && (
          <>
            <button className="action-button" onClick={work}>
              Work
            </button>
            <button className="action-button" onClick={eat}>
              Eat
            </button>
          </>
        )}
        {showSleepButton && (
          <button className="action-button" onClick={sleep}>
            Sleep
          </button>
        )}
        {showHygieneButton && (
          <button
            className="action-button"
            onClick={() => updateStats({ hygiene: 100 })}
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
                    <button
                      onClick={() =>
                        setInventory(inventory.filter((_, i) => i !== index))
                      }
                    >
                      Remove
                    </button>
                  </div>
                ))
              )}
            </div>
            <button
              className="close-inventory"
              onClick={() => setShowInventory(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div className="arrow-keys">
        <button onClick={() => moveCharacter("up")} className="arrow-button up">
          ▲
        </button>
        <div className="left-right">
          <button
            onClick={() => moveCharacter("left")}
            className="arrow-button left"
          >
            ◀
          </button>
          <button
            onClick={() => moveCharacter("right")}
            className="arrow-button right"
          >
            ▶
          </button>
        </div>
        <button
          onClick={() => moveCharacter("down")}
          className="arrow-button down"
        >
          ▼
        </button>
      </div>
    </div>
  );
}

export default Home;
