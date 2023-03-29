import { CharacterInventory } from "./CharacterInventory.js";
import { CharacterEquipment } from "./CharacterEquipment.js";

class GameCharacter {
    constructor(name) {
        this.characterName = name;
        this.gamePiece = null;
        this.characterInventory = new CharacterInventory();

    }

    setCharacterPiece(gamePiece, equipSlotConfigId) {
        this.gamePiece = gamePiece;
        this.characterEquipment = new CharacterEquipment(equipSlotConfigId);
    }

    getCharacterPiece() {
        return this.gamePiece;
    }

    getInventory() {
        return this.characterInventory;
    }

    getEquipment() {
        return this.characterEquipment;
    }

}

export { GameCharacter }