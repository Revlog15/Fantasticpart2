import React, { useState, useEffect, useRef } from "react";
import "../styles/Game.css";

function Home({ onReturn, stats, updateStats, work, eat, sleep }) {
  const CHARACTER_SIZE = 200;
  const selectedCharacter =
    localStorage.getItem("selectedCharacter") || "revlog";
  const playerName = localStorage.getItem("playerName") || "Player";

  const [position, setPosition] = useState({ x: 10, y: 50 });
  const [characterImage, setCharacterImage] = useState(
    `${selectedCharacter}-idle`
  );
  const [inventory, setInventory] = useState([]);
  const [showInventory, setShowInventory] = useState(false);
  const [showWorkEatButtons, setShowWorkEatButtons] = useState(false);
  const [showSleepButton, setShowSleepButton] = useState(false);
  const [showHygieneButton, setShowHygieneButton] = useState(false);
  const [showGoOutsideButton, setShowGoOutsideButton] = useState(false);

  // Sleep animation state
  const [showSleepAnimation, setShowSleepAnimation] = useState(false);
  const [sleepProgress, setSleepProgress] = useState(0); // 0 to 1
  const [sleepStartStats, setSleepStartStats] = useState(null);
  const sleepDuration = 7000; // 7 seconds
  const sleepIncrease = 30; // Amount sleep stat increases

  // Eating animation state
  const [showEatAnimation, setShowEatAnimation] = useState(false);
  const [eatProgress, setEatProgress] = useState(0); // 0 to 1
  const [eatStartStats, setEatStartStats] = useState(null);
  const eatDuration = 5000; // 5 seconds
  const eatIncrease = 20; // Amount hunger stat increases

  // Work animation state
  const [showWorkAnimation, setShowWorkAnimation] = useState(false);
  const [workProgress, setWorkProgress] = useState(0); // 0 to 1
  const [workStartStats, setWorkStartStats] = useState(null);
  const workDuration = 7000; // 7 seconds
  const workGoldIncrease = 70; // Amount gold increases
  const workHappinessDecrease = 5; // Amount happiness decreases
  const workHungerDecrease = 10; // Amount hunger decreases
  const workSleepDecrease = 5; // Amount sleep decreases
  const workHygieneDecrease = 5; // Amount hygiene decreases

  // Shower animation state
  const [showShowerAnimation, setShowShowerAnimation] = useState(false);
  const [showerProgress, setShowerProgress] = useState(0); // 0 to 1
  const [showerStartStats, setShowerStartStats] = useState(null);
  const showerDuration = 7000; // 7 seconds

  // Animation frame refs for robust cancellation
  const workAnimationFrame = useRef();
  const eatAnimationFrame = useRef();
  const sleepAnimationFrame = useRef();
  const showerAnimationFrame = useRef();

  // FIX: Define a cleanUp function that uses the passed updateStats prop
  const cleanUp = () => {
    if (updateStats) {
      updateStats({ hygiene: 100 });
    }
  };

  // Simple movement function
  const moveCharacter = (direction) => {
    const step = 1;
    let newX = position.x;
    let newY = position.y;

    switch (direction) {
      case "left":
        newX = Math.max(position.x - step, 0);
        setCharacterImage(`${selectedCharacter}-left`);
        break;
      case "right":
        newX = Math.min(position.x + step, 100);
        setCharacterImage(`${selectedCharacter}-right`);
        break;
      case "up":
        newY = Math.max(position.y - step, 0);
        setCharacterImage(`${selectedCharacter}-left`);
        break;
      case "down":
        newY = Math.min(position.y + step, 100);
        setCharacterImage(`${selectedCharacter}-right`);
        break;
      default:
        return;
    }

    setPosition({ x: newX, y: newY });
  };

  // Sleep animation handler
  const handleSleep = () => {
    if (sleepAnimationFrame.current) {
      cancelAnimationFrame(sleepAnimationFrame.current);
    }
    setSleepProgress(0);
    setShowSleepAnimation(false);
    setTimeout(() => {
      setSleepStartStats({ ...stats });
      setShowSleepAnimation(true);
      const start = Date.now();
      const animate = () => {
        const elapsed = Date.now() - start;
        const progress = Math.min(elapsed / sleepDuration, 1);
        setSleepProgress(progress);
        if (progress < 1) {
          sleepAnimationFrame.current = requestAnimationFrame(animate);
        } else {
          setShowSleepAnimation(false);
          setSleepProgress(0);
          sleep();
        }
      };
      sleepAnimationFrame.current = requestAnimationFrame(animate);
    }, 10);
  };
  const fastForwardSleep = () => {
    if (sleepAnimationFrame.current) {
      cancelAnimationFrame(sleepAnimationFrame.current);
    }
    setSleepProgress(1);
    setShowSleepAnimation(false);
    setTimeout(() => {
      sleep();
      setSleepProgress(0);
    }, 0);
  };

  // Eating animation handler
  const handleEat = () => {
    if (eatAnimationFrame.current) {
      cancelAnimationFrame(eatAnimationFrame.current);
    }
    setEatProgress(0);
    setShowEatAnimation(false);
    if (stats.gold >= 5) {
      setTimeout(() => {
        setEatStartStats({ ...stats });
        setShowEatAnimation(true);
        const start = Date.now();
        const animate = () => {
          const elapsed = Date.now() - start;
          const progress = Math.min(elapsed / eatDuration, 1);
          setEatProgress(progress);
          if (progress < 1) {
            eatAnimationFrame.current = requestAnimationFrame(animate);
          } else {
            setShowEatAnimation(false);
            setEatProgress(0);
            eat();
          }
        };
        eatAnimationFrame.current = requestAnimationFrame(animate);
      }, 10);
    } else {
      console.log("Not enough gold to eat!");
    }
  };
  const fastForwardEat = () => {
    if (eatAnimationFrame.current) {
      cancelAnimationFrame(eatAnimationFrame.current);
    }
    setEatProgress(1);
    setShowEatAnimation(false);
    setTimeout(() => {
      eat();
      setEatProgress(0);
    }, 0);
  };

  // Shower animation handler
  const handleShower = () => {
    if (showerAnimationFrame.current) {
      cancelAnimationFrame(showerAnimationFrame.current);
    }
    setShowerProgress(0);
    setShowShowerAnimation(false);
    setTimeout(() => {
      setShowerStartStats({ ...stats });
      setShowShowerAnimation(true);
      const start = Date.now();
      const animate = () => {
        const elapsed = Date.now() - start;
        const progress = Math.min(elapsed / showerDuration, 1);
        setShowerProgress(progress);
        if (progress < 1) {
          showerAnimationFrame.current = requestAnimationFrame(animate);
        } else {
          setShowShowerAnimation(false);
          setShowerProgress(0);
          // FIX: Call the new cleanUp function
          cleanUp();
        }
      };
      showerAnimationFrame.current = requestAnimationFrame(animate);
    }, 10);
  };
  const fastForwardShower = () => {
    if (showerAnimationFrame.current) {
      cancelAnimationFrame(showerAnimationFrame.current);
    }
    setShowerProgress(1);
    setShowShowerAnimation(false);
    setTimeout(() => {
      // FIX: Call the new cleanUp function
      cleanUp();
      setShowerProgress(0);
    }, 0);
  };

  // Work animation handler
  const handleWork = () => {
    if (workAnimationFrame.current) {
      cancelAnimationFrame(workAnimationFrame.current);
    }
    setWorkProgress(0);
    setShowWorkAnimation(false);
    setTimeout(() => {
      setWorkStartStats({ ...stats });
      setShowWorkAnimation(true);
      const start = Date.now();
      const animate = () => {
        const elapsed = Date.now() - start;
        const progress = Math.min(elapsed / workDuration, 1);
        setWorkProgress(progress);
        if (progress < 1) {
          workAnimationFrame.current = requestAnimationFrame(animate);
        } else {
          setShowWorkAnimation(false);
          setWorkProgress(0);
          work();
        }
      };
      workAnimationFrame.current = requestAnimationFrame(animate);
    }, 10);
  };
  const fastForwardWork = () => {
    if (workAnimationFrame.current) {
      cancelAnimationFrame(workAnimationFrame.current);
    }
    setWorkProgress(1);
    setShowWorkAnimation(false);
    setTimeout(() => {
      work();
      setWorkProgress(0);
    }, 0);
  };

  // Animated stat calculation for sleep
  const getAnimatedStat = (statName) => {
    if (!showSleepAnimation || !sleepStartStats) return stats[statName];
    if (statName === "sleep") {
      // Animate sleep stat rising
      const start = sleepStartStats.sleep;
      const end = Math.min(start + sleepIncrease, 100);
      return Math.round(start + (end - start) * sleepProgress);
    }
    // Other stats can be animated similarly if desired
    return stats[statName];
  };

  // Animated stat calculation for shower
  const getAnimatedHygiene = () => {
    if (!showShowerAnimation || !showerStartStats) return stats.hygiene;
    const start = showerStartStats.hygiene;
    const end = 100;
    return Math.round(start + (end - start) * showerProgress);
  };

  // Animated stat calculation for eating
  const getAnimatedEatStat = (statName) => {
    if (!showEatAnimation || !eatStartStats) return stats[statName];
    if (statName === "hunger") {
      // Animate hunger stat rising
      const start = eatStartStats.hunger;
      const end = Math.min(start + eatIncrease, 100);
      return Math.round(start + (end - start) * eatProgress);
    }
    return stats[statName];
  };

  // Animated stat calculation for work
  const getAnimatedWorkStat = (statName) => {
    if (!showWorkAnimation || !workStartStats) return stats[statName];
    const start = workStartStats[statName];
    let end = start;

    switch (statName) {
      case "gold":
        end = start + workGoldIncrease;
        break;
      case "happiness":
        end = Math.max(start - workHappinessDecrease, 0);
        break;
      case "hunger":
        end = Math.max(start - workHungerDecrease, 0);
        break;
      case "sleep":
        end = Math.max(start - workSleepDecrease, 0);
        break;
      case "hygiene":
        end = Math.max(start - workHygieneDecrease, 0);
        break;
      default:
        return stats[statName];
    }

    return Math.round(start + (end - start) * workProgress);
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
    const ACTION_RADIUS = 15;
    const WORK_EAT_COORDS = { x: 10, y: 40 };
    const SLEEP_COORDS = { x: 80, y: 70 };
    const HYGIENE_COORDS = { x: 30, y: 80 };
    const GO_OUTSIDE_COORDS = { x: 90, y: 30 };

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

      {/* Sleep Animation Overlay */}
      {showSleepAnimation && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            flexDirection: "column",
          }}
        >
          <img
            src="Picture/Sleep.gif"
            alt="Sleeping..."
            style={{ width: 220, height: 220, marginBottom: 24 }}
          />
          <div
            style={{
              color: "#fff",
              fontSize: 32,
              fontWeight: "bold",
              marginBottom: 12,
            }}
          >
            Sleeping...
          </div>
          <div style={{ width: 300, margin: "0 auto" }}>
            <div style={{ color: "#fff", marginBottom: 8 }}>Sleep</div>
            <div
              style={{
                background: "#222",
                borderRadius: 8,
                height: 24,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${getAnimatedStat("sleep")}%`,
                  height: 24,
                  background: "linear-gradient(90deg, #2266ff, #88ccff)",
                  transition: "width 0.2s linear",
                }}
              />
            </div>
            <div style={{ color: "#fff", marginTop: 4, textAlign: "right" }}>
              {getAnimatedStat("sleep")}%
            </div>
          </div>
          <button
            onClick={fastForwardSleep}
            style={{
              marginTop: 24,
              padding: "8px 24px",
              fontSize: 18,
              borderRadius: 8,
              background: "#2196f3",
              color: "#fff",
              fontWeight: "bold",
              border: "none",
              cursor: "pointer",
            }}
          >
            Fast Forward
          </button>
        </div>
      )}

      {/* Eating Animation Overlay */}
      {showEatAnimation && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            flexDirection: "column",
          }}
        >
          <img
            src="Picture/Eat.gif"
            alt="Eating..."
            style={{ width: 220, height: 220, marginBottom: 24 }}
          />
          <div
            style={{
              color: "#fff",
              fontSize: 32,
              fontWeight: "bold",
              marginBottom: 12,
            }}
          >
            Eating...
          </div>
          <div style={{ color: "#fff", fontSize: 20, marginBottom: 8 }}>
            Hunger
          </div>
          <div
            style={{
              width: 400,
              height: 24,
              background: "#222",
              borderRadius: 12,
              overflow: "hidden",
              marginBottom: 8,
              boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
            }}
          >
            <div
              style={{
                width: `${Math.min(
                  (getAnimatedEatStat("hunger") / 100) * 100,
                  100
                )}%`,
                height: "100%",
                background: "#ff6b6b",
                transition: "width 0.2s linear",
              }}
            ></div>
          </div>
          <div style={{ color: "#fff", fontSize: 20 }}>
            {getAnimatedEatStat("hunger")}%
          </div>
          <button
            onClick={fastForwardEat}
            style={{
              marginTop: 24,
              padding: "8px 24px",
              fontSize: 18,
              borderRadius: 8,
              background: "#ff6b6b",
              color: "#fff",
              fontWeight: "bold",
              border: "none",
              cursor: "pointer",
            }}
          >
            Fast Forward
          </button>
        </div>
      )}

      {/* Shower Animation Overlay */}
      {showShowerAnimation && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            flexDirection: "column",
          }}
        >
          <img
            src="Picture/Shower.gif"
            alt="Showering..."
            style={{ width: 220, height: 220, marginBottom: 24 }}
          />
          <div
            style={{
              color: "#fff",
              fontSize: 32,
              fontWeight: "bold",
              marginBottom: 12,
            }}
          >
            Showering...
          </div>
          <div style={{ width: 300, margin: "0 auto" }}>
            <div style={{ color: "#fff", marginBottom: 8 }}>Hygiene</div>
            <div
              style={{
                background: "#222",
                borderRadius: 8,
                height: 24,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${getAnimatedHygiene()}%`,
                  height: 24,
                  background: "linear-gradient(90deg, #88ccff, #ffffff)",
                  transition: "width 0.2s linear",
                }}
              />
            </div>
            <div style={{ color: "#fff", marginTop: 4, textAlign: "right" }}>
              {getAnimatedHygiene()}%
            </div>
          </div>
          <button
            onClick={fastForwardShower}
            style={{
              marginTop: 24,
              padding: "8px 24px",
              fontSize: 18,
              borderRadius: 8,
              background: "#4caf50",
              color: "#fff",
              fontWeight: "bold",
              border: "none",
              cursor: "pointer",
            }}
          >
            Fast Forward
          </button>
        </div>
      )}

      {/* Work Animation Overlay */}
      {showWorkAnimation && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            flexDirection: "column",
          }}
        >
          <img
            src="Picture/Work.gif"
            alt="Working..."
            style={{ width: 220, height: 220, marginBottom: 24 }}
          />
          <div
            style={{
              color: "#fff",
              fontSize: 32,
              fontWeight: "bold",
              marginBottom: 12,
            }}
          >
            Working...
          </div>
          <div style={{ color: "#fff", fontSize: 20, marginBottom: 8 }}>
            Loading
          </div>
          <div
            style={{
              width: 400,
              height: 24,
              background: "#222",
              borderRadius: 12,
              overflow: "hidden",
              marginBottom: 8,
              boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
            }}
          >
            <div
              style={{
                width: `${Math.round(workProgress * 100)}%`,
                height: "100%",
                background: "#ffd700",
                transition: "width 0.2s linear",
              }}
            ></div>
          </div>
          <div style={{ color: "#fff", fontSize: 20 }}>
            {Math.round(workProgress * 100)}%
          </div>
          <button
            onClick={fastForwardWork}
            style={{
              marginTop: 24,
              padding: "8px 24px",
              fontSize: 18,
              borderRadius: 8,
              background: "#ffd700",
              color: "#222",
              fontWeight: "bold",
              border: "none",
              cursor: "pointer",
            }}
          >
            Fast Forward
          </button>
        </div>
      )}

      {/* Coordinate Display */}
      <div className="coordinates-display">
        X: {Math.round(position.x)}% Y: {Math.round(position.y)}%
      </div>

      <div className="character-stats">
        <div className="stat-item">
          <span>Happiness:</span>
          <div className="stat-bar happiness-bar">
            <div
              className="stat-fill"
              style={{
                width: `${
                  showWorkAnimation
                    ? getAnimatedWorkStat("happiness")
                    : showSleepAnimation
                    ? getAnimatedStat("happiness")
                    : stats.happiness
                }%`,
                transition:
                  showWorkAnimation || showSleepAnimation
                    ? "width 0.2s linear"
                    : undefined,
              }}
            ></div>
          </div>
          <span>
            {showWorkAnimation
              ? getAnimatedWorkStat("happiness")
              : showSleepAnimation
              ? getAnimatedStat("happiness")
              : stats.happiness}
            %
          </span>
        </div>
        <div className="stat-item">
          <span>Hunger:</span>
          <div className="stat-bar hunger-bar">
            <div
              className="stat-fill"
              style={{
                width: `${
                  showWorkAnimation
                    ? getAnimatedWorkStat("hunger")
                    : showEatAnimation
                    ? getAnimatedEatStat("hunger")
                    : stats.hunger
                }%`,
                transition:
                  showWorkAnimation || showEatAnimation
                    ? "width 0.2s linear"
                    : undefined,
              }}
            ></div>
          </div>
          <span>
            {showWorkAnimation
              ? getAnimatedWorkStat("hunger")
              : showEatAnimation
              ? getAnimatedEatStat("hunger")
              : stats.hunger}
            %
          </span>
        </div>
        <div className="stat-item">
          <span>Sleep:</span>
          <div className="stat-bar sleep-bar">
            <div
              className="stat-fill"
              style={{
                width: `${
                  showWorkAnimation
                    ? getAnimatedWorkStat("sleep")
                    : showSleepAnimation
                    ? getAnimatedStat("sleep")
                    : stats.sleep
                }%`,
                transition:
                  showWorkAnimation || showSleepAnimation
                    ? "width 0.2s linear"
                    : undefined,
              }}
            ></div>
          </div>
          <span>
            {showWorkAnimation
              ? getAnimatedWorkStat("sleep")
              : showSleepAnimation
              ? getAnimatedStat("sleep")
              : stats.sleep}
            %
          </span>
        </div>
        <div className="stat-item">
          <span>Hygiene:</span>
          <div className="stat-bar hygiene-bar">
            <div
              className="stat-fill"
              style={{
                width: `${
                  showWorkAnimation
                    ? getAnimatedWorkStat("hygiene")
                    : showShowerAnimation
                    ? getAnimatedHygiene()
                    : stats.hygiene
                }%`,
                transition:
                  showWorkAnimation || showShowerAnimation
                    ? "width 0.2s linear"
                    : undefined,
              }}
            ></div>
          </div>
          <span>
            {showWorkAnimation
              ? getAnimatedWorkStat("hygiene")
              : showShowerAnimation
              ? getAnimatedHygiene()
              : stats.hygiene}
            %
          </span>
        </div>
        <div className="stat-item">
          <span>Gold:</span>
          <span className="gold-amount">
            {showWorkAnimation ? getAnimatedWorkStat("gold") : stats.gold}
          </span>
        </div>
      </div>

      {showWorkEatButtons &&
        !showSleepAnimation &&
        !showShowerAnimation &&
        !showEatAnimation &&
        !showWorkAnimation && (
          <div className="action-buttons">
            <button onClick={handleWork}>Work</button>
            <button onClick={handleEat}>Eat</button>
          </div>
        )}

      {showSleepButton &&
        !showSleepAnimation &&
        !showShowerAnimation &&
        !showEatAnimation &&
        !showWorkAnimation && (
          <div className="action-buttons">
            <button onClick={handleSleep}>Sleep</button>
          </div>
        )}

      {showHygieneButton &&
        !showSleepAnimation &&
        !showShowerAnimation &&
        !showEatAnimation &&
        !showWorkAnimation && (
          <div className="action-buttons">
            <button onClick={() => {console.log("Clean Up button clicked"); handleShower();}}>Clean Up</button>
          </div>
        )}

      {showGoOutsideButton &&
        !showSleepAnimation &&
        !showShowerAnimation &&
        !showEatAnimation &&
        !showWorkAnimation && (
          <div className="action-buttons">
            <button onClick={onReturn}>Go Outside</button>
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