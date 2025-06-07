import React, { useState, useEffect, useCallback } from "react";
import "./Town.css";

function Papua({ onReturn, stats, updateStats }) {
  console.log("Papua component rendering..."); // Debug log
  const [isLeaving, setIsLeaving] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [position, setPosition] = useState({ x: 40, y: 30 });
  const [direction, setDirection] = useState("right");
  const [showClouds, setShowClouds] = useState(true);
  const [nearNPC, setNearNPC] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [currentDialog, setCurrentDialog] = useState([]);
  const [showInventory, setShowInventory] = useState(false);
  const [inventory, setInventory] = useState([]);
  const [questProgress, setQuestProgress] = useState({
    hasStartedQuest: false,
    hasPapeda: false,
    hasIkan: false,
    hasSagu: false,
  });
  const [showQuizOptions, setShowQuizOptions] = useState(false);
  const CHARACTER_SIZE = 150;
  const NPC_DETECTION_RADIUS = 15;
  const [typedText, setTypedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [currentSpeaker, setCurrentSpeaker] = useState(null);
  const TYPING_SPEED = 30;
  const [collectingIngredient, setCollectingIngredient] = useState(null);
  const [lastCollectedItem, setLastCollectedItem] = useState(null);
  const [showCookingAnimation, setShowCookingAnimation] = useState(false);
  const [showPapeda, setShowPapeda] = useState(false);
  const [papedaPosition, setPapedaPosition] = useState({ x: 60, y: 40 });
  const [cookingProgress, setCookingProgress] = useState(0);
  const [showCongrats, setShowCongrats] = useState(false);

  const selectedCharacter = (
    localStorage.getItem("selectedCharacter") || "revlog"
  ).toLowerCase();
  const [characterImage, setCharacterImage] = useState(
    `${selectedCharacter}-idle`
  );

  // Debug logs for character image and position
  console.log("Selected Character (lowercase):", selectedCharacter);
  console.log("Initial Character Image State:", characterImage);
  console.log("Character Position:", position.x, position.y);

  // Define NPCs
  const npcs = [
    {
      id: 1,
      name: "Merdeka",
      x: 60,
      y: 50,
      image: "/Picture/npc_merdeka.png",
      description: "A wise old man who teaches how to make Papeda.",
      dialogs: [
        {
          text: "Welcome to Papua! I can teach you how to make Papeda, our traditional dish.",
          options: [
            "Tell me about Papeda",
            "What ingredients do I need?",
            "I'll come back later",
          ],
        },
        {
          text: "Papeda is a traditional Papuan dish made from sago flour. It's a staple food here.",
          options: [
            "How do I make it?",
            "What ingredients do I need?",
            "I'll come back later",
          ],
        },
        {
          text: "You'll need sago flour, fish, and some special spices. Would you like to learn how to make it?",
          options: [
            "Yes, teach me!",
            "Not right now",
            "What's special about it?",
          ],
        },
      ],
    },
    {
      id: 2,
      name: "Anosheep",
      x: 85,
      y: 50,
      image: "/Picture/npc_anosheep.png",
      description: "A seller of fish and seafood products.",
      dialogs: [
        {
          text: "MBEEE! Welcome to my fish shop! Would you like to learn about fishing in Papua?",
          options: [
            "Yes, tell me more",
            "Can I get some fish?",
            "Not interested",
          ],
        },
        {
          text: "The waters here are rich with fish. We use them in many traditional dishes. MBEEE!",
          options: [
            "How do I get some fish?",
            "What's the best way to cook fish?",
            "Thanks for the info",
          ],
        },
      ],
    },
    {
      id: 3,
      name: "Dinozaurus",
      x: 90,
      y: 20,
      image: "/Picture/npc_dinozaurus.png",
      description: "A sago farmer who sells sago flour.",
      dialogs: [
        {
          text: "Welcome! I'm a sago farmer. Would you like to learn about sago?",
          options: [
            "Yes, tell me more",
            "How do I get sago flour?",
            "Not interested",
          ],
        },
        {
          text: "Sago is a starch extracted from the pith of sago palm stems. It's used to make Papeda.",
          options: [
            "How do I get some?",
            "What else can you make with it?",
            "Thanks for the info",
          ],
        },
      ],
    },
    {
      id: 4,
      name: "Bebi",
      x: 30,
      y: 30,
      image: "/Picture/npc_bebi.png",
      description: "A spice merchant who sells special Papuan spices.",
      dialogs: [
        {
          text: "Hello! I sell special Papuan spices. Would you like to learn about them?",
          options: [
            "Yes, tell me more",
            "What spices do you have?",
            "Not interested",
          ],
        },
        {
          text: "Our spices are unique to Papua and make Papeda taste amazing!",
          options: [
            "How do I get some?",
            "What spices do you recommend?",
            "Thanks for the info",
          ],
        },
      ],
    },
  ];

  const handleCollectIngredient = (ingredient) => {
    setCollectingIngredient(ingredient);
    setLastCollectedItem(ingredient);
    setShowOptions(false);
    setShowDialog(false);

    // Update stats based on ingredient collected
    switch (ingredient) {
      case "papeda":
        updateStats({ hunger: stats.hunger + 30 });
        break;
      case "sagu":
        updateStats({ happiness: stats.happiness + 5 });
        break;
      case "ikan":
        updateStats({ happiness: stats.happiness + 5 });
        break;
      default:
        break;
    }

    // Update quest progress
    setQuestProgress((prev) => ({
      ...prev,
      hasPapeda: ingredient === "papeda" ? true : prev.hasPapeda,
      hasSagu: ingredient === "sagu" ? true : prev.hasSagu,
      hasIkan: ingredient === "ikan" ? true : prev.hasIkan,
    }));

    // Add to inventory
    const newItem = {
      id: Date.now(),
      name: ingredient,
      image: `/Picture/${ingredient}.png`,
    };
    setInventory((prev) => [...prev, newItem]);

    // Show collection animation
    setTimeout(() => {
      setCollectingIngredient(null);
    }, 1000);
  };

  const handleCookingComplete = () => {
    setShowCookingAnimation(false);
    setShowPapeda(true);
    setShowCongrats(true);
    updateStats({
      happiness: stats.happiness + 20,
      hunger: stats.hunger + 30,
    });
    setTimeout(() => {
      setShowCongrats(false);
    }, 3000);
  };

  // Handle movement
  const handleKeyDown = useCallback(
    (event) => {
      const step = 1;
      let newPosition = { ...position };
      let newDirection = direction;

      switch (event.key) {
        case "ArrowUp":
          newPosition.y = Math.max(0, position.y - step);
          newDirection = "up";
          break;
        case "ArrowDown":
          newPosition.y = Math.min(100, position.y + step);
          newDirection = "down";
          break;
        case "ArrowLeft":
          newPosition.x = Math.max(0, position.x - step);
          newDirection = "left";
          break;
        case "ArrowRight":
          newPosition.x = Math.min(100, position.x + step);
          newDirection = "right";
          break;
        default:
          return;
      }

      setPosition(newPosition);
      setDirection(newDirection);
      setCharacterImage(`${selectedCharacter}-${newDirection}`);

      // Check for nearby NPCs
      const nearbyNPC = npcs.find((npc) => {
        const dx = npc.x - newPosition.x;
        const dy = npc.y - newPosition.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance <= NPC_DETECTION_RADIUS;
      });

      setNearNPC(nearbyNPC);
    },
    [position, direction, selectedCharacter, npcs]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Handle dialog typing
  useEffect(() => {
    if (showDialog && currentDialog.text) {
      setIsTyping(true);
      let currentIndex = 0;
      const text = currentDialog.text;

      const typeInterval = setInterval(() => {
        if (currentIndex < text.length) {
          setTypedText(text.slice(0, currentIndex + 1));
          currentIndex++;
        } else {
          setIsTyping(false);
          clearInterval(typeInterval);
        }
      }, TYPING_SPEED);

      return () => clearInterval(typeInterval);
    }
  }, [currentDialog.text, showDialog]);

  return (
    <div
      className="town"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "#000",
        overflow: "hidden",
      }}
    >
      {/* Add Stat Bars */}
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

      {/* Background Image */}
      <img
        src="/Picture/papua.jpg"
        alt="Papua"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />

      {/* Character */}
      <div
        className="character"
        style={{
          position: "absolute",
          left: `${position.x}%`,
          top: `${position.y}%`,
          transform: "translate(-50%, -50%)",
          width: `${CHARACTER_SIZE}px`,
          height: `${CHARACTER_SIZE}px`,
          zIndex: 1000,
        }}
      >
        <img
          src={`/Picture/${characterImage}.png`}
          alt="Character"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
          }}
        />
      </div>

      {/* Debug log for actual image source */}
      {console.log("Character IMG src:", `/Picture/${characterImage}.png`)}

      {/* NPCs */}
      {npcs.map((npc) => (
        <div
          key={npc.id}
          className="npc"
          style={{
            position: "absolute",
            left: `${npc.x}%`,
            top: `${npc.y}%`,
            transform: "translate(-50%, -50%)",
            width: "100px",
            height: "100px",
            zIndex: 900,
          }}
        >
          <img
            src={npc.image}
            alt={npc.name}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
            }}
          />
        </div>
      ))}

      {/* Dialog Box */}
      {showDialog && (
        <div className="dialog-box">
          <div className="dialog-content">
            <div className="dialog-text">{typedText}</div>
            {!isTyping && currentDialog.options && (
              <div className="dialog-options">
                {currentDialog.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setShowOptions(true);
                      setShowDialog(false);
                    }}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cooking Animation */}
      {showCookingAnimation && (
        <div className="cooking-animation">
          <div className="cooking-progress">
            <div
              className="progress-bar"
              style={{ width: `${cookingProgress}%` }}
            ></div>
          </div>
          <div className="cooking-text">Cooking Papeda...</div>
        </div>
      )}

      {/* Papeda */}
      {showPapeda && (
        <div
          className="papeda"
          style={{
            position: "absolute",
            left: `${papedaPosition.x}%`,
            top: `${papedaPosition.y}%`,
            transform: "translate(-50%, -50%)",
            cursor: "pointer",
            zIndex: 1000,
          }}
          onClick={() => handleCollectIngredient("papeda")}
        >
          <img
            src="/Picture/papeda.png"
            alt="Papeda"
            style={{ width: "100px", height: "100px" }}
          />
        </div>
      )}

      {/* Congratulations Message */}
      {showCongrats && (
        <div className="congrats-message">
          <h2>Congratulations!</h2>
          <p>You've successfully made Papeda!</p>
        </div>
      )}

      {/* Return Button */}
      <button
        className="return-button"
        onClick={() => {
          setIsLeaving(true);
          setTimeout(onReturn, 1000);
        }}
        style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          zIndex: 1000,
        }}
      >
        Return to Map
      </button>
    </div>
  );
}

export default Papua;
