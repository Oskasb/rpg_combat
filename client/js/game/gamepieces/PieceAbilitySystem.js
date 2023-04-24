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

    slotActiveAbility(slotIndex, abilityId) {
        if (slotIndex > this.abilitySlots.length) {
            console.log("Not enough available slots", slotIndex, abilityId, this.gamePiece)
        } else {
            this.abilitySlots[slotIndex].setAbility(this.getAbility(abilityId));
        }
    }

    getSlottedAbilities() {
        return this.abilitySlots;
    }

    addAbilitySlot(index) {
        this.abilitySlots[index] = new AbilitySlot(this.gamePiece, index)
    }

    unlockAbilitySlot(slotIndex) {
        this.abilitySlots[slotIndex].setLocked(false);
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