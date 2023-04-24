import { PieceAbility } from "./PieceAbility.js";
import { AbilitySlot } from "./AbilitySlot.js";

class PieceAbilitySystem {
    constructor(gamePiece) {
        this.gamePiece = gamePiece;
        this.abilitySlots = [];
        this.pieceAbilities = {};
    }

    initAbilitySlots(count) {
        for (let i = 0; i < count; i++) {
            this.addAbilitySlot(i);
        }
    }

    addAbilitySlot(index) {
        this.abilitySlots[index] = new AbilitySlot(this.gamePiece, index)
    }

    registerPieceAbility(abilityId,  configData) {
        this.pieceAbilities[abilityId] = new PieceAbility(this.gamePiece, abilityId, configData)
    }

    getAbility(abilityId) {
        return this.pieceAbilities[abilityId];
    }
    setAbilityStatus(abilityId, abilityStatus) {
        this.getAbility(abilityId).setAbilityStatus(abilityStatus);
        console.log("Piece Abilities:", this.pieceAbilities);
    }

}

export { PieceAbilitySystem }