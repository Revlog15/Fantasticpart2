import React, { useState, useEffect, useRef } from "react";
import "../styles/Game.css";

// Import town components (assuming these paths are correct)
import Jakarta from "../towns/Jakarta";
import Padang from "../towns/Padang";
import Papua from "../towns/Papua";
import Magelang from "../towns/Magelang";
import Home from "../towns/Home";

function Game() {
  console.log("Game component is rendering/re-rendering..."); // Debug log at the top
  const CHARACTER_SIZE = 150;

  // Get selected character and player name from localStorage
  const selectedCharacter =
    localStorage.getItem("selectedCharacter") || "revlog";
  const playerName = localStorage.getItem("playerName") || "Player";

  console.log("Selected Character:", selectedCharacter); // Debug log

  const [position, setPosition] = useState({ x: 400, y: 300 }); // Start near center for better visibility initially
  const [direction, setDirection] = useState("right");
  const [characterImage, setCharacterImage] = useState(
    `${selectedCharacter}-idle`
  );
  const [moveInterval, setMoveInterval] = useState(null);

  const positionRef = useRef(position); // Create a ref for position

  // Character stats
  const [stats, setStats] = useState(() => {
    const savedStats = localStorage.getItem("gameStats");
    return savedStats
      ? JSON.parse(savedStats)
      : {
          happiness: 100,
          hunger: 100,
          sleep: 100,
          hygiene: 100,
          gold: 0,
        };
  });

  // Add time state
  const [gameTime, setGameTime] = useState({
    hours: 6, // Start at 6 AM
    minutes: 0,
    day: 1,
  });

  // Add inventory state
  const [inventory, setInventory] = useState([]);
  const [showInventory, setShowInventory] = useState(false);
  const [currentTown, setCurrentTown] = useState(null);
  const [showExploreButton, setShowExploreButton] = useState(false);
  const [nearSign, setNearSign] = useState(null);
  const [showSignDetails, setShowSignDetails] = useState(false);
  const [showDeathScreen, setShowDeathScreen] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [showGlobalInventory, setShowGlobalInventory] = useState(false);

  console.log("Initial Character Image:", `${selectedCharacter}-idle`); // Debug log
  console.log("Full Image Path:", `/Picture/${selectedCharacter}-idle.png`); // Debug log

  // Ref for the game container to get its dimensions
  const gameContainerRef = useRef(null);

  // Update stats with limits
  const updateStats = () => {
    setStats((prevStats) => {
      const newStats = {
        ...prevStats,
        happiness: Math.max(0, Math.min(100, prevStats.happiness)),
        hunger: Math.max(0, Math.min(100, prevStats.hunger)),
        sleep: Math.max(0, Math.min(100, prevStats.sleep)),
        hygiene: Math.max(0, Math.min(100, prevStats.hygiene)),
        gold: Math.max(0, prevStats.gold),
      };
      localStorage.setItem("gameStats", JSON.stringify(newStats));
      return newStats;
    });
  };

  // Function to update specific stats
  const updateSpecificStats = (newStats) => {
    setStats((prevStats) => ({
      ...prevStats,
      ...newStats,
    }));
    updateStats();
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
    } else {
      console.log("Not enough gold to eat!"); // Provide feedback
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

  // Apply stat decay every few seconds
  useEffect(() => {
    const statDecayInterval = setInterval(() => {
      setStats((prevStats) => ({
        ...prevStats,
        happiness: prevStats.happiness > 0 ? prevStats.happiness - 1 : 0,
        hunger: prevStats.hunger > 0 ? prevStats.hunger - 1 : 0,
        sleep: prevStats.sleep > 0 ? prevStats.sleep - 1 : 0,
        hygiene: prevStats.hygiene > 0 ? prevStats.hygiene - 1 : 0,
      }));
    }, 5000); // Decrease stats every 5 seconds

    return () => clearInterval(statDecayInterval);
  }, []);

  // Effect to keep positionRef updated with the latest position state
  useEffect(() => {
    positionRef.current = position;
  }, [position]); // Update ref whenever position state changes

  // Add time tracking effect
  useEffect(() => {
    const timeInterval = setInterval(() => {
      setGameTime((prevTime) => {
        let newMinutes = prevTime.minutes + 1;
        let newHours = prevTime.hours;
        let newDay = prevTime.day;

        if (newMinutes >= 60) {
          newMinutes = 0;
          newHours += 1;
        }

        if (newHours >= 24) {
          newHours = 0;
          newDay += 1;
        }

        return {
          hours: newHours,
          minutes: newMinutes,
          day: newDay,
        };
      });
    }, 1000); // Update every second

    return () => clearInterval(timeInterval);
  }, []);

  // Format time for display
  const formatTime = (hours, minutes) => {
    const period = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, "0");
    return `${displayHours}:${displayMinutes} ${period}`;
  };

  // Get greeting based on game time
  const getGreeting = (hours) => {
    if (hours >= 5 && hours < 12) {
      return "Selamat pagi";
    } else if (hours >= 12 && hours < 15) {
      return "Selamat siang";
    } else if (hours >= 15 && hours < 19) {
      return "Selamat sore";
    } else {
      return "Selamat malam";
    }
  };

  // Define signs for the main map
  const signs = [
    {
      id: 1,
      x: 880,
      y: 138,
      name: "Glora Bung Karno",
      description:
        "The central administrative building of the town. Here you can find important information and quests.",
    },
    {
      id: 2,
      x: 235,
      y: 588,
      name: "UMN",
      description:
        "A bustling marketplace where you can buy and sell items. Various merchants offer their wares here.",
    },
    {
      id: 3,
      x: 865,
      y: 453,
      name: "Danau TOBA",
      description:
        "A place to train and improve your skills. Various training facilities are available for different abilities.",
    },
  ];

  // Define town coordinates
  const towns = {
    home: { x: 130, y: 96, name: "Home" },
    jakarta: { x: 100, y: 330, name: "Jakarta" },
    padang: { x: 625, y: 558, name: "Padang" },
    papua: { x: 1240, y: 558, name: "Papua" },
    magelang: { x: 1180, y: 108, name: "Magelang" },
  };

  // Check if character is near a town
  const checkNearTown = (x, y) => {
    const TOWN_DETECTION_RADIUS = 100; // Increased detection radius
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
    const SIGN_DETECTION_RADIUS = 80; // Increased detection radius
    console.log("Checking signs at position:", x, y); // Debug log

    for (const sign of signs) {
      const distance = Math.sqrt(
        Math.pow(x - sign.x, 2) + Math.pow(y - sign.y, 2)
      );
      console.log(`Distance to ${sign.name}:`, distance); // Debug log

      if (distance < SIGN_DETECTION_RADIUS) {
        console.log("Near sign:", sign.name); // Debug log
        setNearSign(sign);
        return;
      }
    }
    console.log("Not near any sign"); // Debug log
    setNearSign(null);
  };

  // Helper function to get the correct image name
  const getImageName = (direction) => {
    // Handle specific cases like dimsum's left image filename
    if (
      selectedCharacter === "dimsum" &&
      (direction === "left" || direction === "up")
    ) {
      return "dimsum left";
    }
    return `${selectedCharacter}-${direction}`;
  };

  // Function to handle character movement
  const moveCharacter = (moveDirection) => {
    console.log("moveCharacter called with direction:", moveDirection); // Log moveCharacter call
    const step = 15; // Increased step for faster movement
    const gameContainer = gameContainerRef.current;
    if (!gameContainer) return; // Ensure ref is available

    const containerRect = gameContainer.getBoundingClientRect();
    // Assuming map size is larger than the window and scrolls, need actual map dimensions or use window for limits
    const gameWidth = window.innerWidth; // Fallback to window if map dimensions not available
    const gameHeight = window.innerHeight; // Fallback to window if map dimensions not available

    let { x, y } = positionRef.current; // Use positionRef.current here

    switch (moveDirection) {
      case "left":
        x = Math.max(x - step, 0);
        setDirection("left");
        setCharacterImage(getImageName("left"));
        break;
      case "right":
        x = Math.min(x + step, gameWidth - CHARACTER_SIZE);
        setDirection("right");
        setCharacterImage(getImageName("right"));
        break;
      case "up":
        y = Math.max(y - step, 0);
        setDirection("up");
        // Use left-facing image for up movement (common in 2D games)
        setCharacterImage(getImageName("left"));
        break;
      case "down":
        y = Math.min(y + step, gameHeight - CHARACTER_SIZE);
        setDirection("down");
        // Use right-facing image for down movement (common in 2D games)
        setCharacterImage(getImageName("right"));
        break;
      default:
        return;
    }
    console.log("New position:", { x, y }); // Log new calculated position
    setPosition({ x, y });
    console.log("State position updated to:", { x, y }); // Log position state update
  };

  // Effect to check proximity to towns and signs after movement
  useEffect(() => {
    console.log("Position changed, checking proximity:", position); // Debug log
    checkNearTown(position.x, position.y);
    checkNearSign(position.x, position.y);
  }, [position]);

  // Also add this debug info to see nearSign state:
  useEffect(() => {
    console.log("nearSign state changed:", nearSign);
  }, [nearSign]);

  // Handle keydown for keyboard movement
  useEffect(() => {
    const handleKeyDown = (event) => {
      console.log("Key pressed:", event.key); // Log key press
      // alert('Key pressed!'); // Temporary alert - Removed
      // event.stopPropagation(); // Stop event propagation - Removed
      // event.preventDefault(); // Prevent default browser action - Removed
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

    const handleKeyUp = () => {
      setCharacterImage(`${selectedCharacter}-idle`);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [selectedCharacter]); // Depend on selectedCharacter to update image logic

  // Handle button press (hold) and release for virtual controls
  const handleButtonStart = (direction) => {
    console.log("Button pressed:", direction); // Log button press
    // Clear any existing interval before starting a new one
    if (moveInterval) clearInterval(moveInterval);
    moveCharacter(direction);
    const interval = setInterval(() => {
      moveCharacter(direction);
    }, 100);
    setMoveInterval(interval);
  };

  const handleButtonEnd = () => {
    if (moveInterval) {
      clearInterval(moveInterval);
      setMoveInterval(null);
    }
    setCharacterImage(`${selectedCharacter}-idle`);
  };

  // Clean up move interval on component unmount
  useEffect(() => {
    return () => {
      if (moveInterval) clearInterval(moveInterval);
    };
  }, [moveInterval]);

  // Effect to focus the game container after mounting
  useEffect(() => {
    if (gameContainerRef.current) {
      gameContainerRef.current.focus();
    }
  }, []); // Empty dependency array ensures this runs once after initial render

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

  // Function to explore town
  const exploreTown = (townId) => {
    // Set the current town state to trigger the town component render
    setCurrentTown(townId);

    // Store the current position to return to later
    localStorage.setItem(
      "returnPosition",
      JSON.stringify({
        x: position.x,
        y: position.y,
      })
    );
  };

  // Function to return to main map
  const returnToMainMap = () => {
    setCurrentTown(null);
    // Return to a safe position on the main map
    setPosition({ x: 400, y: 300 });
  };

  const handleCheckOut = () => {
    if (nearSign) {
      setShowSignDetails(true);
    }
  };

  const closeSignDetails = () => {
    setShowSignDetails(false);
    setNearSign(null); // Clear near sign state when modal is closed
  };

  // Calculate final score
  const calculateScore = () => {
    const statsScore =
      (stats.happiness + stats.hunger + stats.sleep + stats.hygiene) * 2;
    const goldScore = stats.gold * 5;
    const dayBonus = gameTime.day * 100;
    return statsScore + goldScore + dayBonus;
  };

  // Check for game over condition
  useEffect(() => {
    if (
      stats.happiness <= 0 ||
      stats.hunger <= 0 ||
      stats.sleep <= 0 ||
      stats.hygiene <= 0
    ) {
      setShowDeathScreen(true);
      setFinalScore(calculateScore());
    }
  }, [stats]);

  // Function to restart game
  const restartGame = () => {
    // Reset global stats
    const initialStats = {
      happiness: 100,
      hunger: 100,
      sleep: 100,
      hygiene: 100,
      gold: 0,
    };
    setStats(initialStats);
    localStorage.setItem("gameStats", JSON.stringify(initialStats));
    setGameTime({
      hours: 6,
      minutes: 0,
      day: 1,
    });
    setPosition({ x: 400, y: 300 });
    setShowDeathScreen(false);

    // Hapus progress, inventory, dan stats dari semua map
    localStorage.removeItem('jakartaInventory');
    localStorage.removeItem('jakartaProgress');
    localStorage.removeItem('jakartaStats');
    localStorage.removeItem('padangInventory');
    localStorage.removeItem('padangProgress');
    localStorage.removeItem('padangStats');
    localStorage.removeItem('papuaInventory');
    localStorage.removeItem('papuaProgress');
    localStorage.removeItem('papuaStats');
    localStorage.removeItem('magelangInventory');
    localStorage.removeItem('magelangProgress');
    localStorage.removeItem('magelangStats');
  };

  // Semua useEffect di sini!
  useEffect(() => {
    function reloadStats() {
      const savedStats = localStorage.getItem("gameStats");
      if (savedStats) setStats(JSON.parse(savedStats));
    }
    window.addEventListener("focus", reloadStats);
    return () => window.removeEventListener("focus", reloadStats);
  }, []);

  useEffect(() => {
    const handleBeforeUnload = () => {
      // Hapus progress, inventory, dan stats dari semua map
      localStorage.removeItem('jakartaInventory');
      localStorage.removeItem('jakartaProgress');
      localStorage.removeItem('jakartaStats');
      localStorage.removeItem('padangInventory');
      localStorage.removeItem('padangProgress');
      localStorage.removeItem('padangStats');
      localStorage.removeItem('papuaInventory');
      localStorage.removeItem('papuaProgress');
      localStorage.removeItem('papuaStats');
      localStorage.removeItem('magelangInventory');
      localStorage.removeItem('magelangProgress');
      localStorage.removeItem('magelangStats');
      localStorage.removeItem('gameStats');
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const savedStats = localStorage.getItem("gameStats");
      if (savedStats) setStats(JSON.parse(savedStats));
    }, 200); // 0.2 detik
    return () => clearInterval(interval);
  }, []);

  // Setelah semua useEffect, baru boleh ada if (currentTown) { ... } atau if (showDeathScreen) { ... }

  // Render town component if in a town view
  if (currentTown) {
    if (currentTown === "home") {
      return (
        <div
          className="town-container"
          style={{ position: "relative", width: "100%", height: "100vh" }}
        >
          <Home
            onReturn={returnToMainMap}
            stats={stats}
            updateStats={updateSpecificStats}
            work={work}
            eat={eat}
            sleep={sleep}
          />
        </div>
      );
    }

    const TownComponent = {
      jakarta: Jakarta,
      padang: Padang,
      papua: Papua,
      magelang: Magelang,
    }[currentTown];

    return (
      <div className="town-container">
        <TownComponent onReturn={returnToMainMap} stats={stats} updateStats={updateSpecificStats} gameTime={gameTime} formatTime={formatTime} getGreeting={getGreeting} closeSignDetails={closeSignDetails} />
      </div>
    );
  }

  // Main game render
  if (showDeathScreen) {
    return (
      <div className="death-screen">
        <div className="death-content">
          <h1>Game Over</h1>
          <div className="death-stats">
            <h2>Final Stats:</h2>
            <p>Happiness: {stats.happiness}%</p>
            <p>Hunger: {stats.hunger}%</p>
            <p>Sleep: {stats.sleep}%</p>
            <p>Hygiene: {stats.hygiene}%</p>
            <p>Gold: {stats.gold}</p>
            <p>Days Survived: {gameTime.day}</p>
          </div>
          <div className="final-score">
            <h2>Final Score: {finalScore}</h2>
          </div>
          <button className="restart-button" onClick={restartGame}>
            Play Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="game-container">
      {currentTown ? (
        // Render the appropriate town component based on currentTown
        currentTown === "home" ? (
          <Home
            onReturn={returnToMainMap}
            stats={stats}
            updateStats={updateSpecificStats}
            work={work}
            eat={eat}
            sleep={sleep}
          />
        ) : (
          // Add other town components here as needed
          <div>Unknown town</div>
        )
      ) : (
        // Main game view
        <>
          {/* Game Container */}
          <div
            className="game-container"
            ref={gameContainerRef} // Added ref back
            tabIndex="-1" // Make the div focusable
          >
            {/* Nama player di pojok kiri atas dan ucapan selamat datang */}
            <div
              style={{
                position: "absolute",
                top: 16,
                left: 16,
                backgroundColor: "rgba(0,0,0,0.85)",
                color: "#fff",
                padding: "6px 12px",
                borderRadius: "4px",
                zIndex: 200,
                fontFamily: `'Press Start 2P', 'Courier New', monospace`,
                fontWeight: "bold",
                fontSize: "12px",
                letterSpacing: "1px",
                boxShadow: "2px 2px 0 #222",
                border: "2px solid #333",
                textShadow: "1px 1px 0 #000",
                lineHeight: 1.3,
              }}
            >
              {playerName}
              <div
                style={{ fontWeight: "normal", fontSize: "10px", marginTop: 2 }}
              >
                {getGreeting(gameTime.hours)}, {playerName}!
              </div>
            </div>

            {/* Time Display */}
            <div
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                backgroundColor: "rgba(0,0,0,0.85)",
                color: "#fff",
                padding: "6px 12px",
                borderRadius: "4px",
                zIndex: 200,
                fontFamily: `'Press Start 2P', 'Courier New', monospace`,
                fontWeight: "bold",
                fontSize: "12px",
                letterSpacing: "1px",
                boxShadow: "2px 2px 0 #222",
                border: "2px solid #333",
                textShadow: "1px 1px 0 #000",
                lineHeight: 1.3,
              }}
            >
              {formatTime(gameTime.hours, gameTime.minutes)}
              <div
                style={{ fontWeight: "normal", fontSize: "10px", marginTop: 2 }}
              >
                Day {gameTime.day}
              </div>
            </div>

            {/* Coordinate Display */}
            <div
              style={{
                position: "fixed",
                top: "50px",
                left: "50%",
                transform: "translateX(-50%)",
                backgroundColor: "black",
                color: "lime",
                padding: "10px",
                borderRadius: "5px",
                fontFamily: "monospace",
                fontSize: "20px",
                zIndex: 9999,
                border: "2px solid lime",
              }}
            >
              X: {Math.round(position.x)} Y: {Math.round(position.y)}
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

            {/* Action Bar */}
            <div className="action-bar">
              <button className="inventory-button" onClick={() => setShowGlobalInventory(true)}>
                Inventory
              </button>
              {nearSign && (
                <button className="explore-button" onClick={handleCheckOut}>
                  Check out {nearSign.name}
                </button>
              )}
              {showExploreButton && (
                <button
                  className="explore-button"
                  onClick={() =>
                    exploreTown(checkNearTown(position.x, position.y))
                  }
                >
                  Explore
                </button>
              )}
            </div>

            {/* Character Stats */}
            <div className="character-stats">
              <div className="stat-item">
                <span>Happiness:</span>
                <div className="stat-bar happiness-bar">
                  <div
                    className="stat-fill"
                    style={{
                      width: `${stats.happiness}%`,
                      imageRendering: "pixelated",
                      border: "1.5px solid #222",
                    }}
                  >
                    <div className="stat-percentage">{stats.happiness}%</div>
                  </div>
                </div>
              </div>
              <div className="stat-item">
                <span>Hunger:</span>
                <div className="stat-bar hunger-bar">
                  <div
                    className="stat-fill"
                    style={{
                      width: `${stats.hunger}%`,
                      imageRendering: "pixelated",
                      border: "1.5px solid #222",
                    }}
                  >
                    <div className="stat-percentage">{stats.hunger}%</div>
                  </div>
                </div>
              </div>
              <div className="stat-item">
                <span>Sleep:</span>
                <div className="stat-bar sleep-bar">
                  <div
                    className="stat-fill"
                    style={{
                      width: `${stats.sleep}%`,
                      imageRendering: "pixelated",
                      border: "1.5px solid #222",
                    }}
                  >
                    <div className="stat-percentage">{stats.sleep}%</div>
                  </div>
                </div>
              </div>
              <div className="stat-item">
                <span>Hygiene:</span>
                <div className="stat-bar hygiene-bar">
                  <div
                    className="stat-fill"
                    style={{
                      width: `${stats.hygiene}%`,
                      imageRendering: "pixelated",
                      border: "1.5px solid #222",
                    }}
                  >
                    <div className="stat-percentage">{stats.hygiene}%</div>
                  </div>
                </div>
              </div>
              <div className="stat-item gold-item">
                <span>Gold:</span>
                <span className="gold-amount">{stats.gold}</span>
              </div>
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

            {/* Modal Inventory Gabungan */}
            {showGlobalInventory && (
              <div className="inventory-modal">
                <div className="inventory-content">
                  <h2>Inventory</h2>
                  <ul>
                    {(() => {
                      // Gabungkan inventory dari semua map
                      const allInventories = [];
                      const maps = ['jakarta', 'padang', 'papua', 'magelang'];
                      maps.forEach(map => {
                        const inv = JSON.parse(localStorage.getItem(map + 'Inventory') || '[]');
                        allInventories.push(...inv);
                      });
                      if (allInventories.length === 0) return <li><i>Kosong</i></li>;
                      return allInventories.map((item, idx) => <li key={idx}>{item}</li>);
                    })()}
                  </ul>
                  <button className="close-inventory" onClick={() => setShowGlobalInventory(false)}>
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
          </div>{" "}
          {/* End of game-container */}
        </>
      )}
    </div>
  );
}

export default Game;
