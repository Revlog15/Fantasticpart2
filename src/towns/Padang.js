
import React, { useState, useEffect, useCallback } from "react";
import "./Town.css";

function Padang({ onReturn }) {
  const [isLeaving, setIsLeaving] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [position, setPosition] = useState({ x: 400, y: 300 });
  const [direction, setDirection] = useState("right");
  const [showClouds, setShowClouds] = useState(true);
  const [nearNPC, setNearNPC] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [currentDialog, setCurrentDialog] = useState([]);
  const [showInventory, setShowInventory] = useState(false);
  const [inventory, setInventory] = useState([]);
  const [questProgress, setQuestProgress] = useState({
    hasStartedQuest: false,
    hasDaging: false,
    hasSantan: false,
    hasCabai: false,
  });
  const [showQuizOptions, setShowQuizOptions] = useState(false);
  const CHARACTER_SIZE = 150;
  const NPC_DETECTION_RADIUS = 100;
  const [typedText, setTypedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [currentSpeaker, setCurrentSpeaker] = useState(null);
  const TYPING_SPEED = 30; // milliseconds per character
  const [collectingIngredient, setCollectingIngredient] = useState(null);
  const [lastCollectedItem, setLastCollectedItem] = useState(null);
  const [stats, setStats] = useState({
    happiness: 100,
    hunger: 100,
    hygiene: 100,
    sleep: 100
  });
  const [showCookingAnimation, setShowCookingAnimation] = useState(false);
  const [showRendang, setShowRendang] = useState(false);
  const [rendangPosition, setRendangPosition] = useState({ x: 600, y: 400 });
  const [cookingProgress, setCookingProgress] = useState(0);
  const [showCongrats, setShowCongrats] = useState(false);

  const selectedCharacter =
    localStorage.getItem("selectedCharacter") || "revlog";
  const [characterImage, setCharacterImage] = useState(
    `${selectedCharacter}-idle`
  );

  // Define NPCs for Padang with their dialogs
  const npcs = [
    {
      id: 1,
      name: "Merdeka",
      x: 600,
      y: 500,
      image: "npc_merdeka",
      description: "Seorang kakek bijaksana yang ahli dalam pembuatan rendang.",
      dialogs: {
        initial: [
          "Ah, selamat datang di Kota Padang, anak muda! Aku dengar kamu ingin belajar membuat rendang. Rendang adalah warisan leluhur yang sangat berharga bagi kami."
        ],
        options: [
          "Iya Kek, saya ingin belajar membuat rendang!",
          "Mohon bimbingan Kakek untuk membuat rendang."
        ],
        response: "Baiklah, dengarkan baik-baik. Untuk membuat rendang yang lezat, kamu perlu mengumpulkan bahan-bahan khusus. Pertama-tama, carilah daging sapi segar dari Anosheep di dekat lembah harau. Dia punya daging terbaik se-Padang. Setelah bertemu dengannya, ikuti petunjuk selanjutnya."
      }
    },
    {
      id: 2,
      name: "Anosheep",
      x: 850,
      y: 500,
      image: "npc_anosheep",
      description: "Penjual daging sapi dan produk susu terbaik di Padang.",
      dialogs: {
        initial: ["Halo, ada yang bisa saya bantu?"],
        withoutQuest: "Maaf, sebaiknya kamu temui Merdeka dulu di pusat kota.",
        playerGreeting: "Halo, saya ingin mencari daging sapi. Apakah kamu memilikinya?",
        anosheepResponse: "Ya, saya memiliki beberapa bahan yang bisa kamu pilih, tapi sebelum itu jawablah pertanyaan ini:",
        provinceQuestion: "Di provinsi manakah kota Padang berada?",
        provinceOptions: [
          "Sumatera Barat",
          "Sumatera Utara",
          "Sumatera Selatan",
          "Riau"
        ],
        provinceCorrect: 0,
        provinceSuccess: "Benar sekali! Padang adalah ibu kota Sumatera Barat. kamu bisa memilih bahan yang kamu perlukan.",
        provinceWrong: "Maaf, jawabanmu kurang tepat. Cobalah pelajari lebih banyak tentang geografi Indonesia.",
        withQuest: ":",
        options: [
          "Daging Sapi Segar",
          "Susu Sapi Murni",
          "Keju Tradisional"
        ],
        responses: {
          correct: "Pilihan yang tepat! Ini daging sapi segar yang cocok untuk rendang. Untuk bahan selanjutnya, temui seseorang yang berada di parisnya kota padang.",
          wrong: "Hmm... sepertinya itu bukan bahan yang tepat untuk rendang. Coba pilih yang lain?"
        }
      }
    },
    {
      id: 3,
      name: "Dinozaurus",
      x: 1380,
      y: 160,
      image: "npc_dinozaurus",
      description: "Petani kelapa yang menjual santan segar.",
      dialogs: {
        initial: ["Selamat datang di kebun kelapa! Ada yang bisa kubantu?"],
        withoutDaging: "Sebaiknya kamu dapatkan daging dari Anosheep dulu.",
        withDaging: "Ah, kamu sudah mendapatkan daging sapi? Bagus! Tapi sebelum memberikan santan, saya ingin menguji pengetahuanmu tentang Kota Padang.",
        question: "Apakah nama destinasi yang menjadi iconic kota bukittinggi",
        options: [
          "candi borobudur",
          "pantai indah kapuk",
          "Jam Gadang",
          "Aeon mall"
        ],
        correct: 2,
        success: "Benar sekali! Jam gadang adalah destinasi wisata ikonik dengan bentuk menara yang tinggi dan dibagun pada tahun 1926. Ini santannya untuk membuat rendang.",
        wrong: "Maaf, jawabanmu kurang tepat. Mari kita coba pertanyaan lain tentang Kota Padang.",
        secondQuestion: "Apakah nama jembatan ikonik yang menghubungkan Kota Padang dengan Padang Pariaman?",
        secondOptions: [
          "Jembatan Siti Nurbaya",
          "Jembatan Ampera",
          "Jembatan Merah Putih",
          "Jembatan Barelang"
        ],
        secondCorrect: 0,
        secondSuccess: "Benar! Jembatan Siti Nurbaya adalah jembatan bersejarah yang juga diabadikan dalam novel terkenal karya Marah Rusli. Ini santannya untuk membuat rendang. Sekarang kamu bisa mencari Bebi untuk mendapatkan cabai.",
        hint: "Destinasi ini sangat terkenal dan menjadi simbol kota Bukittinggi.",
        failMessage: "Jangan khawatir, banyak tempat menarik di Padang yang bisa kamu pelajari. Kembalilah setelah mempelajari lebih banyak tentang kota ini."
      }
    },
    {
      id: 4,
      name: "Bebi",
      x: 300,
      y: 300,
      image: "npc_bebi",
      description: "Petani cabai yang menanam berbagai jenis cabai.",
      dialogs: {
        initial: ["Halo, ada yang bisa saya bantu?"],
        playerGreeting: "Halo, saya sedang mencari cabai untuk membuat rendang. Apakah kamu bisa membantuku mendapatkan cabai?",
        withoutIngredients: "Kamu harus mengumpulkan daging dan santan dulu sebelum ke sini.",
        bebiResponse: "Ya, saya memiliki cabai yang kamu butuhkan, tapi sebelum itu jawablah pertanyaan ini:",
        question: "Apa nama gunung yang terletak di Sumatera Barat?",
        options: [
          "Gunung Marapi",
          "Gunung Bromo",
          "Gunung Rinjani"
        ],
        correct: 0,
        success: "Benar sekali! Gunung Marapi adalah gunung berapi aktif yang terletak di Sumatera Barat. Ini cabai spesial untuk rendangmu. Sekarang kamu sudah punya semua bahan untuk membuat rendang yang lezat!",
        wrong: "Maaf, jawabanmu kurang tepat. Coba lagi ya!"
      }
    }
  ];

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

  // Effect to check proximity to NPCs after movement
  useEffect(() => {
    checkNearNPC(position.x, position.y);
  }, [position]);

  const handleReturn = () => {
    setIsLeaving(true);
    setShowClouds(true);
    setTimeout(() => {
      onReturn();
    }, 500);
  };

  useEffect(() => {
    // Hide welcome messages after 5 seconds
    const welcomeTimer = setTimeout(() => {
      setShowWelcome(false);
    }, 7000); // Increased to give more time to read all messages

    // Hide clouds after entering
    const cloudsTimer = setTimeout(() => {
      setShowClouds(false);
    }, 2000);

    return () => {
      clearTimeout(welcomeTimer);
      clearTimeout(cloudsTimer);
    };
  }, []);

  // Handle character movement
  const moveCharacter = (moveDirection) => {
    const step = 15;
    const gameWidth = window.innerWidth;
    const gameHeight = window.innerHeight;
    let { x, y } = position;

    switch (moveDirection) {
      case "left":
        x = Math.max(x - step, 0);
        setDirection("left");
        setCharacterImage(`${selectedCharacter}-left`);
        break;
      case "right":
        x = Math.min(x + step, gameWidth - CHARACTER_SIZE);
        setDirection("right");
        setCharacterImage(`${selectedCharacter}-right`);
        break;
      case "up":
        y = Math.max(y - step, 0);
        setDirection("up");
        setCharacterImage(`${selectedCharacter}-left`);
        break;
      case "down":
        y = Math.min(y + step, gameHeight - CHARACTER_SIZE);
        setDirection("down");
        setCharacterImage(`${selectedCharacter}-right`);
        break;
      default:
        return;
    }
    setPosition({ x, y });
  };

  // Handle keyboard controls
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
  }, [position, selectedCharacter]);

  // Ingredient emoji mapping
  const ingredientEmojis = {
    'Daging Sapi': '🥩',
    'Santan': '🥥',
    'Cabai': '🌶️'
  };

  // Add ingredient to inventory with animation
  const addToInventory = (item) => {
    // Get NPC position for animation start point
    const npcPos = npcs.find(n => 
      (item === 'Daging Sapi' && n.name === 'Anosheep') ||
      ((item === 'Santan' || item === 'Cabai') && n.name === 'Dinozaurus') ||
      (item === 'Gula Aren' && n.name === 'Bebi')
    );

    // Show collection animation
    setCollectingIngredient({
      item,
      emoji: ingredientEmojis[item],
      position: {
        x: npcPos.x + CHARACTER_SIZE/2,
        y: npcPos.y + CHARACTER_SIZE/2
      }
    });

    // Add to inventory after animation
    setTimeout(() => {
      setInventory(prev => [...prev, item]);
      setLastCollectedItem(item);
      setCollectingIngredient(null);
    }, 1000);
  };

  // Remove ingredient from inventory
  const removeFromInventory = (itemToRemove) => {
    setInventory(inventory.filter(item => item !== itemToRemove));
  };

  // Function to get item description
  const getItemDescription = (item) => {
    const descriptions = {
      'Daging Sapi': 'Daging sapi segar dari Anosheep',
      'Santan': 'Santan kelapa murni dari kebun Dinozaurus',
      'Cabai': 'Cabai merah segar untuk rendang',
      'Gula Aren': 'Gula aren spesial dari Bebi'
    };
    return descriptions[item] || 'Bahan untuk membuat rendang';
  };

  // Function to create a dialog message with speaker
  const createDialogMessage = (text, speaker, icon = null) => ({
    text,
    speaker,
    icon
  });

  // Update handleDialog for Dinozaurus
  const handleDialog = (npc) => {
    setShowDialog(true);
    
    if (npc.name === "Merdeka") {
      setCurrentSpeaker({ name: "Kakek Merdeka", type: "npc" });
      if (!questProgress.hasStartedQuest) {
        setCurrentDialog({
          ...createDialogMessage(npc.dialogs.initial[0], "Kakek Merdeka"),
          options: npc.dialogs.options,
          onSelect: (option) => {
            setQuestProgress({ ...questProgress, hasStartedQuest: true });
            setCurrentDialog({
              ...createDialogMessage(npc.dialogs.response, "Kakek Merdeka"),
              options: ["Baik, saya akan mencari bahan-bahannya!"],
              onSelect: () => setShowDialog(false)
            });
          }
        });
      }
    } else if (npc.name === "Anosheep") {
      if (!questProgress.hasStartedQuest) {
        setCurrentSpeaker({ name: "Anosheep", type: "npc" });
        setCurrentDialog({
          ...createDialogMessage(npc.dialogs.withoutQuest, "Anosheep"),
          options: ["Baik, saya akan menemui Merdeka dulu."],
          onSelect: () => setShowDialog(false)
        });
      } else if (!questProgress.hasDaging) {
        // First show player's greeting
        setCurrentSpeaker({ name: "Player", type: "player" });
        setCurrentDialog({
          ...createDialogMessage(npc.dialogs.playerGreeting, "Player"),
          options: ["..."],
          onSelect: () => {
            // Show Anosheep's response and transition to question
            setCurrentSpeaker({ name: "Anosheep", type: "npc" });
            setCurrentDialog({
              ...createDialogMessage(npc.dialogs.anosheepResponse + "\n\n" + npc.dialogs.provinceQuestion, "Anosheep"),
              options: npc.dialogs.provinceOptions,
              onSelect: (optionIndex) => {
                if (optionIndex === npc.dialogs.provinceCorrect) {
                  // If province answer correct, show ingredient options
                  setCurrentDialog({
                    ...createDialogMessage(npc.dialogs.provinceSuccess + "\n\n" + npc.dialogs.withQuest, "Anosheep"),
                    options: npc.dialogs.options,
                    onSelect: (ingredientIndex) => {
                      if (ingredientIndex === 0) {
                        setQuestProgress({ ...questProgress, hasDaging: true });
                        addToInventory('Daging Sapi');
                        setCurrentDialog({
                          ...createDialogMessage(npc.dialogs.responses.correct, "Anosheep"),
                          options: ["Terima kasih! Saya akan mencarinya."],
                          onSelect: () => setShowDialog(false)
                        });
                      } else {
                        setCurrentDialog({
                          ...createDialogMessage(npc.dialogs.responses.wrong, "Anosheep"),
                          options: npc.dialogs.options,
                          onSelect: (retryIndex) => {
                            if (retryIndex === 0) {
                              setQuestProgress({ ...questProgress, hasDaging: true });
                              addToInventory('Daging Sapi');
                              setCurrentDialog({
                                ...createDialogMessage(npc.dialogs.responses.correct, "Anosheep"),
                                options: ["Terima kasih! Saya akan mencari mencarinya."],
                                onSelect: () => setShowDialog(false)
                              });
                            }
                          }
                        });
                      }
                    }
                  });
                } else {
                  // If province answer wrong
                  setCurrentDialog({
                    ...createDialogMessage(npc.dialogs.provinceWrong, "Anosheep"),
                    options: ["Baik, saya akan belajar dulu dan kembali lagi."],
                    onSelect: () => setShowDialog(false)
                  });
                }
              }
            });
          }
        });
      } else {
        setCurrentDialog({
          text: "Kamu sudah mendapatkan daging sapi dariku. Sekarang carilah bahan lainnya dari Dinozaurus.",
          options: ["Baik, terima kasih!"],
          onSelect: () => setShowDialog(false)
        });
      }
    } else if (npc.name === "Dinozaurus") {
      if (!questProgress.hasDaging) {
        setCurrentDialog({
          ...createDialogMessage(npc.dialogs.withoutDaging, "Dinozaurus"),
          options: ["Baik, saya akan mencari daging dulu."],
          onSelect: () => setShowDialog(false)
        });
      } else if (!questProgress.hasSantan) {
        setCurrentDialog({
          ...createDialogMessage(npc.dialogs.withDaging, "Dinozaurus"),
          options: ["Saya siap menjawab pertanyaannya!"],
          onSelect: () => {
            // First question
            setCurrentDialog({
              ...createDialogMessage(npc.dialogs.question, "Dinozaurus"),
              options: npc.dialogs.options,
              onSelect: (optionIndex) => {
                if (optionIndex === npc.dialogs.correct) {
                  setQuestProgress({ ...questProgress, hasSantan: true });
                  // Add santan to inventory with animation from Dinozaurus's position
                  const npcPos = npcs.find(n => n.name === "Dinozaurus");
                  setCollectingIngredient({
                    item: 'Santan',
                    emoji: ingredientEmojis['Santan'],
                    position: {
                      x: npcPos.x + CHARACTER_SIZE/2,
                      y: npcPos.y + CHARACTER_SIZE/2
                    }
                  });
                  setTimeout(() => {
                    addToInventory('Santan');
                    setCollectingIngredient(null);
                  }, 1000);
                  
                  setCurrentDialog({
                    ...createDialogMessage(npc.dialogs.success, "Dinozaurus"),
                    options: ["Terima kasih! Saya akan mencari Bebi untuk mendapatkan cabai."],
                    onSelect: () => setShowDialog(false)
                  });
                } else {
                  // If wrong, give hint and second chance
                  setCurrentDialog({
                    ...createDialogMessage(npc.dialogs.wrong + " " + npc.dialogs.hint, "Dinozaurus"),
                    options: ["Maaf, saya akan mencoba lagi dengan pertanyaan berikutnya."],
                    onSelect: () => {
                      setCurrentDialog({
                        ...createDialogMessage(npc.dialogs.secondQuestion, "Dinozaurus"),
                        options: npc.dialogs.secondOptions,
                        onSelect: (secondOptionIndex) => {
                          if (secondOptionIndex === npc.dialogs.secondCorrect) {
                            setQuestProgress({ ...questProgress, hasSantan: true });
                            // Add santan to inventory with animation from Dinozaurus's position
                            const npcPos = npcs.find(n => n.name === "Dinozaurus");
                            setCollectingIngredient({
                              item: 'Santan',
                              emoji: ingredientEmojis['Santan'],
                              position: {
                                x: npcPos.x + CHARACTER_SIZE/2,
                                y: npcPos.y + CHARACTER_SIZE/2
                              }
                            });
                            setTimeout(() => {
                              addToInventory('Santan');
                              setCollectingIngredient(null);
                            }, 1000);
                            
                            setCurrentDialog({
                              ...createDialogMessage(npc.dialogs.secondSuccess, "Dinozaurus"),
                              options: ["Terima kasih! Saya akan mencari Bebi untuk mendapatkan cabai."],
                              onSelect: () => setShowDialog(false)
                            });
                          } else {
                            setCurrentDialog({
                              ...createDialogMessage("Maaf, jawabanmu masih kurang tepat. Cobalah pelajari lebih banyak tentang Kota Padang dan kembali lagi nanti.", "Dinozaurus"),
                              options: ["Baik, saya akan belajar dulu dan kembali lagi."],
                              onSelect: () => setShowDialog(false)
                            });
                          }
                        }
                      });
                    }
                  });
                }
              }
            });
          }
        });
      } else {
        setCurrentDialog({
          text: "Kamu sudah mendapatkan santan dariku. Sekarang carilah Bebi untuk mendapatkan cabai.",
          options: ["Baik, terima kasih!"],
          onSelect: () => setShowDialog(false)
        });
      }
    } else if (npc.name === "Bebi") {
      if (!questProgress.hasDaging || !questProgress.hasSantan) {
        // First show player's greeting
        setCurrentSpeaker({ name: "Player", type: "player" });
        setCurrentDialog({
          ...createDialogMessage(npc.dialogs.playerGreeting, "Player"),
          options: ["..."],
          onSelect: () => {
            setCurrentSpeaker({ name: "Bebi", type: "npc" });
            setCurrentDialog({
              ...createDialogMessage(npc.dialogs.withoutIngredients, "Bebi"),
              options: ["Baik, saya akan mengumpulkan bahan-bahan dulu."],
              onSelect: () => setShowDialog(false)
            });
          }
        });
      } else if (!questProgress.hasCabai) {
        // Show player's greeting first
        setCurrentSpeaker({ name: "Player", type: "player" });
        setCurrentDialog({
          ...createDialogMessage(npc.dialogs.playerGreeting, "Player"),
          options: ["..."],
          onSelect: () => {
            // Then show Bebi's response and question
            setCurrentSpeaker({ name: "Bebi", type: "npc" });
            setCurrentDialog({
              ...createDialogMessage(npc.dialogs.bebiResponse + "\n\n" + npc.dialogs.question, "Bebi"),
              options: npc.dialogs.options,
              onSelect: (optionIndex) => {
                if (optionIndex === npc.dialogs.correct) {
                  setQuestProgress({ ...questProgress, hasCabai: true });
                  // Add cabai to inventory with animation from Bebi's position
                  const npcPos = npcs.find(n => n.name === "Bebi");
                  setCollectingIngredient({
                    item: 'Cabai',
                    emoji: ingredientEmojis['Cabai'],
                    position: {
                      x: npcPos.x + CHARACTER_SIZE/2,
                      y: npcPos.y + CHARACTER_SIZE/2
                    }
                  });
                  setTimeout(() => {
                    addToInventory('Cabai');
                    setCollectingIngredient(null);
                    setCurrentDialog({
                      ...createDialogMessage(npc.dialogs.success, "Bebi"),
                      options: ["Terima kasih! Saatnya membuat rendang!"],
                      onSelect: () => {
                        setShowDialog(false);
                        setShowQuizOptions(false);
                        // Start congratulatory sequence after dialog
                        setShowCongrats(true);
                        // Congrats message will show for 3 seconds before cooking starts
                        setTimeout(() => {
                          setShowCongrats(false);
                          setShowCookingAnimation(true);
                          // Start cooking animation
                          let progress = 0;
                          const cookingInterval = setInterval(() => {
                            progress += 1;
                            setCookingProgress(progress);
                            if (progress >= 100) {
                              clearInterval(cookingInterval);
                              setShowCookingAnimation(false);
                              setShowRendang(true);
                            }
                          }, 50);
                        }, 3000);
                      }
                    });
                  }, 1000);
                } else {
                  setCurrentDialog({
                    ...createDialogMessage(npc.dialogs.wrong, "Bebi"),
                    options: ["Baik, saya akan mencoba lagi."],
                    onSelect: () => {
                      setShowDialog(false);
                      setShowQuizOptions(false);
                    }
                  });
                }
              }
            });
          }
        });
      } else {
        setCurrentDialog({
          text: "Kamu sudah mendapatkan cabai dariku. Sekarang kamu bisa membuat rendang yang lezat!",
          options: ["Terima kasih!"],
          onSelect: () => setShowDialog(false)
        });
      }
    }
  };

  // Typing animation effect
  const typeText = useCallback((text) => {
    setIsTyping(true);
    setShowOptions(false);
    setTypedText("");
    
    let currentChar = 0;
    const textLength = text.length;

    const typingInterval = setInterval(() => {
      if (currentChar < textLength) {
        setTypedText(prev => prev + text[currentChar]);
        currentChar++;
      } else {
        clearInterval(typingInterval);
        setIsTyping(false);
        setShowOptions(true);
      }
    }, TYPING_SPEED);

    return () => clearInterval(typingInterval);
  }, []);

  // Update dialog display with animation
  useEffect(() => {
    if (currentDialog.text && showDialog) {
      typeText(currentDialog.text);
    }
  }, [currentDialog.text, showDialog, typeText]);

  // Add stat decrease over time
  useEffect(() => {
    const statInterval = setInterval(() => {
      setStats(prevStats => ({
        happiness: Math.max(0, prevStats.happiness - 0.1),
        hunger: Math.max(0, prevStats.hunger - 0.2),
        hygiene: Math.max(0, prevStats.hygiene - 0.1),
        sleep: Math.max(0, prevStats.sleep - 0.15)
      }));
    }, 1000);

    return () => clearInterval(statInterval);
  }, []);

  // Function to collect rendang
  const collectRendang = () => {
    setCollectingIngredient({
      item: 'Rendang',
      emoji: '🍛',
      position: rendangPosition
    });
    
    setTimeout(() => {
      // Set hunger to 100% and show stat increase animation
      setStats(prevStats => ({
        ...prevStats,
        hunger: 100
      }));

      // Add floating text animation showing hunger restored
      const hungerText = document.createElement('div');
      hungerText.className = 'stat-increase';
      hungerText.textContent = '+Hunger Restored!';
      hungerText.style.position = 'absolute';
      hungerText.style.left = `${rendangPosition.x}px`;
      hungerText.style.top = `${rendangPosition.y - 30}px`;
      document.body.appendChild(hungerText);

      // Remove the floating text after animation
      setTimeout(() => {
        hungerText.remove();
      }, 2000);

      setShowRendang(false);
      setCollectingIngredient(null);
      addToInventory('Rendang');
    }, 1000);
  };

  return (
    <div
      className={`town`}
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
      <div className="stat-bars" style={{
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        padding: '15px',
        borderRadius: '10px',
        border: '2px solid #ffd700',
        display: 'flex',
        gap: '15px'
      }}>
        {/* Happiness Bar */}
        <div style={{ width: '150px' }}>
          <div style={{ color: '#fff', marginBottom: '5px', fontSize: '14px', textAlign: 'center' }}>Happiness</div>
          <div style={{
            width: '100%',
            height: '15px',
            backgroundColor: '#333',
            borderRadius: '10px',
            overflow: 'hidden',
            border: '1px solid #666'
          }}>
            <div style={{
              width: `${stats.happiness}%`,
              height: '100%',
              backgroundColor: '#FFD700',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>

        {/* Hunger Bar */}
        <div style={{ width: '150px' }}>
          <div style={{ color: '#fff', marginBottom: '5px', fontSize: '14px', textAlign: 'center' }}>Hunger</div>
          <div style={{
            width: '100%',
            height: '15px',
            backgroundColor: '#333',
            borderRadius: '10px',
            overflow: 'hidden',
            border: '1px solid #666'
          }}>
            <div style={{
              width: `${stats.hunger}%`,
              height: '100%',
              backgroundColor: '#FF6B6B',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>

        {/* Hygiene Bar */}
        <div style={{ width: '150px' }}>
          <div style={{ color: '#fff', marginBottom: '5px', fontSize: '14px', textAlign: 'center' }}>Hygiene</div>
          <div style={{
            width: '100%',
            height: '15px',
            backgroundColor: '#333',
            borderRadius: '10px',
            overflow: 'hidden',
            border: '1px solid #666'
          }}>
            <div style={{
              width: `${stats.hygiene}%`,
              height: '100%',
              backgroundColor: '#4CAF50',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>

        {/* Sleep Bar */}
        <div style={{ width: '150px' }}>
          <div style={{ color: '#fff', marginBottom: '5px', fontSize: '14px', textAlign: 'center' }}>Sleep</div>
          <div style={{
            width: '100%',
            height: '15px',
            backgroundColor: '#333',
            borderRadius: '10px',
            overflow: 'hidden',
            border: '1px solid #666'
          }}>
            <div style={{
              width: `${stats.sleep}%`,
              height: '100%',
              backgroundColor: '#2196F3',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>
      </div>

      {/* Map with transition effects */}
      <div
        className={`town-map-container ${isLeaving ? "leaving" : ""}`}
        style={{
          backgroundImage: "url('/Picture/mapspadang.jpg')",
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
                left: `${npc.x}px`,
                top: `${npc.y}px`,
                width: `${CHARACTER_SIZE}px`,
                height: `${CHARACTER_SIZE}px`,
                backgroundImage: `url('/Picture/${npc.image}.png')`,
                backgroundSize: "contain",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                zIndex: 90,
              }}
            />
            {isNearby && (
              <button
                className="npc-interaction-button"
                onClick={() => handleDialog(npc)}
                style={{
                  position: "absolute",
                  left: `${npc.x + CHARACTER_SIZE/2}px`,
                  top: `${npc.y - 40}px`,
                  transform: "translateX(-50%)",
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

      {/* Welcome Messages */}
      {showWelcome && (
        <>
          <div className="welcome-message">
            Selamat Datang di Kota Padang
          </div>
          
          <div className="mission-text">
            MISI: Membuat Rendang Padang
          </div>

          <div className="instruction-text">
            Untuk memulai petualangan memasak rendang, Anda harus menemui seorang kakek yang bernama merdeka.
            Beliau adalah seorang ahli dalam pembuatan rendang dan akan memberikan petunjuk tentang bahan-bahan yang diperlukan.
            Ikuti petunjuk Kakek Merdeka dengan baik untuk membuat rendang yang lezat!
          </div>
        </>
      )}

      {/* Return button in corner */}
      <button
        className="return-button"
        onClick={handleReturn}
        style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          zIndex: 1000,
        }}
      >
        Return to Map
      </button>

      {/* Virtual Arrow Keys */}
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

      {/* Dialog Box with Speaker Indicators */}
      {showDialog && (
        <div className="dialog-box">
          <div className="dialog-content">
            {currentDialog.speaker && (
              <div className={`dialog-speaker ${currentDialog.speaker === "Player" ? "speaker-player" : "speaker-npc"}`}>
                <div 
                  className="speaker-icon"
                  style={{
                    backgroundImage: currentDialog.speaker === "Player" 
                      ? `url('/Picture/${selectedCharacter}-idle.png')`
                      : `url('/Picture/npc_${currentDialog.speaker.toLowerCase()}.png')`
                  }}
                />
                {currentDialog.speaker}
              </div>
            )}
            <div className="dialog-text-container">
              <div className="dialog-text">
                {typedText}
                {isTyping && <span className="dialog-cursor" />}
              </div>
            </div>
            <div className={`dialog-options ${showOptions ? 'show' : ''}`}>
              {!isTyping && currentDialog.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => currentDialog.onSelect(index)}
                  className="dialog-option"
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quest Progress Display */}
      <div className="quest-progress">
        <h3>Bahan Rendang:</h3>
        <ul>
          <li className={questProgress.hasDaging ? 'collected' : ''}>
            <span>Daging Sapi</span>
            <span>{questProgress.hasDaging ? '✓' : '×'}</span>
          </li>
          <li className={questProgress.hasSantan ? 'collected' : ''}>
            <span>Santan</span>
            <span>{questProgress.hasSantan ? '✓' : '×'}</span>
          </li>
          <li className={questProgress.hasCabai ? 'collected' : ''}>
            <span>Cabai</span>
            <span>{questProgress.hasCabai ? '✓' : '×'}</span>
          </li>
        </ul>
      </div>

      {/* Inventory Button */}
      <button
        className="inventory-button"
        onClick={() => setShowInventory(true)}
        style={{
          position: "fixed",
          top: "20px",
          right: "150px",
          zIndex: 1000,
        }}
      >
        Inventory
      </button>

      {/* Ingredient Collection Animation */}
      {collectingIngredient && (
        <>
          <div 
            className="ingredient-collect"
            style={{
              left: `${collectingIngredient.position.x}px`,
              top: `${collectingIngredient.position.y}px`
            }}
          >
            {collectingIngredient.emoji}
          </div>
          <div 
            className="ingredient-flash"
            style={{
              left: `${collectingIngredient.position.x - 50}px`,
              top: `${collectingIngredient.position.y - 50}px`
            }}
          />
        </>
      )}

      {/* Inventory Modal with Animation */}
      {showInventory && (
        <div className="inventory-modal">
          <div className="inventory-content">
            <h2>Inventory Bahan Rendang</h2>
            <div className="inventory-items">
              {inventory.length === 0 ? (
                <p>Belum ada bahan yang dikumpulkan.</p>
              ) : (
                inventory.map((item, index) => (
                  <div 
                    key={index} 
                    className={`inventory-item ${item === lastCollectedItem ? 'inventory-item-new' : ''}`}
                  >
                    <div>
                      <h3>{ingredientEmojis[item]} {item}</h3>
                      <p>{getItemDescription(item)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <button
              className="close-inventory"
              onClick={() => {
                setShowInventory(false);
                setLastCollectedItem(null);
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Congratulatory Message */}
      {showCongrats && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          padding: '20px',
          borderRadius: '10px',
          border: '2px solid #ffd700',
          zIndex: 1000,
          textAlign: 'center',
          color: '#fff',
          maxWidth: '400px'
        }}>
          <div style={{ fontSize: '24px', marginBottom: '15px', color: '#ffd700' }}>
            🎉 Selamat! 🎉
          </div>
          <div style={{ fontSize: '16px', lineHeight: '1.5' }}>
            Kamu telah menyelesaikan misi untuk mencari bahan pembuatan rendang.
            <br /><br />
            Rendang akan dibuat untuk dikonsumsi.
          </div>
        </div>
      )}

      {/* Cooking Animation */}
      {showCookingAnimation && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          padding: '20px',
          borderRadius: '10px',
          border: '2px solid #ffd700',
          zIndex: 1000,
          textAlign: 'center'
        }}>
          <div style={{ color: '#fff', marginBottom: '10px', fontSize: '18px' }}>
            Membuat Rendang...
          </div>
          <div style={{
            width: '300px',
            height: '20px',
            backgroundColor: '#333',
            borderRadius: '10px',
            overflow: 'hidden',
            border: '1px solid #666'
          }}>
            <div style={{
              width: `${cookingProgress}%`,
              height: '100%',
              backgroundColor: '#ffd700',
              transition: 'width 0.3s ease'
            }} />
          </div>
          <div style={{ marginTop: '10px', fontSize: '24px' }}>
            🥩 + 🥥 + 🌶️ = 🍛
          </div>
        </div>
      )}

      {/* Rendang Collectible */}
      {showRendang && (
        <div
          onClick={collectRendang}
          style={{
            position: 'absolute',
            left: `${rendangPosition.x}px`,
            top: `${rendangPosition.y}px`,
            fontSize: '40px',
            cursor: 'pointer',
            animation: 'float 2s ease-in-out infinite',
            zIndex: 95,
            filter: 'drop-shadow(0 0 10px gold)',
            textShadow: '0 0 20px gold'
          }}
        >
          <div className="rendang-glow"></div>
          🍛
        </div>
      )}

      <style>
        {`
          @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0px); }
          }

          .rendang-glow {
            position: absolute;
            width: 100%;
            height: 100%;
            background: radial-gradient(circle, rgba(255,215,0,0.4) 0%, rgba(255,215,0,0) 70%);
            animation: pulse 2s ease-in-out infinite;
            transform: scale(2);
            pointer-events: none;
          }

          @keyframes pulse {
            0% { transform: scale(2); opacity: 0.5; }
            50% { transform: scale(2.5); opacity: 0.8; }
            100% { transform: scale(2); opacity: 0.5; }
          }

          .rendang-glow::before,
          .rendang-glow::after {
            content: '';
            position: absolute;
            width: 100%;
            height: 100%;
            background: inherit;
            animation: rotate 4s linear infinite;
          }

          .rendang-glow::after {
            animation-direction: reverse;
          }

          @keyframes rotate {
            from { transform: rotate(0deg) scale(2); }
            to { transform: rotate(360deg) scale(2); }
          }

          .stat-increase {
            color: #4CAF50;
            font-size: 20px;
            font-weight: bold;
            text-shadow: 0 0 5px rgba(76, 175, 80, 0.5);
            animation: floatUp 2s ease-out forwards;
            z-index: 1000;
          }

          @keyframes floatUp {
            0% {
              transform: translateY(0);
              opacity: 1;
            }
            100% {
              transform: translateY(-50px);
              opacity: 0;
            }
          }
        `}
      </style>
    </div>
  );
}

export default Padang;
