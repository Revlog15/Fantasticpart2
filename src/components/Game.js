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

  const [position, setPosition] = useState({ x: 17, y: 23 });
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
  const [showDialog, setShowDialog] = useState(false);
  const [currentDialog, setCurrentDialog] = useState(null);

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

  // Update stats with limits whenever they change
  useEffect(() => {
    updateStats();
  }, [stats]);

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

  // Define NPCs
  const npcs = [
    {
      id: 1,
      name: "El Pemandu",
      x: 32,
      y: 58,
      image: "npc_elpemandu",
      description: "Seorang pemandu yang akan membantu perjalananmu.",
      dialogs: {
        initial: [
          "Halo! Saya El Pemandu, pemandu perjalananmu. Saya akan membantu kamu memahami cara bermain game ini.",
        ],
        options: [
          "Ya, saya ingin belajar cara bermain.",
          "Tidak, saya sudah tahu.",
        ],
        responses: {
          ask: [
            {
              text: "Baik, mari kita mulai dengan hal yang paling penting:",
              options: ["Lanjutkan"],
              onSelect: () => ({
                text: "Perhatikan stats kamu (Happiness, Hunger, Sleep, Hygiene). Jangan biarkan salah satu dari stats tersebut mencapai 0, karena itu akan menyebabkan GAME OVER!",
                options: ["Mengerti, apa lagi?"],
                onSelect: () => ({
                  text: "Kota awal kamu adalah Jakarta. Di sana kamu bisa belajar membuat Kerak Telor. Setiap kota memiliki makanan khasnya sendiri yang bisa kamu pelajari.",
                  options: ["Kota apa saja yang bisa saya kunjungi?"],
                  onSelect: () => ({
                    text: "Kamu bisa mengunjungi:\n1. Jakarta (Kota Awal)\n2. Padang (Rendang)\n3. Papua (Papeda)\n4. Magelang\n\nUntuk membuka kota baru, kamu bisa:\n1. Mengumpulkan emas dan membelinya\n2. Atau menyelesaikan quest di kota sebelumnya",
                    options: ["Terima kasih atas informasinya!"],
                    onSelect: () => setShowDialog(false),
                  }),
                }),
              }),
            },
          ],
          decline:
            "Baik, jika kamu membutuhkan bantuan atau lupa cara bermain, jangan ragu untuk bertanya lagi!",
        },
      },
    },
  ];

  // Define town coordinates with percentage values
  const towns = {
    home: { x: 14, y: 21, name: "Home" },
    jakarta: { x: 12, y: 57, name: "Jakarta" },
    padang: { x: 45, y: 84, name: "Padang" },
    papua: { x: 86, y: 86, name: "Papua" },
    magelang: { x: 81, y: 28, name: "Magelang" },
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
    setPosition((prev) => {
      let { x, y } = prev;
      const step = 1;
      let newDirection = direction;
      let newImage = characterImage;
      switch (moveDirection) {
        case "left":
          x = Math.max(x - step, 0);
          newDirection = "left";
          newImage = getImageName("left");
          break;
        case "right":
          x = Math.min(x + step, 100);
          newDirection = "right";
          newImage = getImageName("right");
          break;
        case "up":
          y = Math.max(y - step, 0);
          newDirection = "up";
          newImage = getImageName("left");
          break;
        case "down":
          y = Math.min(y + step, 100);
          newDirection = "down";
          newImage = getImageName("right");
          break;
        default:
          return prev;
      }
      setDirection(newDirection);
      setCharacterImage(newImage);
      checkNearTown(x, y);
      checkNearSign(x, y);
      return { x, y };
    });
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
    setPosition({ x: 50, y: 50 });
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
    setPosition({ x: 50, y: 50 });
    setShowDeathScreen(false);
  };

  // Function to handle NPC dialog
  const handleDialog = (npc) => {
    // Fungsi untuk membuat dan menampilkan langkah dialog
    const displayDialogStep = (dialogData) => {
      // Pastikan options selalu array untuk mencegah error rendering
      if (!Array.isArray(dialogData.options)) {
        console.error("Dialog options is not an array:", dialogData.options);
        setShowDialog(false); // Sembunyikan dialog jika ada data yang salah
        return;
      }

      setCurrentDialog({
        text: dialogData.text,
        options: dialogData.options,
        onSelect: (optionIndex) => {
          if (dialogData.onSelect) {
            const nextStepData = dialogData.onSelect(optionIndex);
            if (nextStepData) {
              // Jika ada langkah selanjutnya, tampilkan
              displayDialogStep(nextStepData);
            } else {
              // Jika tidak ada, tutup dialog
              setShowDialog(false);
              setCurrentDialog(null);
            }
          } else {
            // Tutup dialog jika tidak ada handler onSelect
            setShowDialog(false);
            setCurrentDialog(null);
          }
        },
      });
    };

    // Struktur dialog yang lebih aman
    const dialogTree = {
      initial: {
        text: "Halo! Saya El Pemandu, pemandu perjalananmu. Saya akan membantu kamu memahami cara bermain game ini.",
        options: ["Ya, saya ingin belajar.", "Tidak, saya sudah tahu."],
        onSelect: (index) => {
          if (index === 0) return dialogTree.ask;
          if (index === 1) return dialogTree.decline;
        },
      },
      ask: {
        text: "Baik, mari kita mulai dengan hal yang paling penting: Perhatikan stats kamu (Happiness, Hunger, Sleep, Hygiene). Jangan biarkan salah satu dari stats tersebut mencapai 0, karena itu akan menyebabkan GAME OVER!",
        options: ["Mengerti, apa lagi?"],
        onSelect: () => dialogTree.explainCities,
      },
      explainCities: {
        text: "Kota awal kamu adalah Jakarta. Di sana kamu bisa belajar membuat Kerak Telor. Setiap kota memiliki makanan khasnya sendiri yang bisa kamu pelajari.",
        options: ["Kota apa saja yang bisa saya kunjungi?"],
        onSelect: () => dialogTree.listCities,
      },
      listCities: {
        text: "Kamu bisa mengunjungi:\n1. Jakarta (Kota Awal)\n2. Padang (Rendang)\n3. Papua (Papeda)\n4. Magelang\n\nUntuk membuka kota baru, kamu bisa mengumpulkan emas dan membelinya atau menyelesaikan quest.",
        options: ["Terima kasih atas informasinya!"],
        onSelect: () => null, // Opsi terakhir, kembalikan null untuk menutup
      },
      decline: {
        text: "Baik, jika kamu membutuhkan bantuan atau lupa cara bermain, jangan ragu untuk bertanya lagi!",
        options: ["Baik"],
        onSelect: () => null, // Opsi terakhir, kembalikan null untuk menutup
      },
    };

    setShowDialog(true);
    // Mulai dialog dari langkah awal
    displayDialogStep(dialogTree.initial);
  };

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
        <TownComponent
          onReturn={returnToMainMap}
          stats={stats}
          updateStats={updateSpecificStats}
        />
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
    <div
      ref={gameContainerRef}
      className="game-container"
      tabIndex={0}
      style={{
        backgroundImage: `url('/Picture/map-utama.jpg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        width: "100vw",
        height: "100vh",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {currentTown ? (
        // Town components rendering
        <>
          {currentTown === "jakarta" && (
            <Jakarta
              onReturn={returnToMainMap}
              stats={stats}
              updateStats={updateSpecificStats}
            />
          )}
          {currentTown === "padang" && (
            <Padang
              onReturn={returnToMainMap}
              stats={stats}
              updateStats={updateSpecificStats}
            />
          )}
          {currentTown === "papua" && (
            <Papua
              onReturn={returnToMainMap}
              stats={stats}
              updateStats={updateSpecificStats}
            />
          )}
          {currentTown === "magelang" && (
            <Magelang onReturn={returnToMainMap} />
          )}
          {currentTown === "home" && (
            <Home
              onReturn={returnToMainMap}
              stats={stats}
              updateStats={updateSpecificStats}
              work={work}
              eat={eat}
              sleep={sleep}
            />
          )}
        </>
      ) : (
        // Main map rendering
        <>
          {/* Player Name and Welcome Message */}
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
          <div className="time-display-container">
            <div className="time-display">
              <span>Day {gameTime.day}</span>
              <div className="time-text">
                {formatTime(gameTime.hours, gameTime.minutes)}
              </div>
            </div>
          </div>

          {/* Stats display */}
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
              transform: "translate(-50%, -50%)", // Center the character
              zIndex: 100,
            }}
          />

          {/* NPCs */}
          {npcs.map((npc) => {
            const distance = Math.sqrt(
              Math.pow(position.x - npc.x, 2) + Math.pow(position.y - npc.y, 2)
            );
            const isNearby = distance < 5; // NPC detection radius

            return (
              <div key={npc.id}>
                <div
                  style={{
                    position: "absolute",
                    left: `${npc.x}%`,
                    top: `${npc.y}%`,
                    width: `${CHARACTER_SIZE}px`,
                    height: `${CHARACTER_SIZE}px`,
                    backgroundImage: `url('/Picture/${npc.image}.png')`,
                    backgroundSize: "contain",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center",
                    zIndex: 90,
                    transform: "translate(-50%, -50%)",
                  }}
                />
                {isNearby && (
                  <button
                    className="npc-interaction-button"
                    onClick={() => handleDialog(npc)}
                    style={{
                      position: "absolute",
                      left: `${npc.x}%`,
                      top: `${npc.y - 5}%`,
                      transform: "translate(-50%, -50%)",
                      zIndex: 1000,
                      backgroundColor: "rgba(0, 0, 0, 0.8)",
                      color: "white",
                      padding: "8px 15px",
                      borderRadius: "5px",
                      border: "2px solid #ffd700",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      fontSize: "14px",
                      boxShadow: "0 0 10px rgba(255, 215, 0, 0.3)",
                      transition: "all 0.3s ease",
                    }}
                  >
                    Talk to {npc.name}
                  </button>
                )}
              </div>
            );
          })}

          {/* Dialog Box */}
          {showDialog && currentDialog && (
            <div
              className="dialog-box"
              style={{
                position: "fixed",
                bottom: "20%",
                left: "50%",
                transform: "translateX(-50%)",
                backgroundColor: "rgba(0, 0, 0, 0.9)",
                padding: "20px",
                borderRadius: "10px",
                border: "2px solid #ffd700",
                color: "white",
                width: "80%",
                maxWidth: "600px",
                zIndex: 1000,
                boxShadow: "0 0 20px rgba(255, 215, 0, 0.3)",
              }}
            >
              <div className="dialog-content">
                <div
                  className="dialog-text"
                  style={{
                    marginBottom: "15px",
                    fontSize: "16px",
                    lineHeight: "1.5",
                    whiteSpace: "pre-line",
                  }}
                >
                  {currentDialog.text}
                </div>
                <div
                  className="dialog-options"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  {(Array.isArray(currentDialog.options) &&
                  currentDialog.options.length > 0
                    ? currentDialog.options
                    : ["Tutup"]
                  ).map((option, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        if (currentDialog.onSelect) {
                          currentDialog.onSelect(index);
                        } else {
                          setShowDialog(false);
                          setCurrentDialog(null);
                        }
                      }}
                      style={{
                        backgroundColor: "#FFD700",
                        color: "#222",
                        border: "3px solid #222",
                        padding: "14px 24px",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontSize: "18px",
                        fontWeight: "bold",
                        marginBottom: "10px",
                        zIndex: 2000,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                        width: "100%",
                        outline: "none",
                      }}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Coordinates Display */}
          <div className="coordinates-display">
            X: {Math.round(position.x)}% Y: {Math.round(position.y)}%
          </div>

          {/* Action Bar */}
          <div className="action-bar">
            <button className="inventory-button" onClick={toggleInventory}>
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

          {/* Virtual Controls */}
          <div className="arrow-keys">
            <button
              className="arrow-button"
              onMouseDown={() => handleButtonStart("up")}
              onMouseUp={handleButtonEnd}
              onMouseLeave={handleButtonEnd}
              onTouchStart={() => handleButtonStart("up")}
              onTouchEnd={handleButtonEnd}
            >
              ↑
            </button>
            <div className="left-right">
              <button
                className="arrow-button"
                onMouseDown={() => handleButtonStart("left")}
                onMouseUp={handleButtonEnd}
                onMouseLeave={handleButtonEnd}
                onTouchStart={() => handleButtonStart("left")}
                onTouchEnd={handleButtonEnd}
              >
                ←
              </button>
              <button
                className="arrow-button"
                onMouseDown={() => handleButtonStart("down")}
                onMouseUp={handleButtonEnd}
                onMouseLeave={handleButtonEnd}
                onTouchStart={() => handleButtonStart("down")}
                onTouchEnd={handleButtonEnd}
              >
                ↓
              </button>
              <button
                className="arrow-button"
                onMouseDown={() => handleButtonStart("right")}
                onMouseUp={handleButtonEnd}
                onMouseLeave={handleButtonEnd}
                onTouchStart={() => handleButtonStart("right")}
                onTouchEnd={handleButtonEnd}
              >
                →
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Game;
