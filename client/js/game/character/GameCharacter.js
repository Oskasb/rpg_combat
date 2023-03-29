import { CharacterInventory } from "./CharacterInventory.js";
import { CharacterEquipment } from "./CharacterEquipment.js";

class GameCharacter {
    constructor(name) {
        this.characterName = name;
        this.gamePiece = null;
        this.characterInventory = new CharacterInventory();

        let pickupComplete = function(itemPiece) {
            this.getInventory().addItemToInventory(itemPiece);
        }.bind(this);


        this.callbacks= {
            pickupComplete:pickupComplete
        }

    }

    setCharacterPiece(gamePiece, equipSlotConfigId) {
        this.gamePiece = gamePiece;
        this.characterEquipment = new CharacterEquipment(gamePiece.modelInstance, equipSlotConfigId);
    }

    getCharacterPiece() {
        return this.gamePiece;
    }

    pickupItem(gamePiece, time) {
        gamePiece.getPieceMovement().moveToTargetAtTime(this.gamePiece.getSpatial(), time);
    }

    getInventory() {
        return this.characterInventory;
    }

    getEquipment() {
        return this.characterEquipment;
    }

}

export { GameCharacter }