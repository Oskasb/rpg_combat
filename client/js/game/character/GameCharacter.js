import { CharacterInventory } from "./CharacterInventory.js";
import { CharacterEquipment } from "./CharacterEquipment.js";
import { CharacterStatus } from "./CharacterStatus.js";
import { CharacterMovement } from "./CharacterMovement.js";

class GameCharacter {
    constructor(name) {
        this.characterName = name;
        this.gamePiece = null;
        this.characterInventory = new CharacterInventory();
        this.characterStatus = new CharacterStatus();

        let pickupComplete = function(itemPiece) {
            this.getInventory().addItemToInventory(itemPiece);
        }.bind(this);


        this.callbacks= {
            pickupComplete:pickupComplete
        }

    }

    setCharacterPiece(gamePiece, equipSlotConfigId) {
        this.gamePiece = gamePiece;
        this.characterStatus.activateCharacterStatus(gamePiece);
        this.characterEquipment = new CharacterEquipment(gamePiece, equipSlotConfigId);
        this.characterMovement = new CharacterMovement(gamePiece);
    }

    getCharacterPiece() {
        return this.gamePiece;
    }

    pickupItem(gamePiece, time) {
        gamePiece.getPieceMovement().moveToTargetAtTime('grab_loot', gamePiece, this.gamePiece.getSpatial(), time, this.callbacks.pickupComplete);
    }

    getInventory() {
        return this.characterInventory;
    }

    getEquipment() {
        return this.characterEquipment;
    }

    dismissCharacter() {
        this.getEquipment().removeAllItems()
        this.gamePiece.disbandGamePiece()
    }

}

export { GameCharacter }
