import React, { useState, useEffect, useCallback, useRef } from "react";
import "./Town.css";
import { auth } from "../firebase";

function Jakarta({ onReturn, stats, updateStats, inventory, addToInventory }) {
  const [isLeaving, setIsLeaving] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [position, setPosition] = useState({ x: 400, y: 300 });
  const [direction, setDirection] = useState("right");
  const [showClouds, setShowClouds] = useState(true);
  const [nearNPC, setNearNPC] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [currentDialog, setCurrentDialog] = useState([]);
  const [showInventory, setShowInventory] = useState(false);
  const userId = auth.currentUser?.uid;
  const questKey = userId ? `jakartaProgress_${userId}` : "jakartaProgress";
  const [questProgress, setQuestProgress] = useState(() => {
    const saved = localStorage.getItem(questKey);
    return saved ? JSON.parse(saved) : {
      hasStartedQuest: false,
      hasTelur: false,
      hasNasi: false,
      hasBumbu: false,
    };
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
  const [showCookingAnimation, setShowCookingAnimation] = useState(false);
  const [showKerakTelor, setShowKerakTelor] = useState(false);
  const [kerakTelorPosition, setKerakTelorPosition] = useState({
    x: 600,
    y: 400,
  });
  const [cookingProgress, setCookingProgress] = useState(0);
  const [showCongrats, setShowCongrats] = useState(false);
  const [nearSign, setNearSign] = useState(null);
  const [showSignDetails, setShowSignDetails] = useState(false);
  const SIGN_DETECTION_RADIUS = 80;
  const [kerakTelorCount, setKerakTelorCount] = useState(() => {
    const savedCount = localStorage.getItem("kerakTelorCount");
    return savedCount ? parseInt(savedCount, 10) : 3;
  });

  const selectedCharacter =
    localStorage.getItem("selectedCharacter") || "revlog";
  const [characterImage, setCharacterImage] = useState(
    `${selectedCharacter}-idle`
  );

  const typingIntervalRef = useRef(null);

  // Define NPCs for Jakarta with their dialogs
  const npcs = [
    {
      id: 1,
      name: "Merdeka",
      x: 600,
      y: 500,
      image: "npc_merdeka",
      description:
        "Seorang kakek bijaksana yang ahli dalam pembuatan kerak telor.",
      dialogs: {
        initial: [
          "Ah, selamat datang di Jakarta, anak muda! Aku dengar kamu ingin belajar membuat kerak telor. Kerak telor adalah makanan khas Betawi yang sangat berharga bagi kami.",
        ],
        options: [
          "Iya Kek, saya ingin belajar membuat kerak telor!",
          "Mohon bimbingan Kakek untuk membuat kerak telor.",
        ],
        response:
          "Baiklah, dengarkan baik-baik. Untuk membuat kerak telor yang lezat, kamu perlu mengumpulkan bahan-bahan khusus. Pertama-tama, carilah telur segar dari Anosheep di Pasar Baru. Dia punya telur terbaik se-Jakarta. Setelah bertemu dengannya, ikuti petunjuk selanjutnya.",
      },
    },
    {
      id: 2,
      name: "Anosheep",
      x: 800,
      y: 600,
      image: "npc_anosheep",
      description: "Penjual telur dan produk unggas terbaik di Pasar Baru.",
      dialogs: {
        initial: ["Halo, ada yang bisa saya bantu?"],
        withoutQuest:
          "mbee (Maaf, sebaiknya kamu temui Merdeka dulu di pusat kota.)",
        playerGreeting:
          "Halo, saya ingin mencari telur. Apakah kamu memilikinya?",
        anosheepResponse:
          "mbeeee (Ya, saya memiliki beberapa pilihan telur. Mana yang kamu cari?)",
        question:
          "Apa nama monumen ikonik Jakarta yang dibangun pada masa pemerintahan Presiden Soekarno?",
        options: [
          "Monas",
          "Tugu Proklamasi",
          "Patung Dirgantara",
          "Patung Selamat Datang",
        ],
        correct: 0,
        success:
          "MBEEE!!!! (Benar sekali! Monas atau Monumen Nasional adalah ikon Jakarta. Sekarang, telur apa yang kamu inginkan?)",
        wrong:
          "mbe.... (Maaf, jawabanmu kurang tepat. Cobalah pelajari lebih banyak tentang sejarah Jakarta.)",
        eggOptions: ["Telur Bebek", "Telur Ayam"],
        eggSuccess:
          "MBEE!!! (Pilihan yang bagus! {0} adalah pilihan yang baik untuk kerak telor. Untuk bahan selanjutnya, temui Dinozaurus di Pasar Tanah Abang.)",
        eggWrong:
          "Hmm... sepertinya itu bukan telur yang tepat untuk kerak telor. Coba pilih antara telur bebek atau telur ayam?",
      },
    },
    {
      id: 3,
      name: "Dinozaurus",
      x: 1250,
      y: 160,
      image: "npc_dinozaurus",
      description: "Pedagang beras dan bumbu di Pasar Tanah Abang.",
      dialogs: {
        initial: [
          "Selamat datang di Pasar Tanah Abang! Ada yang bisa kubantu?",
        ],
        withoutTelur: "Sebaiknya kamu dapatkan telur dari Anosheep dulu.",
        withTelur:
          "Ah, kamu sudah mendapatkan telur? Bagus! Tapi sebelum memberikan beras dan bumbu, saya ingin menguji pengetahuanmu tentang Jakarta.",
        question:
          "Di Jakarta, ada sebuah kesenian tari tradisional yang sering dipertunjukkan untuk menyambut tamu. Apakah nama tarian tersebut?",
        options: [
          "Tari Jaipong",
          "Tari Saman",
          "Tari Ondel-Ondel",
          "Tari Piring",
        ],
        correct: 2,
        success:
          "Benar sekali! Tari Ondel-Ondel adalah ikon budaya Betawi. Ini beras dan bumbu untuk kerak telormu. Sekarang kamu bisa mencari Bebi untuk mendapatkan tips terakhir.",
        wrong:
          "Maaf, jawabanmu kurang tepat. Mari kita coba pertanyaan lain tentang Jakarta.",
        secondQuestion:
          "Apa nama alat musik tradisional Betawi yang terbuat dari bambu dan dimainkan dengan cara digoyangkan?",
        secondOptions: ["Angklung", "Gamelan", "Gambang Kromong", "Sasando"],
        secondCorrect: 2,
        secondSuccess:
          "Benar! Gambang Kromong adalah ansambel musik Betawi yang unik. Ini beras dan bumbu untuk kerak telormu. Sekarang kamu bisa mencari Bebi untuk mendapatkan tips terakhir.",
        hint: "Alat musik ini sering dimainkan dalam upacara adat Betawi.",
        failMessage:
          "Jangan khawatir, banyak tempat menarik di Jakarta yang bisa kamu pelajari. Kembalilah setelah mempelajari lebih banyak tentang kota ini.",
      },
    },
    {
      id: 4,
      name: "Bebi",
      x: 300,
      y: 300,
      image: "npc_bebi",
      description:
        "Ahli kuliner Betawi yang sudah puluhan tahun membuat kerak telor.",
      dialogs: {
        initial: ["Halo, ada yang bisa saya bantu?"],
        playerGreeting:
          "Halo, saya sedang belajar membuat kerak telor. Apakah kamu bisa memberikan tips?",
        withoutIngredients:
          "Kamu harus mengumpulkan telur, beras, dan bumbu dulu sebelum ke sini.",
        bebiResponse:
          "Ya, saya punya tips rahasia untuk membuat kerak telor yang enak, tapi sebelum itu jawablah pertanyaan ini:",
        question:
          "Apa nama pakaian adat tradisional Betawi yang sering dikenakan oleh kaum perempuan?",
        options: ["Kebaya Encim", "Baju Bodo", "Ulos", "Batik"],
        correct: 0,
        success:
          "Benar sekali! Kebaya Encim adalah pakaian adat Betawi yang indah. Ini tips rahasia saya: tambahkan sedikit terasi dan daun jeruk untuk aroma yang lebih sedap. Sekarang kamu sudah punya semua bahan dan tips untuk membuat kerak telor yang enak!",
        wrong: "Maaf, jawabanmu kurang tepat. Coba lagi ya!",
      },
    },
  ];

  // Define signs for Jakarta with relative coordinates
  const signsRelative = [
    {
      id: 1,
      xPercent: 0, // Relative X coordinate for the fountain (Bundaran HI)
      yPercent: 0.3, // Relative Y coordinate for the fountain (30%)
      name: "Bundaran HI",
      description:
        "Selamat datang di Bundaran Hotel Indonesia, salah satu landmark terkenal di Jakarta.",
      activity: {
        question:
          "Apakah Anda ingin bermain di Bundaran HI dan meningkatkan kebahagiaan?",
        statsEffect: {
          happiness: 20,
          hunger: -5,
        },
      },
    },
    {
      id: 2,
      xPercent: 0, // Relative coordinate Taman Suropati
      yPercent: 0.8, // 70%
      name: "Taman Suropati",
      description: "Taman yang indah, tempat yang tepat untuk bersantai.",
      activity: {
        question: "Bersantai di Taman Suropati untuk memulihkan energi?",
        statsEffect: {
          sleep: 15,
          hygiene: 5,
          hunger: -5,
        },
      },
    },
    {
      id: 3,
      xPercent: 0.9, // Relative coordinate Kota Tua
      yPercent: 0.81,
      name: "Kota Tua",
      description:
        "Kunjungi area bersejarah dengan bangunan-bangunan kolonial.",
      activity: {
        question:
          "Jelajahi Kota Tua dan pelajari sejarah untuk menambah wawasan?",
        statsEffect: {
          happiness: 15,
          hunger: -10,
          sleep: -5,
        },
      },
    },
    {
      id: 4,
      xPercent: 0.9, // Relative coordinate SCBD
      yPercent: 0.32,
      name: "SCBD",
      description:
        "Kawasan pusat bisnis yang ramai dengan gedung-gedung pencakar langit.",
      activity: {
        question: "Cari peluang bisnis di SCBD untuk mendapatkan emas?",
        statsEffect: {
          gold: 100,
          happiness: -5,
          sleep: -10,
          hygiene: -5,
        },
      },
    },
  ];

  // Convert relative sign coordinates to pixel coordinates based on window size
  const signs = signsRelative.map((sign) => ({
    ...sign,
    x: Math.round(sign.xPercent * window.innerWidth),
    y: Math.round(sign.yPercent * window.innerHeight),
  }));

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

  // Check if character is near a sign
  const checkNearSign = (x, y) => {
    for (const sign of signs) {
      const distance = Math.sqrt(
        Math.pow(x - sign.x, 2) + Math.pow(y - sign.y, 2)
      );
      console.log(`Distance to sign ${sign.name}: ${distance}`);
      if (distance < SIGN_DETECTION_RADIUS) {
        console.log(`Near sign ${sign.name}, setting nearSign`);
        setNearSign(sign);
        return;
      }
    }
    console.log("No near sign found, setting nearSign to null");
    setNearSign(null);
  };

  // Effect to check proximity to signs after movement
  useEffect(() => {
    checkNearSign(position.x, position.y);
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
    Telur: "🥚",
    "Telur Bebek": "🥚",
    "Telur Ayam": "🥚",
    Beras: "🌾",
    Bumbu: "🧂",
    "Kerak Telor": "🍞",
  };

  // Function to get item description
  const getItemDescription = useCallback((item) => {
    const descriptions = {
      "Telur Bebek": "Telur bebek segar dari Anosheep",
      "Telur Ayam": "Telur ayam segar dari Anosheep",
      Beras: "Beras untuk nasi dari Dinozaurus",
      Bumbu: "Bumbu tradisional Betawi dari Bebi",
      "Kerak Telor": "Kerak telor yang lezat dan bergizi.",
    };
    return descriptions[item] || "Item tidak dikenal";
  }, []);

  // Add ingredient to inventory
  const handleCollectIngredient = useCallback(
    (ingredient) => {
      setCollectingIngredient(ingredient);
      setLastCollectedItem(ingredient);

      // Panggil addToInventory dari props (dari Game.js)
      addToInventory(ingredient);

      setQuestProgress((prev) => {
        let updatedProgress = { ...prev };
        if (ingredient === "Telur Bebek" || ingredient === "Telur Ayam")
          updatedProgress.hasTelur = true;
        if (ingredient === "Nasi") updatedProgress.hasNasi = true;
        if (ingredient === "Bumbu") updatedProgress.hasBumbu = true;
        return updatedProgress;
      });

      // Show collection animation
      setTimeout(() => {
        setCollectingIngredient(null);
      }, 1000);
    },
    [addToInventory]
  );

  // Function to collect Kerak Telor
  const collectKerakTelor = useCallback(() => {
    if (kerakTelorCount > 0) {
      addToInventory("Kerak Telor"); // Panggil addToInventory dari props
      setKerakTelorCount((prev) => prev - 1);
      setShowKerakTelor(false); // Sembunyikan Kerak Telor setelah dikumpulkan
      setShowCongrats(true); // Tampilkan pesan selamat
      // Update stats if needed, or handle in Game.js useItem
      setTimeout(() => setShowCongrats(false), 3000); // Sembunyikan setelah 3 detik
    } else {
      console.log("Kerak Telor sudah habis.");
    }
  }, [kerakTelorCount, addToInventory]);

  // Function to create a dialog message with speaker
  const createDialogMessage = (text, speaker, icon = null) => ({
    text: String(text || "")
      .replace(/undefined$/, "")
      .trim(), // Ensure text is string, remove trailing 'undefined', and trim whitespace
    speaker,
    icon,
  });

  // Update handleDialog for Dinozaurus
  const handleDialog = (npc) => {
    setShowDialog(true);

    if (npc.name === "Merdeka") {
      setCurrentSpeaker({ name: "Merdeka", type: "npc" });
      if (!questProgress.hasStartedQuest) {
        setCurrentDialog({
          ...createDialogMessage(
            String(npc.dialogs.initial[0] || ""),
            "Merdeka"
          ),
          options: npc.dialogs.options,
          onSelect: (option) => {
            setQuestProgress({ ...questProgress, hasStartedQuest: true });
            setCurrentDialog({
              ...createDialogMessage(
                String(npc.dialogs.response || ""),
                "Merdeka"
              ),
              options: ["Baik, saya akan mencari bahan-bahannya!"],
              onSelect: () => setShowDialog(false),
            });
          },
        });
      } else {
        // Show dialog after quest started
        setCurrentDialog({
          ...createDialogMessage(
            "Selamat datang kembali! Teruskan pencarian bahan untuk kerak telor.",
            "Merdeka"
          ),
          options: ["Terima kasih, Kek!"],
          onSelect: () => setShowDialog(false),
        });
      }
    } else if (npc.name === "Anosheep") {
      if (!questProgress.hasStartedQuest) {
        setCurrentSpeaker({ name: "Anosheep", type: "npc" });
        setCurrentDialog({
          ...createDialogMessage(
            String(npc.dialogs.withoutQuest || ""),
            "Anosheep"
          ),
          options: ["Baik, saya akan menemui Merdeka dulu."],
          onSelect: () => setShowDialog(false),
        });
      } else if (!questProgress.hasTelur) {
        // First show player's greeting
        setCurrentSpeaker({ name: "Player", type: "player" });
        setCurrentDialog({
          ...createDialogMessage(
            String(npc.dialogs.playerGreeting || ""),
            "Player"
          ),
          options: ["..."],
          onSelect: () => {
            // Dialog transisi sebelum quiz
            setCurrentSpeaker({ name: "Anosheep", type: "npc" });
            setCurrentDialog({
              ...createDialogMessage(
                "mbee (Sebelum kamu mendapatkan telur, jawab dulu pertanyaan dari saya!)",
                "Anosheep"
              ),
              options: ["Siap, silakan tanya!"],
              onSelect: () => {
                // Langsung ke pertanyaan quiz (tanpa dialog pilihan telur)
                setCurrentDialog({
                  ...createDialogMessage(
                    String(npc.dialogs.question || ""),
                    "Anosheep"
                  ),
                  options: npc.dialogs.options,
                  onSelect: (optionIndex) => {
                    if (optionIndex === npc.dialogs.correct) {
                      // Jika benar, baru muncul pilihan telur
                      setCurrentDialog({
                        ...createDialogMessage(
                          String(npc.dialogs.success || "") +
                            "\n\nPilih telur yang kamu inginkan:",
                          "Anosheep"
                        ),
                        options: npc.dialogs.eggOptions,
                        onSelect: (eggOptionIndex) => {
                          setQuestProgress({
                            ...questProgress,
                            hasTelur: true,
                          });
                          const eggType =
                            eggOptionIndex === 0 ? "Telur Bebek" : "Telur Ayam";
                          handleCollectIngredient(eggType);
                          setCurrentDialog({
                            ...createDialogMessage(
                              String(npc.dialogs.eggSuccess || "").replace(
                                "{0}",
                                eggType
                              ),
                              "Anosheep"
                            ),
                            options: [
                              "Terima kasih! Saya akan mencari bahan lainnya.",
                            ],
                            onSelect: () => setShowDialog(false),
                          });
                        },
                      });
                    } else {
                      // Jika salah
                      setCurrentDialog({
                        ...createDialogMessage(
                          String(npc.dialogs.wrong || ""),
                          "Anosheep"
                        ),
                        options: [
                          "Baik, saya akan belajar dulu dan kembali lagi.",
                        ],
                        onSelect: () => setShowDialog(false),
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
          text: "mbee (Kamu sudah mendapatkan telur dariku. Sekarang carilah bahan lainnya dari Dinozaurus.)",
          options: ["Baik, terima kasih!"],
          onSelect: () => setShowDialog(false),
        });
      }
    } else if (npc.name === "Dinozaurus") {
      if (!questProgress.hasTelur) {
        setCurrentDialog({
          ...createDialogMessage(
            String(npc.dialogs.withoutTelur || ""),
            "Dinozaurus"
          ),
          options: ["Baik, saya akan mencari telur dulu."],
          onSelect: () => setShowDialog(false),
        });
      } else if (!questProgress.hasNasi) {
        setCurrentDialog({
          ...createDialogMessage(
            String(npc.dialogs.withTelur || ""),
            "Dinozaurus"
          ),
          options: ["Saya siap menjawab pertanyaannya!"],
          onSelect: () => {
            // First question
            setCurrentDialog({
              ...createDialogMessage(
                String(npc.dialogs.question || ""),
                "Dinozaurus"
              ),
              options: npc.dialogs.options,
              onSelect: (optionIndex) => {
                if (optionIndex === npc.dialogs.correct) {
                  setQuestProgress({ ...questProgress, hasNasi: true });
                  // Add beras to inventory with animation from Dinozaurus' position
                  const npcPos = npcs.find((n) => n.name === "Dinozaurus");
                  handleCollectIngredient("Beras");
                  setTimeout(() => {
                    setCollectingIngredient(null);
                  }, 1000);

                  setCurrentDialog({
                    ...createDialogMessage(
                      String(npc.dialogs.success || ""),
                      "Dinozaurus"
                    ),
                    options: [
                      "Terima kasih! Saya akan mencari Bebi untuk mendapatkan bumbu.",
                    ],
                    onSelect: () => setShowDialog(false),
                  });
                } else {
                  // If wrong, give hint and second chance
                  setCurrentDialog({
                    ...createDialogMessage(
                      String(npc.dialogs.wrong || "") +
                        " " +
                        String(npc.dialogs.hint || ""),
                      "Dinozaurus"
                    ),
                    options: [
                      "Maaf, saya akan mencoba lagi dengan pertanyaan berikutnya.",
                    ],
                    onSelect: () => {
                      setCurrentDialog({
                        ...createDialogMessage(
                          String(npc.dialogs.secondQuestion || ""),
                          "Dinozaurus"
                        ),
                        options: npc.dialogs.secondOptions,
                        onSelect: (secondOptionIndex) => {
                          if (secondOptionIndex === npc.dialogs.secondCorrect) {
                            setQuestProgress({
                              ...questProgress,
                              hasNasi: true,
                            });
                            // Add beras to inventory with animation from Dinozaurus' position
                            const npcPos = npcs.find(
                              (n) => n.name === "Dinozaurus"
                            );
                            handleCollectIngredient("Beras");
                            setTimeout(() => {
                              setCollectingIngredient(null);
                            }, 1000);

                            setCurrentDialog({
                              ...createDialogMessage(
                                String(npc.dialogs.secondSuccess || ""),
                                "Dinozaurus"
                              ),
                              options: [
                                "Terima kasih! Saya akan mencari Bebi untuk mendapatkan bumbu.",
                              ],
                              onSelect: () => setShowDialog(false),
                            });
                          } else {
                            setCurrentDialog({
                              ...createDialogMessage(
                                String(npc.dialogs.failMessage || ""),
                                "Dinozaurus"
                              ),
                              options: [
                                "Baik, saya akan belajar dulu dan kembali lagi.",
                              ],
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
          text: "Kamu sudah mendapatkan beras dariku. Sekarang carilah Bebi untuk mendapatkan bumbu.",
          options: ["Baik, terima kasih!"],
          onSelect: () => setShowDialog(false),
        });
      }
    } else if (npc.name === "Bebi") {
      if (!questProgress.hasTelur || !questProgress.hasNasi) {
        // First show player's greeting
        setCurrentSpeaker({ name: "Player", type: "player" });
        setCurrentDialog({
          ...createDialogMessage(
            String(npc.dialogs.playerGreeting || ""),
            "Player"
          ),
          options: ["..."],
          onSelect: () => {
            setCurrentSpeaker({ name: "Bebi", type: "npc" });
            setCurrentDialog({
              ...createDialogMessage(
                String(npc.dialogs.withoutIngredients || ""),
                "Bebi"
              ),
              options: ["Baik, saya akan mengumpulkan bahan-bahan dulu."],
              onSelect: () => setShowDialog(false),
            });
          },
        });
      } else if (!questProgress.hasBumbu) {
        // Show player's greeting first
        setCurrentSpeaker({ name: "Player", type: "player" });
        setCurrentDialog({
          ...createDialogMessage(
            String(npc.dialogs.playerGreeting || ""),
            "Player"
          ),
          options: ["..."],
          onSelect: () => {
            // Then show Bebi's response and question
            setCurrentSpeaker({ name: "Bebi", type: "npc" });
            setCurrentDialog({
              ...createDialogMessage(
                String(npc.dialogs.bebiResponse || "") +
                  "\n\n" +
                  String(npc.dialogs.question || ""),
                "Bebi"
              ),
              options: npc.dialogs.options,
              onSelect: (optionIndex) => {
                if (optionIndex === npc.dialogs.correct) {
                  setQuestProgress({ ...questProgress, hasBumbu: true });
                  // Add bumbu to inventory with animation from Bebi's position
                  const npcPos = npcs.find((n) => n.name === "Bebi");
                  handleCollectIngredient("Bumbu");
                  setTimeout(() => {
                    setCollectingIngredient(null);
                    setCurrentDialog({
                      ...createDialogMessage(
                        String(npc.dialogs.success || ""),
                        "Bebi"
                      ),
                      options: [
                        "Terima kasih! Saatnya membuat kerak telor yang enak!",
                      ],
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
                              setShowKerakTelor(true);
                            }
                          }, 50);
                        }, 3000);
                      },
                    });
                  }, 1000);
                } else {
                  setCurrentDialog({
                    ...createDialogMessage(
                      String(npc.dialogs.wrong || ""),
                      "Bebi"
                    ),
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
      } else {
        setCurrentDialog({
          text: "Kamu sudah mendapatkan bumbu dariku. Sekarang kamu bisa membuat kerak telor yang lezat!",
          options: ["Terima kasih!"],
          onSelect: () => setShowDialog(false),
        });
      }
    }
  };

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
    if (currentDialog.text && showDialog) {
      typeText(currentDialog.text);
    }
  }, [currentDialog.text, showDialog, typeText]);

  // Add stat decrease over time
  useEffect(() => {
    const statInterval = setInterval(() => {
      updateStats((prevStats) => ({
        ...prevStats,
        happiness: Math.max(0, prevStats.happiness - 0.1),
        hunger: Math.max(0, prevStats.hunger - 0.2),
        hygiene: Math.max(0, prevStats.hygiene - 0.1),
        sleep: Math.max(0, prevStats.sleep - 0.15),
      }));
    }, 1000);

    return () => clearInterval(statInterval);
  }, [updateStats]);

  // Effect to show Kerak Telor if all ingredients are collected
  useEffect(() => {
    const allIngredientsCollected =
      (inventory.includes("Telur Bebek") || inventory.includes("Telur Ayam")) &&
      inventory.includes("Nasi") &&
      inventory.includes("Bumbu");

    if (allIngredientsCollected) {
      if (kerakTelorCount > 0) {
        setShowKerakTelor(true);
        setKerakTelorPosition({ x: 600, y: 400 });
      } else {
        setShowKerakTelor(false);
      }
    }
  }, [inventory, kerakTelorCount]);

  // Save progress to localStorage
  useEffect(() => {
    if (userId) {
      localStorage.setItem(questKey, JSON.stringify(questProgress));
    }
  }, [questProgress, userId]);

  const handleSignInteraction = () => {
    if (nearSign) {
      setShowSignDetails(true);
    }
  };

  const closeSignDetails = () => {
    setShowSignDetails(false);
  };

  const handleActivity = (activity) => {
    console.log("handleActivity called with activity:", activity);
    if (activity.statsEffect) {
      // Get current stats from props
      const newStats = { ...stats };
      Object.entries(activity.statsEffect).forEach(([stat, value]) => {
        if (stat === "gold") {
          newStats[stat] = (newStats[stat] || 0) + value;
        } else {
          newStats[stat] = Math.max(0, Math.min(100, newStats[stat] + value));
        }
      });
      console.log("Updating stats to:", newStats);
      updateStats(newStats);
    }
    closeSignDetails();
  };

  // Load ulang inventory & progress dari localStorage setiap kali window focus (masuk ke map Jakarta)
  useEffect(() => {
    function reloadFromStorage() {
      // Inventory di Game.js
      // const savedInventory = localStorage.getItem("jakartaInventory");
      // if (savedInventory) setInventory(JSON.parse(savedInventory));
      const savedProgress = localStorage.getItem(questKey);
      if (savedProgress) setQuestProgress(JSON.parse(savedProgress));
    }
    reloadFromStorage();
    window.addEventListener("focus", reloadFromStorage);
    return () => window.removeEventListener("focus", reloadFromStorage);
  }, []);

  // Simpan inventory ke localStorage setiap kali berubah
  // useEffect(() => {
  //   localStorage.setItem("jakartaInventory", JSON.stringify(inventory));
  // }, [inventory]);

  // Simpan progress ke localStorage setiap kali berubah
  // useEffect(() => {
  //   localStorage.setItem("jakartaProgress", JSON.stringify(questProgress));
  // }, [questProgress]);

  // Simpan stats ke localStorage setiap kali berubah (hanya ke gameStats)
  // useEffect(() => {
  //   localStorage.setItem("gameStats", JSON.stringify(stats));
  // }, [stats]);

  // Load ulang stats dari localStorage setiap kali window focus (masuk ke map Jakarta)
  useEffect(() => {
    function reloadStats() {
      // Stats di Game.js
      // const saved = localStorage.getItem("gameStats");
      // if (saved) setStats(JSON.parse(saved));
    }
    reloadStats();
    window.addEventListener("focus", reloadStats);
    return () => window.removeEventListener("focus", reloadStats);
  }, []);

  // Sinkronisasi stat bar dengan localStorage gameStats setiap 200ms
  useEffect(() => {
    const interval = setInterval(() => {
      // Stats di Game.js
      // const saved = localStorage.getItem("gameStats");
      // if (saved) setStats(JSON.parse(saved));
    }, 200); // 0.2 detik
    return () => clearInterval(interval);
  }, []);

  // Tambahkan state untuk deteksi dekat kerak telor
  const [nearKerakTelor, setNearKerakTelor] = useState(false);

  // Deteksi proximity ke kerak telor collectible
  useEffect(() => {
    if (showKerakTelor) {
      const dx = position.x - kerakTelorPosition.x;
      const dy = position.y - kerakTelorPosition.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      setNearKerakTelor(distance < 100); // radius 100px
    } else {
      setNearKerakTelor(false);
    }
  }, [position, showKerakTelor, kerakTelorPosition]);

  useEffect(() => {
    localStorage.setItem("kerakTelorCount", kerakTelorCount.toString());
  }, [kerakTelorCount]);

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
              <div className="stat-percentage">
                {Math.round(stats.happiness)}%
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
                width: `${stats.hunger}%`,
                imageRendering: "pixelated",
                border: "1.5px solid #222",
              }}
            >
              <div className="stat-percentage">{Math.round(stats.hunger)}%</div>
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
              <div className="stat-percentage">{Math.round(stats.sleep)}%</div>
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
              <div className="stat-percentage">
                {Math.round(stats.hygiene)}%
              </div>
            </div>
          </div>
        </div>
        <div className="stat-item gold-item">
          <span>Gold:</span>
          <span className="gold-amount">{stats.gold || 0}</span>
        </div>
      </div>

      {/* Map with transition effects */}
      <div
        className={`town-map-container ${isLeaving ? "leaving" : ""}`}
        style={{
          backgroundImage: "url('/Picture/Jakarta.jpg')",
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
      {/* Debug Display for Character and Signs */}
      <div
        style={{
          position: "fixed",
          top: "10px",
          left: "10px",
          padding: "6px 12px",
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          color: "white",
          fontSize: "12px",
          borderRadius: "6px",
          zIndex: 1000,
          fontFamily: "monospace",
          userSelect: "none",
          maxHeight: "200px",
          overflowY: "auto",
          width: "250px",
        }}
      >
        <div>
          <strong>Character Position:</strong> X: {position.x}px, Y: {position.y}px
        </div>
        <div style={{ marginTop: "8px" }}>
          <strong>Signs:</strong>
          <ul style={{ paddingLeft: "20px", margin: 0 }}>
            {signs.map((sign) => (
              <li key={sign.id}>
                {sign.name}: X: {sign.x}px, Y: {sign.y}px
              </li>
            ))}
          </ul>
        </div>
      </div>
      {/* Coordinate Display */}
      <div
        style={{
          position: "fixed",
          bottom: "10px",
          left: "10px",
          padding: "6px 12px",
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          color: "white",
          fontSize: "14px",
          borderRadius: "6px",
          zIndex: 1000,
          fontFamily: "monospace",
          userSelect: "none",
        }}
      >
        X: {Math.round((position.x / window.innerWidth) * 100)}%, Y: {Math.round((position.y / window.innerHeight) * 100)}%
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
                  left: `${npc.x + CHARACTER_SIZE / 2}px`,
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
          <div className="welcome-message">Selamat Datang di Jakarta</div>

          <div className="mission-text">MISI: Membuat Kerak Telor Betawi</div>

          <div className="instruction-text">
            Untuk memulai petualangan memasak kerak telor, Anda harus menemui
            Merdeka. Beliau adalah seorang kakek bijaksana yang ahli dalam
            pembuatan kerak telor dan akan memberikan petunjuk tentang
            bahan-bahan yang diperlukan. Ikuti petunjuk Merdeka dengan baik
            untuk membuat kerak telor yang lezat!
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
                        : `url('/Picture/npc_${currentDialog.speaker.toLowerCase()}.png')`,
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

      {/* Quest Progress Display */}
      <div className="quest-progress">
        <h3>Bahan Kerak Telor:</h3>
        <ul>
          <li className={questProgress.hasTelur ? "collected" : ""}>
            <span>Telur</span>
            <span>{questProgress.hasTelur ? "✓" : "×"}</span>
          </li>
          <li className={questProgress.hasNasi ? "collected" : ""}>
            <span>Beras</span>
            <span>{questProgress.hasNasi ? "✓" : "×"}</span>
          </li>
          <li className={questProgress.hasBumbu ? "collected" : ""}>
            <span>Bumbu</span>
            <span>{questProgress.hasBumbu ? "✓" : "×"}</span>
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
              left: `${position.x}px`,
              top: `${position.y}px`,
            }}
          >
            {ingredientEmojis[collectingIngredient]}
          </div>
          <div
            className="ingredient-flash"
            style={{
              left: `${position.x - 50}px`,
              top: `${position.y - 50}px`,
            }}
          />
        </>
      )}

      {/* Inventory Modal with Animation */}
      {showInventory && (
        <div className="inventory-modal">
          <div className="inventory-content">
            <h2>Inventory Bahan Kerak Telor</h2>
            <div className="inventory-items">
              {inventory.length === 0 ? (
                <p>Belum ada bahan yang dikumpulkan.</p>
              ) : (
                inventory.map((item, index) => (
                  <div
                    key={index}
                    className={`inventory-item ${
                      item.name === lastCollectedItem
                        ? "inventory-item-new"
                        : ""
                    }`}
                  >
                    <div>
                      <h3>
                        {ingredientEmojis[item.name]} {item.name}{" "}
                        {item.quantity ? `x${item.quantity}` : ""}
                      </h3>
                      <p>{getItemDescription(item.name)}</p>
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
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            padding: "20px",
            borderRadius: "10px",
            border: "2px solid #ffd700",
            zIndex: 1000,
            textAlign: "center",
            color: "#fff",
            maxWidth: "400px",
          }}
        >
          <div
            style={{ fontSize: "24px", marginBottom: "15px", color: "#ffd700" }}
          >
            🎉 Selamat! 🎉
          </div>
          <div style={{ fontSize: "16px", lineHeight: "1.5" }}>
            Kamu telah menyelesaikan misi untuk mencari bahan pembuatan kerak
            telor.
            <br />
            <br />
            Kerak telor akan dibuat untuk dikonsumsi.
          </div>
        </div>
      )}

      {/* Cooking Animation */}
      {showCookingAnimation && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            padding: "20px",
            borderRadius: "10px",
            border: "2px solid #ffd700",
            zIndex: 1000,
            textAlign: "center",
          }}
        >
          <div
            style={{ color: "#fff", marginBottom: "10px", fontSize: "18px" }}
          >
            Membuat Kerak Telor...
          </div>
          <div
            style={{
              width: "300px",
              height: "20px",
              backgroundColor: "#333",
              borderRadius: "10px",
              overflow: "hidden",
              border: "1px solid #666",
            }}
          >
            <div
              style={{
                width: `${cookingProgress}%`,
                height: "100%",
                backgroundColor: "#ffd700",
                transition: "width 0.3s ease",
              }}
            />
          </div>
          <div style={{ marginTop: "10px", fontSize: "24px" }}>
            🥚 + 🍚 + 🧂 = 🥘
          </div>
        </div>
      )}

      {/* Kerak Telor */}
      {showKerakTelor && kerakTelorCount > 0 && (
        <img
          src="/Picture/keraktelor.png"
          alt="Kerak Telor"
          onClick={collectKerakTelor}
          style={{
            position: "absolute",
            left: `${kerakTelorPosition.x}px`,
            top: `${kerakTelorPosition.y}px`,
            width: "100px",
            height: "100px",
            cursor: "pointer",
          }}
        />
      )}

      {/* Sign Interaction Button */}
      {nearSign && !showSignDetails && (
        <button
          className="check-out-button"
          onClick={handleSignInteraction}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 1000,
          }}
        >
          Check Out {nearSign.name}
        </button>
      )}

      {/* Sign Details Modal */}
      {showSignDetails && nearSign && (
        <div className="sign-details-modal">
          <div className="sign-details-content">
            <h2>{nearSign.name}</h2>
            <p>{nearSign.description}</p>
            {nearSign.activity && (
              <div className="activity-section">
                <p className="activity-question">
                  {nearSign.activity.question}
                </p>
                <div className="activity-buttons">
                  <button
                    className="activity-button yes"
                    onClick={() => handleActivity(nearSign.activity)}
                  >
                    Ya
                  </button>
                  <button
                    className="activity-button no"
                    onClick={closeSignDetails}
                  >
                    Tidak
                  </button>
                </div>
              </div>
            )}
            <button className="close-button" onClick={closeSignDetails}>
              Tutup
            </button>
          </div>
        </div>
      )}

      <style>
        {`
          @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0px); }
          }

          .kerak-telor-glow {
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

          .kerak-telor-glow::before,
          .kerak-telor-glow::after {
            content: '';
            position: absolute;
            width: 100%;
            height: 100%;
            background: inherit;
            animation: rotate 4s linear infinite;
          }

          .kerak-telor-glow::after {
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

          div.dialog-text-container .fast-forward-btn {
            margin-top: 10px;
            background: #ffd700;
            color: #222;
            border: 2px solid #222;
            border-radius: 6px;
            padding: 4px 16px;
            font-weight: bold;
            cursor: pointer;
            font-size: 14px;
            transition: background 0.2s;
          }

          div.dialog-text-container .fast-forward-btn:hover {
            background: #ffe066;
          }
        `}
      </style>
    </div>
  );
}

export default Jakarta;
