import { CharacterInventory } from "./CharacterInventory.js";
import { CharacterEquipment } from "./CharacterEquipment.js";
import { CharacterStatus } from "./CharacterStatus.js";
import { CharacterMovement } from "./CharacterMovement.js";
import { CharacterStatusGui } from "../../application/ui/gui/game/CharacterStatusGui.js";
import { CharacterIndicator } from "../../application/ui/gui/game/CharacterIndicator.js";

class GameCharacter {
    constructor(config) {
        this.characterName = config.status.name;
        this.gamePiece = null;
        this.config = config;
        this.characterInventory = new CharacterInventory();
        this.characterStatus = new CharacterStatus();
        this.characterStatusGui = new CharacterStatusGui();
        this.characterIndicator = new CharacterIndicator();

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

        for (let key in this.config.status) {
            gamePiece.setStatusValue(key, this.config.status[key]);
        }

        this.characterEquipment = new CharacterEquipment(gamePiece, equipSlotConfigId);
        this.characterMovement = new CharacterMovement(gamePiece);
        this.characterStatusGui.initStatusGui(this);
        this.characterIndicator.initCharacterIndicator(gamePiece);
    }

    getCharacterPiece() {
        return this.gamePiece;
    }

    activateCharStatusGui() {
        this.characterStatusGui.activateCharacterStatusGui()
    }

    deactivateCharStatusGui() {
        this.characterStatusGui.deactivateCharacterStatusGui()
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
        this.characterStatusGui.deactivateCharacterStatusGui();
        this.characterIndicator.removeIndicatorFromPiece(this.gamePiece);
    }

}

export { GameCharacter }
