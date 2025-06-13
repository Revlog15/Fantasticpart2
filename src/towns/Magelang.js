import React, { useState, useEffect, useRef, useCallback } from "react";
import "./Town.css";
import { auth } from "../firebase";

function Magelang({ onReturn, stats, updateStats, inventory, addToInventory }) {
  // Get selected character from localStorage at the very top
  const selectedCharacter = localStorage.getItem("selectedCharacter") || "revlog";

  const CHARACTER_SIZE = 150;
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [characterImage, setCharacterImage] = useState(`${selectedCharacter}-idle`);
  const [isLeaving, setIsLeaving] = useState(false);
  const [showClouds, setShowClouds] = useState(true);
  const [nearNPC, setNearNPC] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [currentDialog, setCurrentDialog] = useState([]);
  const [dialogIndex, setDialogIndex] = useState(0);
  const [showWelcome, setShowWelcome] = useState(true);
  const [typedText, setTypedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const userId = auth.currentUser?.uid;
  const questKey = userId ? `magelangQuestProgress_${userId}` : "magelangQuestProgress";
  const [questProgress, setQuestProgress] = useState(() => {
    const savedQuestProgress = localStorage.getItem(questKey);
    return savedQuestProgress ? JSON.parse(savedQuestProgress) : {
      hasStartedQuest: false,
      hasKupat: false,
      hasTahu: false,
      hasBumbuKuah: false
    };
  });
  const [showInventory, setShowInventory] = useState(false);
  const TYPING_SPEED = 30;
  const typingIntervalRef = useRef(null);
  const NPC_DETECTION_RADIUS = 2;
  const [currentSpeaker, setCurrentSpeaker] = useState(null);
  const [speakerIcon, setSpeakerIcon] = useState(null);
  const [showCookingAnimation, setShowCookingAnimation] = useState(false);
  const [showKupatTahuIcon, setShowKupatTahuIcon] = useState(false);
  const [cookingProgress, setCookingProgress] = useState(0);
  const [showCongrats, setShowCongrats] = useState(false);

  // Function to proceed to the next dialog line or close the dialog
  const handleProceed = () => {
    if (dialogIndex < currentDialog.length - 1) {
      setDialogIndex(prevIndex => prevIndex + 1);
    } else {
      setShowDialog(false); // Close dialog if it's the last one
      setDialogIndex(0); // Reset dialog index
      setCurrentDialog([]); // Clear current dialog
      setTypedText(""); // Clear typed text
      setIsTyping(false); // Stop typing
      setShowOptions(false); // Hide options

      // Clear any pending typing interval when dialog closes
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
        typingIntervalRef.current = null;
      }
    }
  };

  // Typing animation effect logic is now inside useEffect
  // This useCallback is just a setter to trigger the typing effect
  const startTypingEffect = useCallback((textToType) => {
    // Ensure text is a string to prevent undefinedundefined
    const safeText = String(textToType || '');

    // Clear any existing interval before starting a new one
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }

    setIsTyping(true);
    setShowOptions(false);
    setTypedText("");

    let currentChar = 0;
    const textLength = safeText.length;

    if (textLength === 0) {
        setIsTyping(false);
        setShowOptions(true);
        return;
    }

    typingIntervalRef.current = setInterval(() => {
      if (currentChar <= textLength) {
        setTypedText(safeText.substring(0, currentChar));
        currentChar++;
      }

      if (currentChar > textLength) {
        clearInterval(typingIntervalRef.current);
        typingIntervalRef.current = null;
        setIsTyping(false);
        setShowOptions(true);
      }
    }, TYPING_SPEED);

  }, [TYPING_SPEED]);

  // Use effect to trigger typing animation when dialog content changes
  useEffect(() => {
    if (showDialog && currentDialog[dialogIndex] && currentDialog[dialogIndex].text) {
      const dialogItem = currentDialog[dialogIndex];
      setCurrentSpeaker(dialogItem.speaker || "Player");
      setSpeakerIcon(dialogItem.icon || `${process.env.PUBLIC_URL}/Picture/${selectedCharacter}-idle.png`);
      startTypingEffect(dialogItem.text); // Call the new setter
    }

    // Cleanup function for this useEffect to clear interval if component unmounts or dependencies change
    return () => {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
        typingIntervalRef.current = null;
      }
    };
  }, [currentDialog, dialogIndex, showDialog, selectedCharacter, startTypingEffect]); // Depend on startTypingEffect

  // Define NPCs for Magelang with their dialogs and challenges
  const npcs = [
    {
      id: 1,
      name: "Anosheep",
      x: 20,
      y: 30,
      image: "npc_anosheep",
      description: "Seorang Anosheep di Magelang.",
      dialogs: {
        initial: [
          "Selamat datang di Magelang! Saya Anosheep, senang bertemu denganmu.",
          "Saya ingin mengajarkanmu cara membuat makanan khas Magelang, Kupat Tahu Magelang!"
        ],
        options: [
          "Saya ingin belajar membuat Kupat Tahu Magelang!",
          "Mohon bimbingan untuk membuat Kupat Tahu Magelang."
        ],
        response: "Baiklah! Untuk membuat Kupat Tahu Magelang yang lezat, kamu perlu mengumpulkan bahan-bahan khusus. Pertama, carilah kupat dari Dinozaurus di dekat pasar. Dia punya kupat terbaik se-Magelang."
      }
    },
    {
      id: 2,
      name: "Bebi",
      x: 80,
      y: 40,
      image: "npc_bebi",
      description: "Bebi, penduduk lokal Magelang.",
      dialogs: {
        initial: ["Halo! Magelang sangat indah, bukan?"],
        withoutQuest: "Sepertinya kamu belum memulai quest dari Anosheep.",
        withQuest: "Ah, kamu sedang mencari bahan untuk Kupat Tahu Magelang?",
        question: "Apa nama candi Buddha terbesar di dunia yang terletak di Magelang?",
        options: ["Candi Borobudur", "Candi Prambanan", "Candi Mendut", "Candi Pawon"],
        correct: 0,
        success: "Benar sekali! Candi Borobudur adalah warisan dunia yang sangat berharga. Ini bumbu kuah untuk Kupat Tahu Magelangmu!",
        wrong: "Maaf, jawabanmu kurang tepat. Candi Borobudur adalah candi Buddha terbesar di dunia yang terletak di Magelang."
      }
    },
    {
      id: 3,
      name: "Dinozaurus",
      x: 40,
      y: 70,
      image: "npc_dinozaurus",
      description: "Dinozaurus, pedagang di Magelang.",
      dialogs: {
        initial: ["Selamat datang di toko saya!"],
        withoutQuest: "Sepertinya kamu belum memulai quest dari Anosheep.",
        withQuest: "Ah, kamu mencari kupat untuk Kupat Tahu Magelang?",
        question: "Apa nama gunung yang terletak di Magelang?",
        options: ["Gunung Merapi", "Gunung Bromo", "Gunung Rinjani", "Gunung Semeru"],
        correct: 0,
        success: "Benar! Gunung Merapi adalah gunung berapi aktif yang menjadi ikon Magelang. Ini kupat terbaik untukmu!",
        wrong: "Maaf, jawabanmu kurang tepat. Gunung Merapi adalah gunung yang terletak di Magelang."
      }
    },
    {
      id: 4,
      name: "Merdeka",
      x: 60,
      y: 85,
      image: "npc_merdeka",
      description: "Merdeka, penjelajah di Magelang.",
      dialogs: {
        initial: ["Halo, penjelajah muda!"],
        withoutQuest: "Sepertinya kamu belum memulai quest dari Anosheep.",
        withQuest: "Ah, kamu mencari tahu untuk Kupat Tahu Magelang?",
        question: "Apa nama museum yang terkenal di Magelang?",
        options: ["Museum Dirgantara", "Museum Nasional", "Museum Fatahillah", "Museum Bank Indonesia"],
        correct: 0,
        success: "Benar sekali! Museum Dirgantara adalah museum yang menyimpan sejarah penerbangan Indonesia. Ini tahu terbaik untuk Kupat Tahu Magelangmu!",
        wrong: "Maaf, jawabanmu kurang tepat. Museum Dirgantara adalah museum terkenal di Magelang."
      }
    }
  ];

  // Check if character is near an NPC
  const checkNearNPC = (x, y) => {
    let foundNPC = null;
    for (const npc of npcs) {
      const distance = Math.sqrt(
        Math.pow(x - npc.x, 2) + Math.pow(y - npc.y, 2)
      );
      if (distance < NPC_DETECTION_RADIUS) {
        foundNPC = npc;
        break;
      }
    }
    setNearNPC(foundNPC);
  };

  // Handle dialog with NPCs
  const handleDialog = (npc) => {
    setShowDialog(true);
    setDialogIndex(0);
    // Set initial speaker and icon when dialog starts with an NPC
    setCurrentSpeaker(npc.name);
    setSpeakerIcon(`${process.env.PUBLIC_URL}/Picture/${npc.image}.png`);

    if (npc.name === "Anosheep") {
      if (!questProgress.hasStartedQuest) {
        setCurrentDialog([{
          text: String(npc.dialogs.initial[0]), // Ensure initial text is string
          options: ["Saya ingin belajar membuat Kupat Tahu Magelang!", "Mohon bimbingan untuk membuat Kupat Tahu Magelang."],
          onSelect: (option) => {
            setQuestProgress({ ...questProgress, hasStartedQuest: true });
            setCurrentDialog([{
              text: String(npc.dialogs.response), // Ensure response is string
              options: ["Baik, saya akan mencari bahan-bahannya!"],
              onSelect: handleProceed,
              speaker: "Anosheep", // Ensure speaker is set for new dialogs
              icon: `${process.env.PUBLIC_URL}/Picture/npc_anosheep.png`,
            }]);
          }
        }]);
      } else {
        setCurrentDialog([{
          text: "Kamu sudah memulai quest. Carilah bahan-bahan yang diperlukan dari NPC lainnya.",
          options: ["Baik, saya mengerti"],
          onSelect: handleProceed,
          speaker: "Player", // Set speaker to Player when responding to existing quest
          icon: `${process.env.PUBLIC_URL}/Picture/${selectedCharacter}-idle.png`,
        }]);
      }
    } else if (npc.name === "Dinozaurus") {
      if (!questProgress.hasStartedQuest) {
        setCurrentDialog([{
          text: String(npc.dialogs.withoutQuest), // Ensure withoutQuest is string
          options: ["Baik, saya akan menemui Anosheep dulu."],
          onSelect: handleProceed,
          speaker: "Dinozaurus",
          icon: `${process.env.PUBLIC_URL}/Picture/npc_dinozaurus.png`,
        }]);
      } else if (!questProgress.hasKupat) {
        const dinoText = String(npc.dialogs.withQuest) + "\n\n" + String(npc.dialogs.question); // Ensure both parts are strings
        setCurrentDialog([{
          text: dinoText,
          options: ["Gunung Merapi", "Gunung Bromo", "Gunung Rinjani", "Gunung Semeru"],
          onSelect: (optionIndex) => {
            if (optionIndex === 0) { // Gunung Merapi
              setQuestProgress({ ...questProgress, hasKupat: true });
              addToInventory("Kupat");
              setCurrentDialog([{
                text: "Benar! Gunung Merapi adalah gunung berapi aktif yang menjadi ikon Magelang. Ini kupat terbaik untukmu!",
                options: ["Terima kasih!"],
                onSelect: handleProceed,
                speaker: "Dinozaurus",
                icon: `${process.env.PUBLIC_URL}/Picture/npc_dinozaurus.png`,
              }]);
            } else {
              setCurrentDialog([{
                text: "Maaf, jawabanmu kurang tepat. Gunung Merapi adalah gunung yang terletak di Magelang.",
                options: ["Saya akan belajar lagi"],
                onSelect: handleProceed,
                speaker: "Dinozaurus",
                icon: `${process.env.PUBLIC_URL}/Picture/npc_dinozaurus.png`,
              }]);
            }
          }
        }]);
      } else {
        setCurrentDialog([{
          text: "Kamu sudah mendapatkan kupat dariku. Carilah bahan lainnya.",
          options: ["Baik, terima kasih!"],
          onSelect: handleProceed,
          speaker: "Player",
          icon: `${process.env.PUBLIC_URL}/Picture/${selectedCharacter}-idle.png`,
        }]);
      }
    } else if (npc.name === "Bebi") {
      if (!questProgress.hasStartedQuest) {
        setCurrentDialog([{
          text: String(npc.dialogs.withoutQuest), // Ensure withoutQuest is string
          options: ["Baik, saya akan menemui Anosheep dulu."],
          onSelect: handleProceed,
          speaker: "Bebi",
          icon: `${process.env.PUBLIC_URL}/Picture/npc_bebi.png`,
        }]);
      } else if (!questProgress.hasBumbuKuah) {
        const bebiText = String(npc.dialogs.withQuest) + "\n\n" + String(npc.dialogs.question); // Ensure both parts are strings
        setCurrentDialog([{
          text: bebiText,
          options: ["Candi Borobudur", "Candi Prambanan", "Candi Mendut", "Candi Pawon"],
          onSelect: (optionIndex) => {
            if (optionIndex === 0) { // Candi Borobudur
              setQuestProgress({ ...questProgress, hasBumbuKuah: true });
              addToInventory("Bumbu Kuah");
              setCurrentDialog([{
                text: "Benar sekali! Candi Borobudur adalah warisan dunia yang sangat berharga. Ini bumbu kuah untuk Kupat Tahu Magelangmu!",
                options: ["Terima kasih!"],
                onSelect: handleProceed,
                speaker: "Bebi",
                icon: `${process.env.PUBLIC_URL}/Picture/npc_bebi.png`,
              }]);
            } else {
              setCurrentDialog([{
                text: "Maaf, jawabanmu kurang tepat. Candi Borobudur adalah candi Buddha terbesar di dunia yang terletak di Magelang.",
                options: ["Saya akan belajar lagi"],
                onSelect: handleProceed,
                speaker: "Bebi",
                icon: `${process.env.PUBLIC_URL}/Picture/npc_bebi.png`,
              }]);
            }
          }
        }]);
      } else {
        setCurrentDialog([{
          text: "Kamu sudah mendapatkan bumbu kuah dariku. Carilah bahan lainnya.",
          options: ["Baik, terima kasih!"],
          onSelect: handleProceed,
          speaker: "Player",
          icon: `${process.env.PUBLIC_URL}/Picture/${selectedCharacter}-idle.png`,
        }]);
      }
    } else if (npc.name === "Merdeka") {
      if (!questProgress.hasStartedQuest) {
        setCurrentDialog([{
          text: String(npc.dialogs.withoutQuest), // Ensure withoutQuest is string
          options: ["Baik, saya akan menemui Anosheep dulu."],
          onSelect: handleProceed,
          speaker: "Merdeka",
          icon: `${process.env.PUBLIC_URL}/Picture/npc_merdeka.png`,
        }]);
      } else if (!questProgress.hasTahu) {
        const merdekaText = String(npc.dialogs.withQuest) + "\n\n" + String(npc.dialogs.question); // Ensure both parts are strings
        setCurrentDialog([{
          text: merdekaText,
          options: ["Museum Dirgantara", "Museum Nasional", "Museum Fatahillah", "Museum Bank Indonesia"],
          onSelect: (optionIndex) => {
            if (optionIndex === 0) { // Museum Dirgantara
              setQuestProgress({ ...questProgress, hasTahu: true });
              addToInventory("Tahu");
              setCurrentDialog([{
                text: "Benar sekali! Museum Dirgantara adalah museum yang menyimpan sejarah penerbangan Indonesia. Ini tahu terbaik untuk Kupat Tahu Magelangmu!",
                options: ["Terima kasih!"],
                onSelect: handleProceed,
                speaker: "Merdeka",
                icon: `${process.env.PUBLIC_URL}/Picture/npc_merdeka.png`,
              }]);
            } else {
              setCurrentDialog([{
                text: "Maaf, jawabanmu kurang tepat. Museum Dirgantara adalah museum terkenal di Magelang.",
                options: ["Saya akan belajar lagi"],
                onSelect: handleProceed,
                speaker: "Merdeka",
                icon: `${process.env.PUBLIC_URL}/Picture/npc_merdeka.png`,
              }]);
            }
          }
        }]);
      } else {
        setCurrentDialog([{
          text: "Kamu sudah mendapatkan tahu dariku. Carilah bahan lainnya.",
          options: ["Baik, terima kasih!"],
          onSelect: handleProceed,
          speaker: "Player",
          icon: `${process.env.PUBLIC_URL}/Picture/${selectedCharacter}-idle.png`,
        }]);
      }
    } else {
      // Fallback for other NPCs or unexpected states
      setCurrentDialog([{
        text: "Maaf, saya tidak bisa berinteraksi saat ini.",
        options: ["Oke"],
        onSelect: handleProceed,
        speaker: "Player",
        icon: `${process.env.PUBLIC_URL}/Picture/${selectedCharacter}-idle.png`,
      }]);
    }
  };

  // Handle keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (showDialog) return;
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
  }, [selectedCharacter, position, nearNPC, showDialog]);

  // Effect to check proximity to NPCs after movement
  useEffect(() => {
    checkNearNPC(position.x, position.y);
  }, [position]);

  // Handle character movement
  const moveCharacter = (direction) => {
    const step = 1;
    let { x, y } = position;

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
        return;
    }
    setPosition({ x, y });
  };

  // Handle return to main map
  const handleReturn = () => {
    setIsLeaving(true);
    setShowClouds(true);
    setTimeout(() => {
      onReturn();
    }, 800);
  };

  // Save quest progress to localStorage
  useEffect(() => {
    if (userId) {
      localStorage.setItem(questKey, JSON.stringify(questProgress));
    }
  }, [questProgress, userId]);

  useEffect(() => {
    // Hide welcome messages after 7 seconds
    const welcomeTimer = setTimeout(() => {
      setShowWelcome(false);
    }, 7000);

    // Hide clouds after entering
    const cloudsTimer = setTimeout(() => {
      setShowClouds(false);
    }, 2000);

    return () => {
      clearTimeout(welcomeTimer);
      clearTimeout(cloudsTimer);
    };
  }, []);

  // Fungsi untuk cek semua bahan terkumpul
  const checkIngredients = () => questProgress.hasKupat && questProgress.hasTahu && questProgress.hasBumbuKuah;

  // Fungsi untuk mulai memasak
  const handleCooking = () => {
    setShowCookingAnimation(true);
    setCookingProgress(0);
    const interval = setInterval(() => {
      setCookingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setShowCookingAnimation(false);
          setShowKupatTahuIcon(true);
          setShowCongrats(true);
          setTimeout(() => setShowCongrats(false), 2000);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  // Fungsi untuk ambil kupat tahu
  const handleAmbilKupatTahu = () => {
    setShowKupatTahuIcon(false);
    // Hapus bahan-bahan dari inventory, ganti dengan Kupat Tahu
    if (typeof addToInventory === 'function') {
      addToInventory("Kupat Tahu");
    }
    if (typeof setInventory === 'function') {
      setInventory(["Kupat Tahu"]);
    }
  };

  return (
    <div className="town-container" style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/Picture/kota-magelang.jpg)` }}>
      {/* Return button */}
      <button
        onClick={handleReturn}
        className="return-button"
        style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          zIndex: 1000,
        }}
      >
        Kembali ke Map Utama
      </button>

      {/* Inventory Button */}
      <button
        onClick={() => setShowInventory(true)}
        className="inventory-button"
        style={{
          position: "fixed",
          top: "20px",
          right: "220px",
          zIndex: 1000,
        }}
      >
        Inventory
      </button>

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

      {/* Movement Controls */}
      <div className="arrow-keys">
        <button
          onMouseDown={() => moveCharacter("up")}
          onMouseUp={() => setCharacterImage(`${selectedCharacter}-idle`)}
          onTouchStart={() => moveCharacter("up")}
          onTouchEnd={() => setCharacterImage(`${selectedCharacter}-idle`)}
          className="arrow-button up"
        >
          ▲
        </button>
        <div className="left-right">
          <button
            onMouseDown={() => moveCharacter("left")}
            onMouseUp={() => setCharacterImage(`${selectedCharacter}-idle`)}
            onTouchStart={() => moveCharacter("left")}
            onTouchEnd={() => setCharacterImage(`${selectedCharacter}-idle`)}
            className="arrow-button left"
          >
            ◀
          </button>
          <button
            onMouseDown={() => moveCharacter("right")}
            onMouseUp={() => setCharacterImage(`${selectedCharacter}-idle`)}
            onTouchStart={() => moveCharacter("right")}
            onTouchEnd={() => setCharacterImage(`${selectedCharacter}-idle`)}
            className="arrow-button right"
          >
            ▶
          </button>
        </div>
        <button
          onMouseDown={() => moveCharacter("down")}
          onMouseUp={() => setCharacterImage(`${selectedCharacter}-idle`)}
          onTouchStart={() => moveCharacter("down")}
          onTouchEnd={() => setCharacterImage(`${selectedCharacter}-idle`)}
          className="arrow-button down"
        >
          ▼
        </button>
      </div>

      {/* NPCs */}
      {npcs.map((npc) => {
        const distance = Math.sqrt(
          Math.pow(position.x - npc.x, 2) + Math.pow(position.y - npc.y, 2)
        );
        const isNearby = distance < NPC_DETECTION_RADIUS;

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
                opacity: 1,
              }}
            />
            {isNearby && nearNPC && nearNPC.id === npc.id && (
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
      {showDialog && currentDialog.length > 0 && (
        <div className="dialog-box">
          {currentSpeaker && (
            <div className="dialog-speaker">
              <div
                className="speaker-icon"
                style={{ backgroundImage: `url('${speakerIcon}')` }}
              ></div>
              <span className={currentSpeaker === "Player" ? "speaker-player" : "speaker-npc"}>
                {currentSpeaker}
              </span>
            </div>
          )}

          {isTyping && (
            <button
              onClick={() => {
                if (typingIntervalRef.current) {
                  clearInterval(typingIntervalRef.current);
                  typingIntervalRef.current = null;
                }
                setTypedText(currentDialog[dialogIndex].text);
                setIsTyping(false);
                setShowOptions(true);
              }}
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                background: "#ffd700",
                color: "black",
                padding: "8px 15px",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                fontSize: "0.9rem",
                fontWeight: "bold",
                zIndex: 1000,
              }}
            >
              Fast Forward
            </button>
          )}

          <div className="dialog-text">
            {typedText}
            {isTyping && <span className="dialog-cursor"></span>}
          </div>
          <div
            className={`dialog-options ${showOptions ? "show" : ""}`}
          >
            {showOptions && currentDialog[dialogIndex].options.map((option, index) => {
              return (
                <button
                  key={index}
                  onClick={() => currentDialog[dialogIndex].onSelect(index)}
                  disabled={false}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Welcome Messages */}
      {showWelcome && (
        <>
          <div className="welcome-message">Selamat Datang di Kota Magelang</div>

          <div className="mission-text">MISI: Membuat Kupat Tahu Magelang</div>

          <div className="instruction-text">
            Untuk memulai petualangan membuat Kupat Tahu Magelang, Anda harus menemui
            Anosheep. Beliau adalah seorang ahli dalam pembuatan Kupat Tahu Magelang dan akan
            memberikan petunjuk tentang bahan-bahan yang diperlukan. Ikuti petunjuk Anosheep
            dengan baik untuk membuat Kupat Tahu Magelang yang lezat!
          </div>
        </>
      )}

      {/* Inventory Display */}
      {showInventory && (
        <div className="inventory-modal">
          <div className="inventory-content">
            <h2>Inventory Bahan Tempe Goreng</h2>
            <div className="inventory-items">
              {inventory.length === 0 ? (
                <p className="inventory-item-empty">Belum ada bahan yang dikumpulkan.</p>
              ) : (
                inventory.map((item, index) => (
                  <div key={index} className="inventory-item">
                    <h3>
                      {typeof item === "object" && item !== null
                        ? `${item.name} ${item.quantity ? `x${item.quantity}` : ""}`
                        : item}
                    </h3>
                  </div>
                ))
              )}
            </div>
            <button onClick={() => setShowInventory(false)} className="close-inventory">
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Quest Progress Display */}
      <div className="quest-progress">
        <h3>Status Quest:</h3>
        <div style={{ color: 'white', textShadow: '1px 1px 2px black' }}>
          Bahan Kupat Tahu Magelang:
        </div>
        <div style={{ color: questProgress.hasKupat ? "#00ff00" : "#aaa" }}>
          {questProgress.hasKupat ? "✔" : "✗"} Kupat
        </div>
        <div style={{ color: questProgress.hasTahu ? "#00ff00" : "#aaa" }}>
          {questProgress.hasTahu ? "✔" : "✗"} Tahu
        </div>
        <div style={{ color: questProgress.hasBumbuKuah ? "#00ff00" : "#aaa" }}>
          {questProgress.hasBumbuKuah ? "✔" : "✗"} Bumbu Kuah
        </div>
      </div>

      {/* Tombol Masak muncul jika semua bahan terkumpul dan belum ada kupat tahu */}
      {checkIngredients() && !showCookingAnimation && !showKupatTahuIcon && (
        <button className="cook-button" onClick={handleCooking}>
          Masak Kupat Tahu
        </button>
      )}

      {/* Animasi memasak */}
      {showCookingAnimation && (
        <div className="cooking-animation">
          <div className="cooking-progress">
            <div className="progress-bar" style={{ width: `${cookingProgress}%` }} />
            <div className="progress-text">Memasak Kupat Tahu... {cookingProgress}%</div>
          </div>
        </div>
      )}

      {/* Icon kupat tahu muncul setelah animasi */}
      {showKupatTahuIcon && (
        <div className="kupat-tahu" style={{ left: '50%', top: '60%', position: 'absolute', cursor: 'pointer', zIndex: 200 }} onClick={handleAmbilKupatTahu}>
          <img src={`${process.env.PUBLIC_URL}/Picture/kupat_tahu.png`} alt="Kupat Tahu" className="kupat-tahu-image" />
          <div style={{ color: '#4caf50', fontWeight: 'bold', textAlign: 'center' }}>Ambil Kupat Tahu</div>
        </div>
      )}

      {/* Pesan selamat */}
      {showCongrats && (
        <div className="congrats-message">
          Selamat! Kupat Tahu berhasil dibuat!
        </div>
      )}
    </div>
  );
}

export default Magelang;