import React, { useState, useEffect, useRef } from "react";
import "./Town.css";

function Magelang({ onReturn, stats, updateStats }) {
  const CHARACTER_SIZE = 150;
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [characterImage, setCharacterImage] = useState("revlog-idle");
  const [isLeaving, setIsLeaving] = useState(false);
  const [showClouds, setShowClouds] = useState(true);
  const [nearNPC, setNearNPC] = useState(null); // State untuk melacak NPC terdekat
  const [showDialog, setShowDialog] = useState(false);
  const [currentDialog, setCurrentDialog] = useState([]);
  const [typedText, setTypedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [dialogIndex, setDialogIndex] = useState(0);
  const TYPING_SPEED = 30; // milliseconds per character
  const typingIntervalRef = useRef(null);

  const NPC_DETECTION_RADIUS = 10; // Radius deteksi NPC dalam persentase

  // Get selected character from localStorage
  const selectedCharacter = localStorage.getItem("selectedCharacter") || "revlog";

  // Define NPCs for Magelang
  const npcs = [
    {
      id: 1,
      name: "Anosheep",
      x: 20,
      y: 30,
      image: "npc_anosheep",
      description: "Seorang Anosheep di Magelang.",
      dialogs: [
        "Selamat datang di Magelang! Saya Anosheep, senang bertemu denganmu.",
        "Semoga harimu menyenangkan di sini!",
      ],
    },
    {
      id: 2,
      name: "Bebi",
      x: 80,
      y: 40,
      image: "npc_bebi",
      description: "Bebi, penduduk lokal Magelang.",
      dialogs: [
        "Halo! Magelang sangat indah, bukan?",
        "Jangan lupa kunjungi tempat-tempat bersejarah.",
      ],
    },
    {
      id: 3,
      name: "Dinozaurus",
      x: 40,
      y: 70,
      image: "npc_dinozaurus",
      description: "Dinozaurus, pedagang di Magelang.",
      dialogs: [
        "Butuh sesuatu? Saya punya banyak barang menarik.",
        "Coba lihat koleksi saya!",
      ],
    },
    {
      id: 4,
      name: "Merdeka",
      x: 60,
      y: 85,
      image: "npc_merdeka",
      description: "Merdeka, penjelajah di Magelang.",
      dialogs: [
        "Sudahkah kamu menjelajahi semua sudut Magelang?",
        "Ada banyak misteri di sini, lho.",
      ],
    },
  ];

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
      checkNearNPC(x, y); // Cek NPC setelah bergerak
      return { x, y };
    });
  };

  // Check if character is near an NPC
  const checkNearNPC = (x, y) => {
    for (const npc of npcs) {
      const distance = Math.sqrt(
        Math.pow(x - npc.x, 2) + Math.pow(y - npc.y, 2)
      );
      if (distance < NPC_DETECTION_RADIUS) {
        setNearNPC(npc);
        return;
      }
    }
    setNearNPC(null);
  };

  // Handle keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (showDialog) return; // Jangan bergerak jika dialog terbuka
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
        case "Enter":
          if (nearNPC) {
            handleDialog(nearNPC);
          }
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
  }, [selectedCharacter, position, nearNPC, showDialog]); // Tambahkan dependensi

  // Effect to check proximity to NPCs after movement
  useEffect(() => {
    checkNearNPC(position.x, position.y);
  }, [position]);

  // Dialog logic
  const createDialogMessage = (text, speaker) => ({ text, speaker });

  const handleDialog = (npc) => {
    setNearNPC(npc);
    setShowDialog(true);
    setDialogIndex(0);
    setCurrentDialog(npc.dialogs.map(msg => createDialogMessage(msg, npc.name)));
    setTypedText("");
    setIsTyping(true);
  };

  const handleNextDialog = () => {
    if (isTyping) {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
      setTypedText(currentDialog[dialogIndex].text);
      setIsTyping(false);
      return;
    }

    if (dialogIndex < currentDialog.length - 1) {
      setDialogIndex(prev => prev + 1);
      setTypedText("");
      setIsTyping(true);
    } else {
      setShowDialog(false);
      setNearNPC(null);
      setDialogIndex(0);
      setCurrentDialog([]);
    }
  };

  useEffect(() => {
    if (isTyping && currentDialog[dialogIndex]) {
      let i = 0;
      setTypedText("");
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
      typingIntervalRef.current = setInterval(() => {
        setTypedText(prev => prev + currentDialog[dialogIndex].text[i]);
        i++;
        if (i === currentDialog[dialogIndex].text.length) {
          clearInterval(typingIntervalRef.current);
          setIsTyping(false);
        }
      }, TYPING_SPEED);
    } else if (!currentDialog[dialogIndex]) {
      // Handle case where dialog is unexpectedly empty or index is out of bounds
      setShowDialog(false);
      setNearNPC(null);
    }

    return () => {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
    };
  }, [currentDialog, dialogIndex, isTyping]);

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
          backgroundImage: "url('/Picture/Map Magelang .png')",
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

      {/* NPCs */}
      {npcs.map((npc) => (
        <div
          key={npc.id}
          style={{
            position: "absolute",
            left: `${npc.x}%`,
            top: `${npc.y}%`,
            width: "100px", // Ukuran NPC, sesuaikan jika perlu
            height: "100px", // Ukuran NPC, sesuaikan jika perlu
            backgroundImage: `url('/Picture/${npc.image}.png')`, // Pastikan gambar NPC ada
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            zIndex: 90,
            transform: "translate(-50%, -50%)",
            cursor: nearNPC && nearNPC.id === npc.id ? "pointer" : "default",
          }}
          onClick={() => handleDialog(npc)}
        />
      ))}

      {/* Dialog Box */}
      {showDialog && nearNPC && currentDialog.length > 0 && (
        <div className="dialog-box">
          <div className="dialog-speaker">{currentDialog[dialogIndex].speaker}</div>
          <div className="dialog-text">{typedText}</div>
          <button className="dialog-button" onClick={handleNextDialog}>
            {isTyping ? "Skip" : "Next"}
          </button>
        </div>
      )}

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
