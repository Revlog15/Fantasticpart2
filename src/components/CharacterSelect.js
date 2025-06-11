import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/CharacterSelect.css";

const characters = [
  {
    name: "REVLOG",
    id: "revlog",
    strength: "ADAPT!, recovers quickly from low mood and low sleep",
    weakness: "GIMMIE FOOD, gets hungry quickly",
  },
  {
    name: "ROBERT",
    id: "robert",
    strength: "Strong hearted, recovers quickly from low mood",
    weakness:
      "Naive, gets easily hungry, sleeps less, and loses 10 gold each time he falls asleep",
  },
  {
    name: "SAM",
    id: "sam",
    strength: "Dilligent, gets more gold from working",
    weakness: "Sleepy Time, needs more sleep than others",
  },
  {
    name: "DIMSUM",
    id: "dimsum",
    strength: "Thrifty, spend less gold on food",
    weakness:
      "Emptiness, happiness rises not as much as the others when exploring",
  },
];

function CharacterSelect() {
  const navigate = useNavigate();
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [playerName, setPlayerName] = useState("");
  const [selectSound, setSelectSound] = useState(null);
  const [confirmSound, setConfirmSound] = useState(null);

  useEffect(() => {
    // Initialize both audio sounds when component mounts
    const moveSound = new Audio(
      `${process.env.PUBLIC_URL}/Sounds/moveandselect.mp3`
    );
    const startSound = new Audio(
      `${process.env.PUBLIC_URL}/Sounds/confirm.mp3`
    );

    setSelectSound(moveSound);
    setConfirmSound(startSound);

    // Cleanup function to handle component unmount
    return () => {
      if (moveSound) {
        moveSound.pause();
        moveSound.currentTime = 0;
      }
      if (startSound) {
        startSound.pause();
        startSound.currentTime = 0;
      }
    };
  }, []);

  const handleCharacterChange = (direction) => {
    let newIndex = currentCharIndex + direction;
    if (newIndex < 0) newIndex = characters.length - 1;
    if (newIndex >= characters.length) newIndex = 0;
    setCurrentCharIndex(newIndex);

    // Play selection sound effect
    if (selectSound) {
      selectSound.currentTime = 0;
      selectSound.play();
    }
  };

  const handleStartGame = () => {
    if (playerName.trim()) {
      // Play confirm sound effect before navigating
      if (confirmSound) {
        confirmSound.currentTime = 0;
        confirmSound.play();
        // Wait for the confirm sound to finish before navigating
        setTimeout(() => {
          localStorage.setItem(
            "selectedCharacter",
            characters[currentCharIndex].id
          );
          localStorage.setItem("playerName", playerName);
          navigate("/game");
        }, 300); // Adjusted timing for confirm sound
      } else {
        localStorage.setItem(
          "selectedCharacter",
          characters[currentCharIndex].id
        );
        localStorage.setItem("playerName", playerName);
        navigate("/game");
      }
    }
  };

  const currentCharacter = characters[currentCharIndex];

  const containerStyle = {
    background: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${process.env.PUBLIC_URL}/map-utama.jpg)`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  };

  return (
    <div className="character-select-container" style={containerStyle}>
      <h1>Select Your Character</h1>

      <div className="character-selection">
        <div className="arrow" onClick={() => handleCharacterChange(-1)}>
          &#60;
        </div>

        <div>
          <div className="character-container">
            {characters.map((char, index) => (
              <img
                key={char.id}
                src={`${process.env.PUBLIC_URL}/Picture/${char.id}-idle.png`}
                className={`character ${
                  index === currentCharIndex ? "active" : ""
                }`}
                alt={char.name}
              />
            ))}
          </div>
          <div className="character-name">{currentCharacter.name}</div>
          <div className="name-input-container">
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Type your name here"
              maxLength="20"
            />
          </div>
          <div className="character-description">
            <h3>About Your Character</h3>
            <p className="strength">
              <strong>Strength:</strong> {currentCharacter.strength}
            </p>
            <p className="weakness">
              <strong>Weakness:</strong> {currentCharacter.weakness}
            </p>
          </div>
        </div>

        <div className="arrow" onClick={() => handleCharacterChange(1)}>
          &#62;
        </div>
      </div>

      <button
        className="continue-button"
        onClick={handleStartGame}
        disabled={!playerName.trim()}
      >
        START
      </button>
    </div>
  );
}

export default CharacterSelect;
