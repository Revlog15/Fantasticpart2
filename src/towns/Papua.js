import React, { useState, useEffect, useCallback, useRef } from "react";
import "./Town.css";
import { auth } from "../firebase";

function Papua(props) {
  if (props.showDeathScreen) return null;
  const [isLeaving, setIsLeaving] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [position, setPosition] = useState({ x: 40, y: 30 });
  const [direction, setDirection] = useState("right");
  const [showClouds, setShowClouds] = useState(true);
  const [nearNPC, setNearNPC] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [currentDialog, setCurrentDialog] = useState([]);
  const [showInventory, setShowInventory] = useState(false);
  const userId = auth.currentUser?.uid;
  const questKey = userId ? `papuaProgress_${userId}` : "papuaProgress";
  const [questProgress, setQuestProgress] = useState(() => {
    const saved = localStorage.getItem(questKey);
    return saved ? JSON.parse(saved) : {
          hasStartedQuest: false,
          hasSagu: false,
      hasIkan: false,
      hasKuah: false,
    };
  });
  const [showQuizOptions, setShowQuizOptions] = useState(false);
  const CHARACTER_SIZE = 150;
  const MOVEMENT_SPEED = 1;
  const NPC_DETECTION_RADIUS = 15;
  const INTERACTIVE_SPOT_DETECTION_RADIUS = 8;
  const [typedText, setTypedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [currentSpeaker, setCurrentSpeaker] = useState(null);
  const TYPING_SPEED = 30;
  const [collectingIngredient, setCollectingIngredient] = useState(null);
  const [lastCollectedItem, setLastCollectedItem] = useState(null);
  const [showCookingAnimation, setShowCookingAnimation] = useState(false);
  const [showPapeda, setShowPapeda] = useState(false);
  const [papedaPosition, setPapedaPosition] = useState({ x: 50, y: 50 });
  const [cookingProgress, setCookingProgress] = useState(0);
  const [showCongrats, setShowCongrats] = useState(false);
  const typingIntervalRef = useRef(null);
  const [nearInteractiveSpot, setNearInteractiveSpot] = useState(null);
  const [papedaCount, setPapedaCount] = useState(3);

  const selectedCharacter = (
    localStorage.getItem("selectedCharacter") || "revlog"
  ).toLowerCase();
  const [characterImage, setCharacterImage] = useState(
    `/Picture/${selectedCharacter}-idle.png`
  );

  // Debug logs for character image and position
  console.log("Selected Character (lowercase):", selectedCharacter);
  console.log("Initial Character Image State:", characterImage);
  console.log("Character Position:", position.x, position.y);

  const ingredientEmojis = {
    "Ikan Segar": "🐟",
    "Tepung Sagu": "🌾",
    Bumbu: "🧂",
    Papeda: "🍲",
  };

  // Define NPCs
  const npcs = [
    {
      id: 1,
      name: "Merdeka",
      x: 57,
      y: 55,
      image: "npc_merdeka",
      description: "Seorang kakek bijaksana yang ahli dalam pembuatan Papeda.",
      dialogs: {
        initial: [
          "Ah, selamat datang di Papua, anak muda! Aku dengar kamu ingin belajar membuat Papeda. Papeda adalah makanan tradisional yang sangat berharga bagi kami.",
        ],
        options: [
          "Iya Kek, saya ingin belajar membuat Papeda HIDUP REVLOG!!!",
          "Mohon bimbingan Kakek untuk membuat Papeda.",
        ],
        responses: {
          revlog:
            "HIDUP REVLOG!!! Wah, semangat sekali kamu! Mari kita mulai petualangan kuliner Papua! Pertama, carilah Anosheep di Danau Sentani. Dia punya ikan terbaik se-Papua yang akan membuat Papedamu istimewa!",
          normal:
            "Baiklah, dengarkan baik-baik. Untuk membuat Papeda yang lezat, kamu perlu mengumpulkan bahan-bahan khusus. Pertama-tama, carilah ikan segar dari Anosheep di Danau Sentani. Dia punya ikan terbaik se-Papua. Setelah bertemu dengannya, ikuti petunjuk selanjutnya.",
        },
      },
    },
    {
      id: 2,
      name: "Anosheep",
      x: 21,
      y: 80,
      image: "npc_anosheep",
      description: "Penjual ikan dan hasil laut terbaik di Papua.",
      dialogs: {
        initial: ["Halo, ada yang bisa saya bantu?"],
        withoutQuest:
          "MBEEE (Maaf, sebaiknya kamu temui Merdeka dulu di pusat kota.)",
        playerGreeting:
          "Halo, saya ingin mencari ikan dari Danau Sentani. Apakah kamu memilikinya?",
        anosheepResponse:
          "Mbe (Ya, saya memiliki beberapa ikan dari Danau Sentani yang bisa kamu pilih, tapi sebelum itu jawablah pertanyaan ini)",
        question:
          "Apa nama suku asli yang mendiami wilayah sekitar Danau Sentani?",
        options: ["Suku Sentani", "Suku Dayak", "Suku Toraja", "Suku Baduy"],
        correct: 0,
        success:
          "MBEEEEE!! (Benar sekali! Suku Sentani adalah suku asli yang mendiami wilayah sekitar Danau Sentani. Kamu bisa memilih ikan yang kamu perlukan.)",
        wrong:
          "mbe... (Maaf, jawabanmu kurang tepat. Cobalah pelajari lebih banyak tentang budaya Papua.)",
        withQuest: ":",
        options: ["Ikan Segar", "Udang Segar", "Kepiting Segar"],
        responses: {
          correct:
            "MBEEEEE!! (Pilihan yang tepat! Ini ikan segar dari Danau Sentani yang cocok untuk Papeda. Untuk bahan selanjutnya, temui Dinozaurus di Puncak Jaya.)",
          wrong:
            "mbe... (Hmm... sepertinya itu bukan bahan yang tepat untuk Papeda. Coba pilih yang lain?)",
        },
      },
    },
    {
      id: 3,
      name: "Dinozaurus",
      x: 90,
      y: 20,
      image: "npc_dinozaurus",
      description: "Petani sagu yang menjual tepung sagu segar.",
      dialogs: {
        initial: ["Selamat datang di Puncak Jaya! Ada yang bisa kubantu?"],
        withoutIkan:
          "Sebaiknya kamu dapatkan ikan dari Anosheep di Danau Sentani dulu.",
        withIkan:
          "Ah, kamu sudah mendapatkan ikan dari Danau Sentani? Bagus! Tapi sebelum memberikan tepung sagu, saya ingin menguji pengetahuanmu tentang Puncak Jaya.",
        question:
          "Apa nama puncak tertinggi di Puncak Jaya yang merupakan puncak tertinggi di Indonesia?",
        options: [
          "Puncak Carstensz",
          "Puncak Mandala",
          "Puncak Trikora",
          "Puncak Yamin",
        ],
        correct: 0,
        success:
          "Benar sekali! Puncak Carstensz adalah puncak tertinggi di Indonesia dengan ketinggian 4.884 mdpl. Ini tepung sagunya untuk membuat Papeda.",
        wrong:
          "Maaf, jawabanmu kurang tepat. Mari kita coba pertanyaan lain tentang Puncak Jaya.",
        secondQuestion:
          "Apa nama gletser yang ada di Puncak Jaya yang merupakan satu-satunya gletser tropis di Indonesia?",
        secondOptions: [
          "Gletser Carstensz",
          "Gletser Mandala",
          "Gletser Trikora",
          "Gletser Yamin",
        ],
        secondCorrect: 0,
        secondSuccess:
          "Benar! Gletser Carstensz adalah satu-satunya gletser tropis di Indonesia. Ini tepung sagunya untuk membuat Papeda. Sekarang kamu bisa mencari Bebi di Raja Ampat untuk mendapatkan bumbu.",
        hint: "Gletser ini berada di puncak tertinggi.",
        failMessage:
          "Jangan khawatir, banyak hal menarik di Puncak Jaya yang bisa kamu pelajari. Kembalilah setelah mempelajari lebih banyak tentang tempat ini.",
      },
    },
    {
      id: 4,
      name: "Bebi",
      x: 17,
      y: 30,
      image: "npc_bebi",
      description: "Pedagang bumbu tradisional Papua.",
      dialogs: {
        initial: ["Halo, ada yang bisa saya bantu?"],
        playerGreeting:
          "Halo, saya sedang mencari bumbu untuk membuat Papeda. Apakah kamu bisa membantuku mendapatkan bumbu?",
        withoutIngredients:
          "Kamu harus mengumpulkan ikan dari Danau Sentani dan tepung sagu dari Puncak Jaya dulu sebelum ke sini.",
        bebiResponse:
          "Ya, saya memiliki bumbu yang kamu butuhkan, tapi sebelum itu jawablah pertanyaan ini:",
        question: "Apa nama pulau terbesar di Kepulauan Raja Ampat?",
        options: [
          "Pulau Waigeo",
          "Pulau Misool",
          "Pulau Salawati",
          "Pulau Batanta",
        ],
        correct: 0,
        success:
          "Benar sekali! Pulau Waigeo adalah pulau terbesar di Kepulauan Raja Ampat. Ini bumbu spesial untuk Papedamu. Sekarang kamu sudah punya semua bahan untuk membuat Papeda yang lezat!",
        wrong: "Maaf, jawabanmu kurang tepat. Coba lagi ya!",
      },
    },
  ];

  // Define interactive spots with their effects
  const interactiveSpots = [
    {
      id: 1,
      name: "Sungai Jernih",
      x: 30,
      y: 70,
      image: "river_spot", // You'll need to add this image
      description: "Minum air sungai untuk menghilangkan haus.",
      statsEffect: { hunger: +20, hygiene: -5 }, // Mengurangi hunger, sedikit mengurangi hygiene
    },
    {
      id: 2,
      name: "Pohon Buah",
      x: 70,
      y: 35,
      image: "fruit_tree_spot", // You'll need to add this image
      description: "Memetik buah-buahan segar untuk mengisi perut.",
      statsEffect: { hunger: +15, happiness: +5 }, // Mengurangi hunger, sedikit menambah happiness
    },
    {
      id: 3,
      name: "Tempat Bersantai",
      x: 10,
      y: 10,
      image: "relax_spot", // You'll need to add this image
      description: "Beristirahat dan menenangkan diri.",
      statsEffect: { happiness: +15, sleep: +10 }, // Menambah happiness, menambah sleep
    },
  ];

  // Function to get item description
  const getItemDescription = useCallback((item) => {
    const descriptions = {
      "Ikan Segar": "Ikan segar dari Anosheep",
      "Tepung Sagu": "Tepung sagu murni dari kebun Dinozaurus",
      Bumbu: "Bumbu tradisional Papua dari Bebi",
      Papeda: "Papeda yang lezat dan bergizi",
    };
    return descriptions[item] || "Bahan untuk membuat Papeda";
  }, []);

  // Fixed: Simplified dialog message creation
  const createDialogMessage = (text, speaker, icon = null) => ({
    text: typeof text === "string" ? text.trim() : "",
    speaker,
    icon,
  });

  // Sync questProgress with inventory whenever inventory changes
  useEffect(() => {
    setQuestProgress((prev) => ({
      ...prev,
      hasIkan: prev.hasIkan || props.inventory.includes("Ikan Segar"),
      hasSagu: prev.hasSagu || props.inventory.includes("Tepung Sagu"),
      hasKuah: prev.hasKuah || props.inventory.includes("Bumbu"),
    }));
  }, [props.inventory]);

  // Save questProgress to localStorage whenever it changes
  useEffect(() => {
    if (userId) {
      localStorage.setItem(questKey, JSON.stringify(questProgress));
    }
  }, [questProgress, userId]);

  // Check if all ingredients are collected using the *passed* inventory prop
  useEffect(() => {
    const allIngredientsCollected =
      props.inventory.includes("Ikan Segar") &&
      props.inventory.includes("Tepung Sagu") &&
      props.inventory.includes("Bumbu");

    if (allIngredientsCollected) {
      if (papedaCount > 0) {
        setShowPapeda(true);
        setPapedaPosition({ x: 50, y: 50 }); // Posisikan Papeda di tengah
      } else {
        // If papedaCount is 0, hide Papeda as it's already collected all times
        setShowPapeda(false);
      }
    }
  }, [papedaCount, props.inventory]);

  // Function to collect Papeda
  const handleCollectPapeda = useCallback(() => {
    if (papedaCount > 0) {
      props.addToInventory("Papeda", -1);
      setPapedaCount((prev) => prev - 1);
      setShowPapeda(false); // Sembunyikan Papeda setelah dikumpulkan
      setShowCongrats(true); // Tampilkan pesan selamat
      setTimeout(() => setShowCongrats(false), 3000); // Sembunyikan setelah 3 detik
    } else {
      console.log("Papeda sudah habis.");
    }
  }, [papedaCount, props.addToInventory]); // Tambahkan addToInventory sebagai dependensi

  // Add ingredient to inventory with animation
  // Fungsi ini akan memanggil addToInventory yang diteruskan dari Game.js
  const handleCollectIngredient = useCallback(
    (ingredient) => {
      setCollectingIngredient(ingredient);
      setLastCollectedItem(ingredient);

      // Panggil addToInventory dari props (dari Game.js)
      props.addToInventory(ingredient);

      // Update questProgress immediately as well, based on what was collected
      setQuestProgress((prev) => {
        let updatedProgress = { ...prev };
        if (ingredient === "Ikan Segar") updatedProgress.hasIkan = true;
        if (ingredient === "Tepung Sagu") updatedProgress.hasSagu = true;
        if (ingredient === "Bumbu") updatedProgress.hasKuah = true;
        return updatedProgress;
      });

      // Show collection animation
      setTimeout(() => {
        setCollectingIngredient(null);
      }, 1000);
    },
    [props.addToInventory]
  );

  // Typing animation effect
  const typeText = useCallback(
    (text) => {
      const textToType = String(text || "");
      setIsTyping(true);
      setShowOptions(false);
      setTypedText("");
      let currentChar = 0;
      if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
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
    },
    [TYPING_SPEED]
  );

  const handleFastForward = () => {
    if (isTyping) {
      clearInterval(typingIntervalRef.current);
      setTypedText(currentDialog.text);
      setIsTyping(false);
      setShowOptions(true);
    }
  };

  // Update dialog display with animation
  useEffect(() => {
    if (currentDialog && currentDialog.text && showDialog) {
      typeText(currentDialog.text);
    }
  }, [currentDialog, showDialog, typeText]);

  // Handle dialog interactions
  const handleDialog = (npc) => {
    setShowDialog(true);
    setCurrentSpeaker({ name: npc.name, type: "npc" });

    if (npc.name === "Merdeka") {
      if (!questProgress.hasStartedQuest) {
        setCurrentDialog({
          text: npc.dialogs.initial[0],
          speaker: "Merdeka",
          options: npc.dialogs.options,
          onSelect: (option) => {
            setQuestProgress({ ...questProgress, hasStartedQuest: true });
            setCurrentDialog({
              text:
                option === 0
                  ? npc.dialogs.responses.revlog
                  : npc.dialogs.responses.normal,
              speaker: "Merdeka",
              options: ["Baik, saya akan mencari bahan-bahannya!"],
              onSelect: () => setShowDialog(false),
            });
          },
        });
      } else if (questProgress.hasIkan && questProgress.hasSagu && questProgress.hasKuah) {
        setCurrentDialog({
          text: "Wah, kamu sudah berhasil mengumpulkan semua bahan! Sekarang kamu bisa membuat Papeda yang lezat. Jangan lupa untuk mengumpulkan Papeda yang sudah jadi!",
          speaker: "Merdeka",
          options: ["Terima kasih atas bimbingannya, Kek!"],
          onSelect: () => setShowDialog(false),
        });
      } else {
        setCurrentDialog({
          text: "Kamu sudah memulai petualanganmu. Lanjutkan mencari bahan-bahan yang diperlukan!",
          speaker: "Merdeka",
          options: ["Baik, Kek!"],
          onSelect: () => setShowDialog(false),
        });
      }
    } else if (npc.name === "Anosheep") {
      if (!questProgress.hasStartedQuest) {
        setCurrentDialog({
          text: npc.dialogs.withoutQuest,
          speaker: "Anosheep",
          options: ["Baik, saya akan menemui Merdeka dulu."],
          onSelect: () => setShowDialog(false),
        });
      } else if (!questProgress.hasIkan) {
        setCurrentDialog({
          text: npc.dialogs.playerGreeting,
          speaker: "Player",
          options: ["..."],
          onSelect: () => {
            setCurrentDialog({
              text: npc.dialogs.anosheepResponse,
              speaker: "Anosheep",
              options: ["Saya siap menjawab pertanyaannya!"],
              onSelect: () => {
                setCurrentDialog({
                  text: npc.dialogs.question,
                  speaker: "Anosheep",
                  options: npc.dialogs.options,
                  onSelect: (optionIndex) => {
                    if (optionIndex === npc.dialogs.correct) {
                      setQuestProgress({ ...questProgress, hasIkan: true });
                      // Add ikan to inventory with animation
                      const npcPos = npcs.find((n) => n.name === "Anosheep");
                      setCollectingIngredient({
                        item: "Ikan Segar",
                        emoji: ingredientEmojis["Ikan Segar"],
                        position: {
                          x: npcPos.x + CHARACTER_SIZE / 2,
                          y: npcPos.y + CHARACTER_SIZE / 2,
                        },
                      });
                      setTimeout(() => {
                        props.addToInventory("Ikan Segar");
                        setCollectingIngredient(null);
                      }, 1000);

                      setCurrentDialog({
                        text: npc.dialogs.success,
                        speaker: "Anosheep",
                        options: [
                          "Terima kasih! Saya akan mencari Dinozaurus untuk mendapatkan tepung sagu.",
                        ],
                        onSelect: () => setShowDialog(false),
                      });
                    } else {
                      setCurrentDialog({
                        text: npc.dialogs.wrong,
                        speaker: "Anosheep",
                        options: ["Baik, saya akan mencoba lagi."],
                        onSelect: () => setShowDialog(false),
                      });
                    }
                  },
                });
              },
            });
          },
        });
      }
    } else if (npc.name === "Dinozaurus") {
      setCurrentSpeaker({ name: "Dinozaurus", type: "npc" });
      if (!questProgress.hasIkan) {
        setCurrentDialog({
          ...createDialogMessage(npc.dialogs.withoutIkan, "Dinozaurus"),
          options: ["Baik, saya akan mencari ikan dulu."],
          onSelect: () => setShowDialog(false),
        });
      } else if (!questProgress.hasSagu) {
        setCurrentDialog({
          ...createDialogMessage(npc.dialogs.withIkan, "Dinozaurus"),
          options: ["Saya siap menjawab pertanyaannya!"],
          onSelect: () => {
            setCurrentDialog({
              ...createDialogMessage(npc.dialogs.question, "Dinozaurus"),
              options: npc.dialogs.options,
              onSelect: (optionIndex) => {
                if (optionIndex === npc.dialogs.correct) {
                  setQuestProgress({ ...questProgress, hasSagu: true });
                  props.addToInventory("Tepung Sagu");
                  setCurrentDialog({
                    ...createDialogMessage(npc.dialogs.success, "Dinozaurus"),
                    options: ["Terima kasih! Saya akan mencari Bebi."],
                    onSelect: () => setShowDialog(false),
                  });
                } else {
                  setCurrentDialog({
                    ...createDialogMessage(
                      npc.dialogs.wrong + " " + npc.dialogs.hint,
                      "Dinozaurus"
                    ),
                    options: [
                      "Maaf, saya akan mencoba lagi dengan pertanyaan berikutnya.",
                    ],
                    onSelect: () => {
                      setCurrentDialog({
                        ...createDialogMessage(
                          npc.dialogs.secondQuestion,
                          "Dinozaurus"
                        ),
                        options: npc.dialogs.secondOptions,
                        onSelect: (secondOptionIndex) => {
                          if (secondOptionIndex === npc.dialogs.secondCorrect) {
                            setQuestProgress({
                              ...questProgress,
                              hasSagu: true,
                            });
                            props.addToInventory("Tepung Sagu");
                            setCurrentDialog({
                              ...createDialogMessage(
                                npc.dialogs.secondSuccess,
                                "Dinozaurus"
                              ),
                              options: [
                                "Terima kasih! Saya akan mencari Bebi.",
                              ],
                              onSelect: () => setShowDialog(false),
                            });
                          } else {
                            setCurrentDialog({
                              ...createDialogMessage(
                                npc.dialogs.failMessage,
                                "Dinozaurus"
                              ),
                              options: ["Baik, saya akan belajar lagi."],
                              onSelect: () => setShowDialog(false),
                            });
                          }
                        },
                      });
                    },
                  });
                }
              },
            });
          },
        });
      } else {
        setCurrentDialog({
          text: "Kamu sudah mendapatkan tepung sagu dariku. Sekarang carilah Bebi untuk mendapatkan bumbu.",
          options: ["Baik, terima kasih!"],
          onSelect: () => setShowDialog(false),
        });
      }
    } else if (npc.name === "Bebi") {
      setCurrentSpeaker({ name: "Bebi", type: "npc" });
      if (!questProgress.hasIkan || !questProgress.hasSagu) {
        setCurrentDialog({
          ...createDialogMessage(npc.dialogs.withoutIngredients, "Bebi"),
          options: ["Baik, saya akan mengumpulkan bahan-bahannya dulu."],
          onSelect: () => setShowDialog(false),
        });
      } else if (!questProgress.hasKuah) {
        setCurrentDialog({
          ...createDialogMessage(npc.dialogs.playerGreeting, "Player"),
          options: ["Ya, saya ingin mendapatkan bumbu."],
          onSelect: () => {
            setCurrentDialog({
              ...createDialogMessage(npc.dialogs.bebiResponse, "Bebi"),
              options: ["Siap, silakan tanya!"],
              onSelect: () => {
                setCurrentDialog({
                  ...createDialogMessage(npc.dialogs.question, "Bebi"),
                  options: npc.dialogs.options,
                  onSelect: (optionIndex) => {
                    if (optionIndex === npc.dialogs.correct) {
                      setQuestProgress({ ...questProgress, hasKuah: true });
                      props.addToInventory("Bumbu");
                      // Papeda muncul segera setelah bumbu didapat
                      setShowPapeda(true);

                      setCurrentDialog({
                        ...createDialogMessage(npc.dialogs.success, "Bebi"),
                        options: ["Terima kasih! Saatnya membuat Papeda!"],
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
                                setShowPapeda(true);
                              }
                            }, 50);
                          }, 3000);
                        },
                      });
                    } else {
                      setCurrentDialog({
                        ...createDialogMessage(npc.dialogs.wrong, "Bebi"),
                        options: ["Baik, saya akan mencoba lagi."],
                        onSelect: () => {
                          setShowDialog(false);
                          setShowQuizOptions(false);
                        },
                      });
                    }
                  },
                });
              },
            });
          },
        });
      } else {
        setCurrentDialog({
          text: "Kamu sudah mendapatkan bumbu dariku. Sekarang kamu bisa membuat Papeda yang lezat!",
          options: ["Terima kasih!"],
          onSelect: () => setShowDialog(false),
        });
      }
    }
  };

  // Load inventory & progress from localStorage
  useEffect(() => {
    function reloadFromStorage() {
      const savedProgress = localStorage.getItem(questKey);
      if (savedProgress) setQuestProgress(JSON.parse(savedProgress));
    }
    reloadFromStorage();
    window.addEventListener("focus", reloadFromStorage);
    return () => window.removeEventListener("focus", reloadFromStorage);
  }, []);

  // Save stats to localStorage
  useEffect(() => {
    localStorage.setItem("gameStats", JSON.stringify(props.stats));
  }, [props.stats]);

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

  // Check if character is near an interactive spot
  const checkNearInteractiveSpot = (x, y) => {
    let foundSpot = null;
    for (const spot of interactiveSpots) {
      const distance = Math.sqrt(
        Math.pow(x - spot.x, 2) + Math.pow(y - spot.y, 2)
      );
      if (distance < INTERACTIVE_SPOT_DETECTION_RADIUS) {
        foundSpot = spot;
        break;
      }
    }
    setNearInteractiveSpot(foundSpot);
  };

  // Add effect to check NPC proximity on mount and position changes
  useEffect(() => {
    checkNearNPC(position.x, position.y);
    checkNearInteractiveSpot(position.x, position.y);
  }, [position.x, position.y]);

  // Function to handle interactive spot actions
  const handleInteractiveSpot = (spot) => {
    // Apply stat changes
    if (spot.statsEffect) {
      props.updateStats(spot.statsEffect);
      // Optionally, show a temporary message about the interaction
      setShowDialog(true);
      setCurrentDialog({
        text: `${spot.name}: ${spot.description} Stats Updated!`,
        options: ["OK"],
        onSelect: () => setShowDialog(false),
      });
    }
  };

  // Handle character movement
  const moveCharacter = (moveDirection) => {
    let newX = position.x;
    let newY = position.y;
    let newDirection = direction;
    let newImage = characterImage;

    switch (moveDirection) {
      case "left":
        newX = Math.max(0, position.x - MOVEMENT_SPEED);
        newDirection = "left";
        newImage = `/Picture/${selectedCharacter}-left.png`;
        break;
      case "right":
        newX = Math.min(100, position.x + MOVEMENT_SPEED);
        newDirection = "right";
        newImage = `/Picture/${selectedCharacter}-right.png`;
        break;
      case "up":
        newY = Math.max(0, position.y - MOVEMENT_SPEED);
        newDirection = "up";
        newImage = `/Picture/${selectedCharacter}-left.png`;
        break;
      case "down":
        newY = Math.min(100, position.y + MOVEMENT_SPEED);
        newDirection = "down";
        newImage = `/Picture/${selectedCharacter}-right.png`;
        break;
      default:
        return;
    }

    setPosition({ x: newX, y: newY });
    setDirection(newDirection);
    setCharacterImage(newImage);

    // Check for nearby NPCs and interactive spots after movement
    checkNearNPC(newX, newY);
    checkNearInteractiveSpot(newX, newY);
  };

  // Handle keyboard controls
  useEffect(() => {
    const handleKeyDown = (event) => {
      switch (event.key) {
        case "ArrowUp":
        case "w":
        case "W":
          moveCharacter("up");
          break;
        case "ArrowDown":
        case "s":
        case "S":
          moveCharacter("down");
          break;
        case "ArrowLeft":
        case "a":
        case "A":
          moveCharacter("left");
          break;
        case "ArrowRight":
        case "d":
        case "D":
          moveCharacter("right");
          break;
        default:
          return;
      }
    };

    const handleKeyUp = () => {
      setCharacterImage(`/Picture/${selectedCharacter}-idle.png`);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [position, direction, characterImage]);

  // Add event listener for NPC interaction
  useEffect(() => {
    const handleInteraction = (event) => {
      if (event.key === "e" && nearNPC) {
        handleDialog(nearNPC);
      }
    };
    window.addEventListener("keydown", handleInteraction);
    return () => window.removeEventListener("keydown", handleInteraction);
  }, [nearNPC]);

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
              style={{
                width: `${props.stats.happiness}%`,
                imageRendering: "pixelated",
                border: "1.5px solid #222",
              }}
            >
              <div className="stat-percentage">
                {Math.round(props.stats.happiness)}%
              </div>
            </div>
          </div>
        </div>
        <div className="stat-item">
          <span>Hunger:</span>
          <div className="stat-bar hunger-bar">
            <div
              className="stat-fill"
              style={{
                width: `${props.stats.hunger}%`,
                imageRendering: "pixelated",
                border: "1.5px solid #222",
              }}
            >
              <div className="stat-percentage">{Math.round(props.stats.hunger)}%</div>
            </div>
          </div>
        </div>
        <div className="stat-item">
          <span>Sleep:</span>
          <div className="stat-bar sleep-bar">
            <div
              className="stat-fill"
              style={{
                width: `${props.stats.sleep}%`,
                imageRendering: "pixelated",
                border: "1.5px solid #222",
              }}
            >
              <div className="stat-percentage">{Math.round(props.stats.sleep)}%</div>
            </div>
          </div>
        </div>
        <div className="stat-item">
          <span>Hygiene:</span>
          <div className="stat-bar hygiene-bar">
            <div
              className="stat-fill"
              style={{
                width: `${props.stats.hygiene}%`,
                imageRendering: "pixelated",
                border: "1.5px solid #222",
              }}
            >
              <div className="stat-percentage">
                {Math.round(props.stats.hygiene)}%
              </div>
            </div>
          </div>
        </div>
        <div className="stat-item gold-item">
          <span>Gold:</span>
          <span className="gold-amount">{props.stats.gold || 0}</span>
        </div>
      </div>

      {/* Map with transition effects */}
      <div
        className={`town-map-container ${isLeaving ? "leaving" : ""}`}
        style={{
          backgroundImage: "url('/Picture/papua.jpg')",
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
          backgroundImage: `url(${characterImage})`,
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          transform: "translate(-50%, -50%)",
          zIndex: 100,
        }}
      />

      {/* Virtual Arrow Keys */}
      <div className="arrow-keys">
        <button
          onMouseDown={() => moveCharacter("up")}
          onMouseUp={() =>
            setCharacterImage(`/Picture/${selectedCharacter}-idle.png`)
          }
          onTouchStart={() => moveCharacter("up")}
          onTouchEnd={() =>
            setCharacterImage(`/Picture/${selectedCharacter}-idle.png`)
          }
          className="arrow-button up"
        >
          ▲
        </button>
        <div className="left-right">
          <button
            onMouseDown={() => moveCharacter("left")}
            onMouseUp={() =>
              setCharacterImage(`/Picture/${selectedCharacter}-idle.png`)
            }
            onTouchStart={() => moveCharacter("left")}
            onTouchEnd={() =>
              setCharacterImage(`/Picture/${selectedCharacter}-idle.png`)
            }
            className="arrow-button left"
          >
            ◀
          </button>
          <button
            onMouseDown={() => moveCharacter("right")}
            onMouseUp={() =>
              setCharacterImage(`/Picture/${selectedCharacter}-idle.png`)
            }
            onTouchStart={() => moveCharacter("right")}
            onTouchEnd={() =>
              setCharacterImage(`/Picture/${selectedCharacter}-idle.png`)
            }
            className="arrow-button right"
          >
            ▶
          </button>
        </div>
        <button
          onMouseDown={() => moveCharacter("down")}
          onMouseUp={() =>
            setCharacterImage(`/Picture/${selectedCharacter}-idle.png`)
          }
          onTouchStart={() => moveCharacter("down")}
          onTouchEnd={() =>
            setCharacterImage(`/Picture/${selectedCharacter}-idle.png`)
          }
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

      {/* Interactive Spots */}
      {interactiveSpots.map((spot) => {
        const distance = Math.sqrt(
          Math.pow(position.x - spot.x, 2) + Math.pow(position.y - spot.y, 2)
        );
        const isNearby = distance < INTERACTIVE_SPOT_DETECTION_RADIUS;

        return (
          <div key={spot.id}>
            <div
              style={{
                position: "absolute",
                left: `${spot.x}%`,
                top: `${spot.y}%`,
                width: `60px`,
                height: `60px`,
                backgroundImage: `url('/Picture/${spot.image}.png')`,
                backgroundSize: "contain",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                zIndex: 90,
                transform: "translate(-50%, -50%)",
                opacity: 1,
              }}
            />
            {isNearby &&
              nearInteractiveSpot &&
              nearInteractiveSpot.id === spot.id && (
                <button
                  className="interactive-spot-button"
                  onClick={() => handleInteractiveSpot(spot)}
                  style={{
                    position: "absolute",
                    left: `${spot.x}%`,
                    top: `${spot.y - 8}%`,
                    transform: "translate(-50%, -50%)",
                    zIndex: 1000,
                    backgroundColor: "rgba(0, 0, 0, 0.8)",
                    color: "white",
                    padding: "8px 15px",
                    borderRadius: "5px",
                    border: "2px solid #aaff00", // Greenish border for interactive spots
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    fontSize: "14px",
                    boxShadow: "0 0 10px rgba(170, 255, 0, 0.3)",
                    transition: "all 0.3s ease",
                  }}
                >
                  Interaksi: {spot.name}
                </button>
              )}
          </div>
        );
      })}

      {/* Dialog Box */}
      {showDialog && (
        <div className="dialog-box">
          <div className="dialog-content">
            {currentDialog.speaker && (
              <div
                className={`dialog-speaker ${
                  currentDialog.speaker === "Player"
                    ? "speaker-player"
                    : "speaker-npc"
                }`}
              >
                <div
                  className="speaker-icon"
                  style={{
                    backgroundImage:
                      currentDialog.speaker === "Player"
                        ? `url('/Picture/${selectedCharacter}-idle.png')`
                        : `url('/Picture/${currentDialog.speaker.toLowerCase()}.png')`,
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
              {/* Fast Forward Button */}
              {isTyping && (
                <button
                  className="fast-forward-btn"
                  onClick={handleFastForward}
                >
                  Fast Forward
                </button>
              )}
            </div>
            <div className={`dialog-options ${showOptions ? "show" : ""}`}>
              {!isTyping &&
                currentDialog.options.map((option, index) => (
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
          if (showDialog) {
            setShowDialog(false);
            setCurrentDialog(null);
          }
          setIsLeaving(true);
          setTimeout(props.onReturn, 1000);
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

      {/* Welcome Messages - Only show temporarily */}
      {showWelcome && (
        <div className="welcome-container">
          <div className="welcome-message">Selamat Datang di Papua</div>
          <div className="mission-text">MISI: Membuat Papeda Papua</div>
          <div className="instruction-text">
            Untuk memulai petualangan memasak Papeda, Anda harus menemui seorang
            kakek yang bernama Merdeka. Beliau adalah seorang ahli dalam
            pembuatan Papeda dan akan memberikan petunjuk tentang bahan-bahan
            yang diperlukan. Ikuti petunjuk Kakek Merdeka dengan baik untuk
            membuat Papeda yang lezat!
          </div>
        </div>
      )}

      {/* Inventory Button */}
      <button
        className="inventory-button"
        onClick={() => setShowInventory(true)}
        style={{
          position: "fixed",
          bottom: "20px",
          left: "20px",
          zIndex: 1000,
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          color: "white",
          padding: "10px 20px",
          borderRadius: "5px",
          border: "2px solid #ffd700",
          cursor: "pointer",
          fontSize: "16px",
          boxShadow: "0 0 10px rgba(255, 215, 0, 0.3)",
          transition: "all 0.3s ease",
        }}
      >
        Inventory
      </button>

      {/* Inventory Modal */}
      {showInventory && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "rgba(0, 0, 0, 0.95)",
            padding: "20px",
            borderRadius: "10px",
            zIndex: 2000,
            minWidth: "300px",
            border: "2px solid #FFD700",
            boxShadow: "0 0 20px rgba(255, 215, 0, 0.3)",
          }}
        >
          <div>
            <h2
              style={{
                color: "#FFD700",
                textAlign: "center",
                marginBottom: "20px",
                fontSize: "24px",
                textShadow: "0 0 10px rgba(255, 215, 0, 0.5)",
              }}
            >
              Inventory
            </h2>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                maxHeight: "400px",
                overflowY: "auto",
                padding: "10px",
              }}
            >
              {props.inventory.length === 0 ? (
                <div
                  style={{
                    color: "#888",
                    textAlign: "center",
                    padding: "20px",
                    fontStyle: "italic",
                  }}
                >
                  Inventory kosong
                </div>
              ) : (
                props.inventory.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px",
                      background: "rgba(255, 255, 255, 0.1)",
                      borderRadius: "8px",
                      border: "1px solid rgba(255, 215, 0, 0.3)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "24px",
                          filter: "drop-shadow(0 0 5px rgba(255, 215, 0, 0.5))",
                        }}
                      >
                        {ingredientEmojis[item.name] || "📦"}
                      </span>
                      <span
                        style={{
                          color: "white",
                          fontSize: "16px",
                          fontWeight: "500",
                        }}
                      >
                        {item.name}
                        {item.quantity > 1 ? ` x${item.quantity}` : ""}
                      </span>
                    </div>
                    {item.name === "Papeda" && (
                      <button
                        onClick={() => {
                          // Update stats
                          props.updateStats({
                            happiness: Math.min(100, props.stats.happiness + 30),
                            hunger: Math.min(100, props.stats.hunger + 40),
                          });
                          // Remove one Papeda from inventory
                          props.addToInventory("Papeda", -1);
                          // Show message
                          setShowDialog(true);
                          setCurrentDialog({
                            text: "Papeda dimakan! Happiness +30, Hunger +40",
                            options: ["OK"],
                            onSelect: () => setShowDialog(false),
                          });
                        }}
                        style={{
                          background: "#4CAF50",
                          color: "white",
                          border: "none",
                          padding: "8px 16px",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontWeight: "bold",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                          transition: "all 0.2s ease",
                        }}
                      >
                        Makan
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
            <button
              onClick={() => setShowInventory(false)}
              style={{
                background: "#FFD700",
                color: "#000",
                border: "none",
                padding: "12px 24px",
                borderRadius: "6px",
                cursor: "pointer",
                marginTop: "20px",
                width: "100%",
                fontWeight: "bold",
                fontSize: "16px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
              }}
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Checklist Bahan Papeda - Dipindahkan dari luar return */}
      <div
        style={{
          position: "fixed",
          top: "10px", // Sesuaikan posisi ke paling atas
          left: "10px",
          background: "rgba(0,0,0,0.85)",
          color: "white",
          borderRadius: 8,
          border: "2px solid #ffd700",
          padding: "12px 18px",
          zIndex: 1200,
          minWidth: 180,
          fontSize: 16,
          fontFamily: "monospace",
          boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
        }}
      >
        <div style={{ fontWeight: "bold", marginBottom: 8 }}>
          Checklist Bahan Papeda:
        </div>
        <div style={{ color: questProgress.hasIkan ? "#00ff00" : "#aaa" }}>
          {questProgress.hasIkan ? "✔" : "✗"} Ikan Segar
        </div>
        <div style={{ color: questProgress.hasSagu ? "#00ff00" : "#aaa" }}>
          {questProgress.hasSagu ? "✔" : "✗"} Tepung Sagu
        </div>
        <div style={{ color: questProgress.hasKuah ? "#00ff00" : "#aaa" }}>
          {questProgress.hasKuah ? "✔" : "✗"} Bumbu
        </div>
      </div>

      {/* Papeda */}
      {showPapeda && papedaCount > 0 && (
        <div
          style={{
            position: "absolute",
            left: `${papedaPosition.x}%`,
            top: `${papedaPosition.y}%`,
            transform: "translate(-50%, -50%)",
            zIndex: 1000,
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "12px",
          }}
          onClick={handleCollectPapeda}
        >
          <img
            src="/Picture/item_papeda.png"
            alt="Papeda"
            style={{
              width: "120px",
              height: "120px",
              objectFit: "contain",
            }}
          />
          <div
            style={{
              background: "rgba(0,0,0,0.8)",
              color: "white",
              padding: "5px 10px",
              borderRadius: "5px",
              fontSize: "14px",
            }}
          >
            Sisa: {papedaCount}
          </div>
          <button
            style={{
              background: "#FFD700",
              color: "#222",
              border: "2px solid #222",
              borderRadius: "8px",
              fontWeight: "bold",
              fontSize: "18px",
              padding: "10px 24px",
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
            }}
          >
            Ambil Papeda
          </button>
        </div>
      )}
    </div>
  );
}

export default Papua;
