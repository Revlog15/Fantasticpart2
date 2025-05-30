import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/CharacterSelect.css";

const characters = [
  { name: "Revlog", id: "revlog" },
  { name: "Robert", id: "robert" },
  { name: "Sam", id: "sam" },
  { name: "Dimsum", id: "dimsum" },
];

function CharacterSelect() {
  const navigate = useNavigate();

  const handleCharacterSelect = (characterId) => {
    localStorage.setItem("selectedCharacter", characterId);
    localStorage.setItem(
      "playerName",
      characters.find((char) => char.id === characterId)?.name || "Player"
    );
    navigate("/game"); // Navigate to the game route
  };

  return (
    <div className="character-select-container">
      <h2>Select Your Character</h2>
      <div className="character-list">
        {characters.map((character) => (
          <div
            key={character.id}
            className="character-option"
            onClick={() => handleCharacterSelect(character.id)}
          >
            <img
              src={`/Picture/${character.id}-idle.png`}
              alt={character.name}
              className="character-image"
            />
            <p>{character.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CharacterSelect;
