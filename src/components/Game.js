import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import "../styles/Game.css";

// Import town components
import Jakarta from "../towns/Jakarta";
import Padang from "../towns/Padang";
import Papua from "../towns/Papua";
import Magelang from "../towns/Magelang";
import Home from "../towns/Home";

function Game() {
  console.log("Game component is rendering/re-rendering...");
  const CHARACTER_SIZE = 150;
  const navigate = useNavigate();

  const selectedCharacter =
    localStorage.getItem("selectedCharacter") || "revlog";
  const playerName = localStorage.getItem("playerName") || "Player";

  const [position, setPosition] = useState({ x: 17, y: 23 });
  const [direction, setDirection] = useState("right");
  const [characterImage, setCharacterImage] = useState(
    `${selectedCharacter}-idle`
  );
  const [moveInterval, setMoveInterval] = useState(null);
  const positionRef = useRef(position);

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

  const [gameTime, setGameTime] = useState({
    hours: 6,
    minutes: 0,
    day: 1,
  });

  const [inventory, setInventory] = useState(() => {
    const savedInventory = localStorage.getItem("gameInventory");
    return savedInventory ? JSON.parse(savedInventory) : [];
  });
  const [showInventory, setShowInventory] = useState(false);
  const [currentTown, setCurrentTown] = useState(null);
  const [showExploreButton, setShowExploreButton] = useState(false);
  const [nearSign, setNearSign] = useState(null);
  const [showSignDetails, setShowSignDetails] = useState(false);
  const [showDeathScreen, setShowDeathScreen] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [showDialog, setShowDialog] = useState(false);
  const [currentDialog, setCurrentDialog] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typedText, setTypedText] = useState("");
  const [showOptions, setShowOptions] = useState(false);
  const typingIntervalRef = useRef(null);
  const TYPING_SPEED = 30;
  const gameContainerRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("gameInventory", JSON.stringify(inventory));
  }, [inventory]);

  // *** CHANGED: Refactored stat update logic into a single, reliable function ***
  const handleUpdateStats = useCallback((statsUpdate) => {
    setStats((prevStats) => {
      // Merge the new stats into the previous state
      const mergedStats = { ...prevStats, ...statsUpdate };

      // Clamp the values to be within 0-100 and ensure gold isn't negative
      const clampedStats = {
        ...mergedStats,
        happiness: Math.max(0, Math.min(100, mergedStats.happiness)),
        hunger: Math.max(0, Math.min(100, mergedStats.hunger)),
        sleep: Math.max(0, Math.min(100, mergedStats.sleep)),
        hygiene: Math.max(0, Math.min(100, mergedStats.hygiene)),
        gold: Math.max(0, mergedStats.gold),
      };

      // Save to localStorage
      localStorage.setItem("gameStats", JSON.stringify(clampedStats));

      // Return the new state for React to use
      return clampedStats;
    });
  }, []); // Empty dependency array because setStats from useState is stable

  // Game actions now use the new update function
  const work = () => {
    console.log("work function called");
    handleUpdateStats({
      gold: stats.gold + 70,
      happiness: stats.happiness - 5,
      hunger: stats.hunger - 10,
      sleep: stats.sleep - 5,
      hygiene: stats.hygiene - 5,
    });
  };

  const eat = () => {
    if (stats.gold >= 5) {
      handleUpdateStats({
        gold: stats.gold - 5,
        hunger: stats.hunger + 20,
        happiness: stats.happiness + 5,
        hygiene: stats.hygiene - 2,
      });
    } else {
      console.log("Not enough gold to eat!");
    }
  };

  const sleep = () => {
    handleUpdateStats({
      sleep: stats.sleep + 30,
      hunger: stats.hunger - 10,
      hygiene: stats.hygiene - 5,
    });
  };

  const explore = () => {
    handleUpdateStats({
      happiness: stats.happiness + 15,
      hunger: stats.hunger - 10,
      sleep: stats.sleep - 10,
      hygiene: stats.hygiene - 10,
    });
  };

  useEffect(() => {
    if (showDeathScreen) return;
    const statDecayInterval = setInterval(() => {
      handleUpdateStats({
          happiness: stats.happiness - 1,
          hunger: stats.hunger - 1,
          sleep: stats.sleep - 1,
          hygiene: stats.hygiene - 1,
      });
    }, 5000);

    return () => clearInterval(statDecayInterval);
  }, [showDeathScreen, stats, handleUpdateStats]); // Added dependencies

  useEffect(() => {
    positionRef.current = position;
  }, [position]);

  useEffect(() => {
    if (showDeathScreen) return;
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
        return { hours: newHours, minutes: newMinutes, day: newDay };
      });
    }, 1000);
    return () => clearInterval(timeInterval);
  }, [showDeathScreen]);

  const formatTime = (hours, minutes) => {
    const period = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, "0");
    return `${displayHours}:${displayMinutes} ${period}`;
  };

  const getGreeting = (hours) => {
    if (hours >= 5 && hours < 12) return "Selamat pagi";
    if (hours >= 12 && hours < 15) return "Selamat siang";
    if (hours >= 15 && hours < 19) return "Selamat sore";
    return "Selamat malam";
  };

  const signs = [
    {
      id: 1,
      x: 21,
      y: 87,
      name: "UMN",
      description: "Universitas Multimedia Nusantara, kampus modern dengan berbagai fasilitas untuk belajar dan beraktivitas.",
    },
    {
      id: 2,
      x: 62,
      y: 32,
      name: "GLORA BUNG KARNO",
      description: "Jantung olahraga dan kebugaran bangsa! Di kompleks yang luas ini, kamu bisa berlari di trek atletik, melatih fisik, atau sekadar berjalan santai untuk meningkatkan Happiness. Siapa tahu kamu bisa bertemu seorang atlet terkenal yang butuh bantuan?",
    },
    {
      id: 3,
      x: 61,
      y: 71,
      name: "Danau TOBA",
      description: "Danau vulkanik terbesar di Indonesia yang menawarkan pemandangan indah dan berbagai aktivitas air.",
    },
  ];

  const npcs = [
    {
      id: 1,
      name: "El Pemandu",
      x: 32,
      y: 58,
      image: "npc_elpemandu",
      description: "Seorang pemandu yang akan membantu perjalananmu.",
      dialogs: {
        initial: ["Halo! Saya El Pemandu, pemandu perjalananmu. Saya akan membantu kamu memahami cara bermain game ini."],
        options: ["Ya, saya ingin belajar cara bermain.", "Saya ingin membeli akses kota", "Tidak, saya sudah tahu."],
        responses: {
          ask: [{
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
                  options: ["Bagaimana cara menaikkan stats saya?"],
                  onSelect: () => ({
                    text: "Rumah adalah tempat terbaik untuk menaikkan stats kamu! Di sana kamu bisa:\n1. Tidur untuk mengembalikan Sleep\n2. Mandi untuk meningkatkan Hygiene\n3. Makan untuk mengembalikan Hunger\n4. Bermain untuk meningkatkan Happiness\n\nJangan lupa untuk selalu kembali ke rumah secara berkala untuk menjaga stats kamu tetap tinggi!",
                    options: ["Terima kasih atas informasinya!"],
                    onSelect: () => setShowDialog(false),
                  }),
                }),
              }),
            }),
          }],
          decline: "Baik, jika kamu membutuhkan bantuan atau lupa cara bermain, jangan ragu untuk bertanya lagi!",
        },
      },
    },
  ];

  const towns = {
    home: { x: 14, y: 21, name: "Home" },
    jakarta: { x: 12, y: 57, name: "Jakarta" },
    padang: { x: 45, y: 84, name: "Padang" },
    papua: { x: 86, y: 86, name: "Papua" },
    magelang: { x: 81, y: 28, name: "Magelang" },
  };

  const checkNearTown = (x, y) => {
    const TOWN_DETECTION_RADIUS = 5;
    for (const [townId, town] of Object.entries(towns)) {
      const distance = Math.sqrt(Math.pow(x - town.x, 2) + Math.pow(y - town.y, 2));
      if (distance < TOWN_DETECTION_RADIUS) {
        setShowExploreButton(true);
        return townId;
      }
    }
    setShowExploreButton(false);
    return null;
  };

  const checkNearSign = (x, y) => {
    const SIGN_DETECTION_RADIUS = 5;
    for (const sign of signs) {
      const distance = Math.sqrt(Math.pow(x - sign.x, 2) + Math.pow(y - sign.y, 2));
      if (distance < SIGN_DETECTION_RADIUS) {
        setNearSign(sign);
        return;
      }
    }
    setNearSign(null);
  };

  const getImageName = (direction) => {
    if (selectedCharacter === "dimsum" && (direction === "left" || direction === "up")) {
      return "dimsum left";
    }
    return `${selectedCharacter}-${direction}`;
  };

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

  useEffect(() => {
    checkNearTown(position.x, position.y);
    checkNearSign(position.x, position.y);
  }, [position]);

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

  const handleButtonStart = (direction) => {
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

  useEffect(() => {
    return () => {
      if (moveInterval) clearInterval(moveInterval);
    };
  }, [moveInterval]);

  useEffect(() => {
    if (gameContainerRef.current) {
      gameContainerRef.current.focus();
    }
  }, []);

  const toggleInventory = () => {
    setShowInventory(!showInventory);
  };

  const addToInventory = useCallback((item) => {
    setInventory((prev) => [...prev, item]);
  }, [setInventory]);

  const removeFromInventory = useCallback((index) => {
    setInventory((prev) => prev.filter((_, i) => i !== index));
  }, [setInventory]);

  const handleUseItem = useCallback((itemName) => {
    const itemIndex = inventory.findIndex(item => item.name === itemName);
    if (itemIndex === -1) return;
    const item = inventory[itemIndex];
    switch (item.name) {
      case "Papeda":
        handleUpdateStats({
          happiness: stats.happiness + 30,
          hunger: stats.hunger + 40,
        });
        removeFromInventory(itemIndex);
        setShowDialog(true);
        setCurrentDialog({
          text: "Papeda dimakan! Happiness +30, Hunger +40",
          options: ["OK"],
          onSelect: () => setShowDialog(false),
        });
        break;
      default:
        break;
    }
  }, [stats, removeFromInventory, inventory, handleUpdateStats]);

  const [unlockedTowns, setUnlockedTowns] = useState(() => {
    const saved = localStorage.getItem("unlockedTowns");
    return saved ? JSON.parse(saved) : { jakarta: true, home: true };
  });

  useEffect(() => {
    if (inventory.find((item) => item.name === "Kerak Telor")) {
      setUnlockedTowns((prev) => ({ ...prev, padang: true }));
    }
    if (inventory.find((item) => item.name === "Rendang")) {
      setUnlockedTowns((prev) => ({ ...prev, papua: true }));
    }
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem("unlockedTowns", JSON.stringify(unlockedTowns));
  }, [unlockedTowns]);

  const isTownAccessible = (townId) => {
    if (townId === "home") return true;
    return unlockedTowns[townId] || false;
  };

  const unlockTown = (townId) => {
    setUnlockedTowns((prev) => ({ ...prev, [townId]: true }));
  };

  const exploreTown = (townId) => {
    if (!isTownAccessible(townId)) {
      setShowDialog(true);
      setCurrentDialog({
        text: "Kota ini belum terbuka! Kamu perlu:\n1. Menyelesaikan misi di kota sebelumnya, atau\n2. Membeli akses dengan emas\n\nKunjungi El Pemandu untuk informasi lebih lanjut.",
        speaker: "System",
        options: ["OK"],
        onSelect: () => setShowDialog(false),
      });
      return;
    }
    setCurrentTown(townId);
    localStorage.setItem("returnPosition", JSON.stringify({ x: position.x, y: position.y }));
  };

  const handleDialog = (npc) => {
    setShowDialog(true);
    setCurrentDialog({
      text: "Halo! Saya El Pemandu, pemandu perjalananmu. Saya akan membantu kamu memahami cara bermain game ini.",
      speaker: "El Pemandu",
      options: ["Ya, saya ingin belajar cara bermain.", "Saya ingin membeli akses kota", "Tidak, saya sudah tahu."],
      onSelect: (option) => {
        if (option === 0) {
          setCurrentDialog({
            text: "Baik, mari kita mulai dengan hal yang paling penting:",
            speaker: "El Pemandu",
            options: ["Lanjutkan"],
            onSelect: () => {
              setCurrentDialog({
                text: "Perhatikan stats kamu (Happiness, Hunger, Sleep, Hygiene). Jangan biarkan salah satu dari stats tersebut mencapai 0, karena itu akan menyebabkan GAME OVER!",
                speaker: "El Pemandu",
                options: ["Mengerti, apa lagi?"],
                onSelect: () => {
                  setCurrentDialog({
                    text: "Kota awal kamu adalah Jakarta. Di sana kamu bisa belajar membuat Kerak Telor. Setiap kota memiliki makanan khasnya sendiri yang bisa kamu pelajari.",
                    speaker: "El Pemandu",
                    options: ["Kota apa saja yang bisa saya kunjungi?"],
                    onSelect: () => {
                      setCurrentDialog({
                        text: "Kamu bisa mengunjungi:\n1. Jakarta (Kota Awal)\n2. Padang (Rendang)\n3. Papua (Papeda)\n4. Magelang\n\nUntuk membuka kota baru, kamu bisa:\n1. Mengumpulkan emas dan membelinya\n2. Atau menyelesaikan quest di kota sebelumnya",
                        speaker: "El Pemandu",
                        options: ["Bagaimana cara menaikkan stats saya?"],
                        onSelect: () => {
                          setCurrentDialog({
                            text: "Rumah adalah tempat terbaik untuk menaikkan stats kamu! Di sana kamu bisa:\n1. Tidur untuk mengembalikan Sleep\n2. Mandi untuk meningkatkan Hygiene\n3. Makan untuk mengembalikan Hunger\n4. Bermain untuk meningkatkan Happiness\n\nJangan lupa untuk selalu kembali ke rumah secara berkala untuk menjaga stats kamu tetap tinggi!",
                            speaker: "El Pemandu",
                            options: ["Terima kasih atas informasinya!"],
                            onSelect: () => setShowDialog(false),
                          });
                        },
                      });
                    },
                  });
                },
              });
            },
          });
        } else if (option === 1) {
          setCurrentDialog({
            text: "Saya bisa membantu kamu membeli akses ke kota-kota berikut:\n\n1. Magelang (300 emas)\n2. Padang (500 emas)\n3. Papua (700 emas)\n\nKota mana yang ingin kamu buka?",
            speaker: "El Pemandu",
            options: ["Magelang", "Padang", "Papua", "Kembali"],
            onSelect: (townOption) => {
              const townPrices = { magelang: 300, padang: 500, papua: 700 };
              const townNames = { magelang: "Magelang", padang: "Padang", papua: "Papua" };
              const selectedTown = ["magelang", "padang", "papua", "kembali"][townOption];

              if (townOption === 3) {
                setShowDialog(false);
                return;
              }
              if (unlockedTowns[selectedTown]) {
                setCurrentDialog({
                  text: `Kamu sudah memiliki akses ke ${townNames[selectedTown]}!`,
                  speaker: "El Pemandu",
                  options: ["OK"],
                  onSelect: () => setShowDialog(false),
                });
                return;
              }
              if (stats.gold >= townPrices[selectedTown]) {
                handleUpdateStats({ gold: stats.gold - townPrices[selectedTown] });
                unlockTown(selectedTown);
                setCurrentDialog({
                  text: `Selamat! Kamu telah membeli akses ke ${townNames[selectedTown]}!`,
                  speaker: "El Pemandu",
                  options: ["OK"],
                  onSelect: () => setShowDialog(false),
                });
              } else {
                setCurrentDialog({
                  text: `Maaf, emas kamu tidak cukup. Kamu membutuhkan ${townPrices[selectedTown]} emas untuk membuka akses ke ${townNames[selectedTown]}.`,
                  speaker: "El Pemandu",
                  options: ["OK"],
                  onSelect: () => setShowDialog(false),
                });
              }
            },
          });
        } else {
          setCurrentDialog({
            text: "Baik, jika kamu membutuhkan bantuan atau lupa cara bermain, jangan ragu untuk bertanya lagi!",
            speaker: "El Pemandu",
            options: ["Baik, terima kasih!"],
            onSelect: () => setShowDialog(false),
          });
        }
      },
    });
  };

  const typeText = useCallback((text) => {
    const textToType = String(text || "");
    setIsTyping(true);
    setShowOptions(false);
    setTypedText("");
    let currentChar = 0;

    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
    }
    typingIntervalRef.current = setInterval(() => {
      if (currentChar < textToType.length) {
        setTypedText(textToType.substring(0, currentChar + 1));
        currentChar++;
      } else {
        clearInterval(typingIntervalRef.current);
        setIsTyping(false);
        setShowOptions(true);
      }
    }, TYPING_SPEED);
  }, [TYPING_SPEED]);

  const handleFastForward = () => {
    if (isTyping) {
      clearInterval(typingIntervalRef.current);
      setTypedText(currentDialog.text);
      setIsTyping(false);
      setShowOptions(true);
    }
  };

  useEffect(() => {
    if (currentDialog && currentDialog.text && showDialog) {
      typeText(currentDialog.text);
    }
  }, [currentDialog, showDialog, typeText]);

  useEffect(() => {
    return () => {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
    };
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const returnToMainMap = () => {
    setCurrentTown(null);
    setPosition({ x: 50, y: 50 });
  };

  const handleReturnToCharacterSelect = () => {
    localStorage.clear();
    navigate("/");
  };

  const restartGame = () => {
    const initialStats = { happiness: 100, hunger: 100, sleep: 100, hygiene: 100, gold: 0 };
    setStats(initialStats);
    localStorage.setItem("gameStats", JSON.stringify(initialStats));
    setGameTime({ hours: 6, minutes: 0, day: 1 });
    setPosition({ x: 50, y: 50 });
    setShowDeathScreen(false);
  };

  const handleCheckOut = () => {
    if (nearSign) {
      if (nearSign.name === "GLORA BUNG KARNO") {
        setShowDialog(true);
        setCurrentDialog({
          text: "Selamat Datang di Gelora Bung Karno\n\nSebuah area publik untuk berbagai aktivitas fisik dan rekreasi.\n\nAktivitas yang tersedia:\n1. Jogging\n2. Bersantai\n\n⚠️ Perhatian: Beraktivitas di sini dapat menurunkan stat Hygiene.",
          speaker: "Gelora Bung Karno",
          options: ["Jogging", "Bersantai", "Tidak jadi"],
          onSelect: (option) => {
            if (option === 0) {
              handleUpdateStats({ happiness: stats.happiness + 30, hunger: stats.hunger - 20, hygiene: stats.hygiene - 20 });
              setCurrentDialog({ text: "Kamu telah melakukan jogging!\n\nEfek:\n• Happiness +30\n• Hunger -20\n• Hygiene -20", speaker: "Gelora Bung Karno", options: ["OK"], onSelect: () => { setShowDialog(false); setNearSign(null); } });
            } else if (option === 1) {
              handleUpdateStats({ happiness: stats.happiness + 10, hunger: stats.hunger - 5, hygiene: stats.hygiene - 5 });
              setCurrentDialog({ text: "Kamu telah bersantai!\n\nEfek:\n• Happiness +10\n• Hunger -5\n• Hygiene -5", speaker: "Gelora Bung Karno", options: ["OK"], onSelect: () => { setShowDialog(false); setNearSign(null); } });
            } else if (option === 2) {
              setShowDialog(false);
              setNearSign(null);
            }
          },
        });
      } else if (nearSign.name === "Danau TOBA") {
        setShowDialog(true);
        setCurrentDialog({
          text: "Selamat Datang di Danau Toba\n\nDanau vulkanik terbesar di Indonesia yang menawarkan pemandangan indah dan berbagai aktivitas air.\n\nAktivitas yang tersedia:\n1. Berenang\n2. Memancing\n3. Menikmati Pemandangan\n\n⚠️ Perhatian: Berenang dapat menurunkan stat Hygiene.",
          speaker: "Danau Toba",
          options: ["Berenang", "Memancing", "Menikmati Pemandangan", "Tidak jadi"],
          onSelect: (option) => {
            if (option === 0) {
              handleUpdateStats({ happiness: stats.happiness + 25, hunger: stats.hunger - 15, hygiene: stats.hygiene - 10, sleep: stats.sleep - 5 });
              setCurrentDialog({ text: "Kamu telah berenang di Danau Toba!\n\nEfek:\n• Happiness +25\n• Hunger -15\n• Hygiene -10\n• Sleep -5", speaker: "Danau Toba", options: ["OK"], onSelect: () => { setShowDialog(false); setNearSign(null); } });
            } else if (option === 1) {
              handleUpdateStats({ happiness: stats.happiness + 15, hunger: stats.hunger - 10, sleep: stats.sleep - 5 });
              setCurrentDialog({ text: "Kamu telah memancing di Danau Toba!\n\nEfek:\n• Happiness +15\n• Hunger -10\n• Sleep -5", speaker: "Danau Toba", options: ["OK"], onSelect: () => { setShowDialog(false); setNearSign(null); } });
            } else if (option === 2) {
              handleUpdateStats({ happiness: stats.happiness + 20, sleep: stats.sleep + 10 });
              setCurrentDialog({ text: "Kamu telah menikmati pemandangan Danau Toba!\n\nEfek:\n• Happiness +20\n• Sleep +10", speaker: "Danau Toba", options: ["OK"], onSelect: () => { setShowDialog(false); setNearSign(null); } });
            } else if (option === 3) {
              setShowDialog(false);
              setNearSign(null);
            }
          },
        });
      } else if (nearSign.name === "UMN") {
        setShowDialog(true);
        setCurrentDialog({
          text: "Selamat Datang di Universitas Multimedia Nusantara\n\nKampus modern dengan berbagai fasilitas untuk belajar dan beraktivitas.\n\nAktivitas yang tersedia:\n1. Belajar di Perpustakaan\n2. Makan di Kantin\n3. Olahraga di Lapangan\n\n⚠️ Perhatian: Belajar dapat menurunkan stat Sleep.",
          speaker: "UMN",
          options: ["Belajar di Perpustakaan", "Makan di Kantin", "Olahraga di Lapangan", "Tidak jadi"],
          onSelect: (option) => {
            if (option === 0) {
              handleUpdateStats({ happiness: stats.happiness + 15, hunger: stats.hunger - 10, sleep: stats.sleep - 20, hygiene: stats.hygiene - 5 });
              setCurrentDialog({ text: "Kamu telah belajar di perpustakaan!\n\nEfek:\n• Happiness +15\n• Hunger -10\n• Sleep -20\n• Hygiene -5", speaker: "UMN", options: ["OK"], onSelect: () => { setShowDialog(false); setNearSign(null); } });
            } else if (option === 1) {
              handleUpdateStats({ happiness: stats.happiness + 10, hunger: stats.hunger + 30, hygiene: stats.hygiene - 5 });
              setCurrentDialog({ text: "Kamu telah makan di kantin!\n\nEfek:\n• Happiness +10\n• Hunger +30\n• Hygiene -5", speaker: "UMN", options: ["OK"], onSelect: () => { setShowDialog(false); setNearSign(null); } });
            } else if (option === 2) {
              handleUpdateStats({ happiness: stats.happiness + 20, hunger: stats.hunger - 15, sleep: stats.sleep - 10, hygiene: stats.hygiene - 15 });
              setCurrentDialog({ text: "Kamu telah berolahraga di lapangan!\n\nEfek:\n• Happiness +20\n• Hunger -15\n• Sleep -10\n• Hygiene -15", speaker: "UMN", options: ["OK"], onSelect: () => { setShowDialog(false); setNearSign(null); } });
            } else if (option === 3) {
              setShowDialog(false);
              setNearSign(null);
            }
          },
        });
      } else {
        setShowSignDetails(true);
      }
    }
  };

  const closeSignDetails = () => {
    setShowSignDetails(false);
    setNearSign(null);
  };

  const calculateScore = useCallback(() => {
    const statsScore = (stats.happiness + stats.hunger + stats.sleep + stats.hygiene) * 2;
    const goldScore = stats.gold * 5;
    const dayBonus = gameTime.day * 100;
    return statsScore + goldScore + dayBonus;
  }, [stats, gameTime.day]);


  useEffect(() => {
    if (stats.happiness <= 0 || stats.hunger <= 0 || stats.sleep <= 0 || stats.hygiene <= 0) {
      setShowDeathScreen(true);
      setFinalScore(calculateScore());
    }
  }, [stats, calculateScore]);

  // *** CHANGED: This is the main part of the fix. ***
  // I've updated the `updateStats` prop for all towns to use the new `handleUpdateStats` function.
  if (currentTown) {
    const townProps = {
      onReturn: returnToMainMap,
      stats: stats,
      updateStats: handleUpdateStats, // Use the correct, refactored function
      inventory: inventory,
      addToInventory: (item, quantity = 1) => {
        setInventory((prev) => {
          const newInventory = [...prev];
          const existingItem = newInventory.find((i) => i.name === item);
          if (existingItem) {
            existingItem.quantity += quantity;
          } else {
            newInventory.push({ name: item, quantity });
          }
          return newInventory;
        });
      },
    };

    switch (currentTown) {
      case "jakarta":
        return <Jakarta {...townProps} />;
      case "padang":
        return <Padang {...townProps} />;
      case "papua":
        return <Papua {...townProps} />;
      case "magelang":
        return <Magelang {...townProps} />;
      case "home":
        // Home has extra props for its specific actions
        return <Home {...townProps} work={work} eat={eat} sleep={sleep} />;
      default:
        return null;
    }
  }

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
          <div className="game-over-buttons">
            <button className="game-over-button" onClick={handleReturnToCharacterSelect}>
              Return to Character Select
            </button>
            <button className="game-over-button" onClick={restartGame}>
              Restart with This Character
            </button>
          </div>
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
      <button className="logout-button" onClick={handleLogout}>
        Keluar
      </button>
      <>
        {/* UI Elements for Main Map */}
        <div style={{ position: "absolute", top: 16, left: 16, backgroundColor: "rgba(0,0,0,0.85)", color: "#fff", padding: "6px 12px", borderRadius: "4px", zIndex: 200, fontFamily: `'Press Start 2P', 'Courier New', monospace`, fontWeight: "bold", fontSize: "12px", letterSpacing: "1px", boxShadow: "2px 2px 0 #222", border: "2px solid #333", textShadow: "1px 1px 0 #000", lineHeight: 1.3 }}>
          {playerName}
          <div style={{ fontWeight: "normal", fontSize: "10px", marginTop: 2 }}>
            {getGreeting(gameTime.hours)}, {playerName}!
          </div>
        </div>
        <div className="time-display-container">
          <div className="time-display">
            <span>Day {gameTime.day}</span>
            <div className="time-text">{formatTime(gameTime.hours, gameTime.minutes)}</div>
          </div>
        </div>
        <div className="character-stats">
            <div className="stat-item">
              <span>Happiness:</span>
              <div className="stat-bar happiness-bar"><div className="stat-fill" style={{ width: `${stats.happiness}%`, imageRendering: "pixelated", border: "1.5px solid #222" }}><div className="stat-percentage">{stats.happiness}%</div></div></div>
            </div>
            <div className="stat-item">
              <span>Hunger:</span>
              <div className="stat-bar hunger-bar"><div className="stat-fill" style={{ width: `${stats.hunger}%`, imageRendering: "pixelated", border: "1.5px solid #222" }}><div className="stat-percentage">{stats.hunger}%</div></div></div>
            </div>
            <div className="stat-item">
              <span>Sleep:</span>
              <div className="stat-bar sleep-bar"><div className="stat-fill" style={{ width: `${stats.sleep}%`, imageRendering: "pixelated", border: "1.5px solid #222" }}><div className="stat-percentage">{stats.sleep}%</div></div></div>
            </div>
            <div className="stat-item">
              <span>Hygiene:</span>
              <div className="stat-bar hygiene-bar"><div className="stat-fill" style={{ width: `${stats.hygiene}%`, imageRendering: "pixelated", border: "1.5px solid #222" }}><div className="stat-percentage">{stats.hygiene}%</div></div></div>
            </div>
            <div className="stat-item gold-item">
              <span>Gold:</span>
              <span className="gold-amount">{stats.gold}</span>
            </div>
        </div>
        <div style={{ position: "absolute", left: `${position.x}%`, top: `${position.y}%`, width: `${CHARACTER_SIZE}px`, height: `${CHARACTER_SIZE}px`, backgroundImage: `url('/Picture/${characterImage}.png')`, backgroundSize: "contain", backgroundRepeat: "no-repeat", backgroundPosition: "center", transform: "translate(-50%, -50%)", zIndex: 100 }} />
        {npcs.map((npc) => {
          const distance = Math.sqrt(Math.pow(position.x - npc.x, 2) + Math.pow(position.y - npc.y, 2));
          const isNearby = distance < 5;
          return (
            <div key={npc.id}>
              <div style={{ position: "absolute", left: `${npc.x}%`, top: `${npc.y}%`, width: `${CHARACTER_SIZE}px`, height: `${CHARACTER_SIZE}px`, backgroundImage: `url('/Picture/${npc.image}.png')`, backgroundSize: "contain", backgroundRepeat: "no-repeat", backgroundPosition: "center", zIndex: 90, transform: "translate(-50%, -50%)" }} />
              {isNearby && (
                <button className="npc-interaction-button" onClick={() => handleDialog(npc)} style={{ position: "absolute", left: `${npc.x}%`, top: `${npc.y - 5}%`, transform: "translate(-50%, -50%)", zIndex: 1000 }}>
                  Talk to {npc.name}
                </button>
              )}
            </div>
          );
        })}
        {showDialog && currentDialog && (
          <div className="dialog-box">
            <div className="dialog-content">
              {currentDialog.speaker && (
                <div className={`dialog-speaker ${currentDialog.speaker === "Player" ? "speaker-player" : "speaker-npc"}`}>
                  <div className="speaker-icon" style={{ backgroundImage: currentDialog.speaker === "Player" ? `url('/Picture/${selectedCharacter}-idle.png')` : `url('/Picture/${currentDialog.speaker.toLowerCase()}.png')` }} />
                  {currentDialog.speaker}
                </div>
              )}
              <div className="dialog-text-container">
                <div className="dialog-text">
                  {typedText}
                  {isTyping && <span className="dialog-cursor" />}
                </div>
                {isTyping && (
                  <button className="fast-forward-btn" onClick={handleFastForward}>
                    Fast Forward
                  </button>
                )}
              </div>
              <div className={`dialog-options ${showOptions ? "show" : ""}`}>
                {!isTyping && currentDialog.options.map((option, index) => (
                  <button key={index} onClick={() => currentDialog.onSelect(index)} className="dialog-option">
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        <div className="coordinates-display">
          X: {Math.round(position.x)}% Y: {Math.round(position.y)}%
        </div>
        <div className="action-bar">
          <button className="inventory-button" onClick={toggleInventory}>Inventory</button>
          {nearSign && <button className="explore-button" onClick={handleCheckOut}>Check out {nearSign.name}</button>}
          {showExploreButton && <button className="explore-button" onClick={() => exploreTown(checkNearTown(position.x, position.y))}>Explore</button>}
        </div>
        <div className="arrow-keys">
          <button className="arrow-button" onMouseDown={() => handleButtonStart("up")} onMouseUp={handleButtonEnd} onMouseLeave={handleButtonEnd} onTouchStart={() => handleButtonStart("up")} onTouchEnd={handleButtonEnd}>↑</button>
          <div className="left-right">
            <button className="arrow-button" onMouseDown={() => handleButtonStart("left")} onMouseUp={handleButtonEnd} onMouseLeave={handleButtonEnd} onTouchStart={() => handleButtonStart("left")} onTouchEnd={handleButtonEnd}>←</button>
            <button className="arrow-button" onMouseDown={() => handleButtonStart("down")} onMouseUp={handleButtonEnd} onMouseLeave={handleButtonEnd} onTouchStart={() => handleButtonStart("down")} onTouchEnd={handleButtonEnd}>↓</button>
            <button className="arrow-button" onMouseDown={() => handleButtonStart("right")} onMouseUp={handleButtonEnd} onMouseLeave={handleButtonEnd} onTouchStart={() => handleButtonStart("right")} onTouchEnd={handleButtonEnd}>→</button>
          </div>
        </div>
      </>
      {showInventory && (
        <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", background: "rgba(0, 0, 0, 0.95)", padding: "20px", borderRadius: "10px", zIndex: 2000, minWidth: "300px", border: "2px solid #FFD700", boxShadow: "0 0 20px rgba(255, 215, 0, 0.3)" }}>
          <div>
            <h2 style={{ color: "#FFD700", textAlign: "center", marginBottom: "20px", fontSize: "24px", textShadow: "0 0 10px rgba(255, 215, 0, 0.5)" }}>
              Inventory
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "400px", overflowY: "auto", padding: "10px" }}>
              {inventory.length === 0 ? (
                <div style={{ color: "#888", textAlign: "center", padding: "20px", fontStyle: "italic" }}>Inventory kosong</div>
              ) : (
                inventory.map((item, index) => (
                  <div key={index} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px", background: "rgba(255, 255, 255, 0.1)", borderRadius: "8px", border: "1px solid rgba(255, 215, 0, 0.3)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <span style={{ fontSize: "24px", filter: "drop-shadow(0 0 5px rgba(255, 215, 0, 0.5))" }}>{item.name === "Papeda" ? "🍲" : "📦"}</span>
                      <span style={{ color: "white", fontSize: "16px", fontWeight: "500" }}>{item.name} {item.quantity ? `x${item.quantity}` : ""}</span>
                    </div>
                    {item.name === "Papeda" && (
                      <button onClick={() => handleUseItem(item.name)} style={{ background: "#4CAF50", color: "white", border: "none", padding: "8px 16px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", boxShadow: "0 2px 4px rgba(0,0,0,0.2)", transition: "all 0.2s ease" }}>
                        Makan
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
            <button onClick={() => setShowInventory(false)} style={{ background: "#FFD700", color: "#000", border: "none", padding: "12px 24px", borderRadius: "6px", cursor: "pointer", marginTop: "20px", width: "100%", fontWeight: "bold", fontSize: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Game;