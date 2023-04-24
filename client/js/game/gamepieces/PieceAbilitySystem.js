import { PieceAbility } from "./PieceAbility.js";

class PieceAbilitySystem {
    constructor(gamePiece) {
        this.gamePiece = gamePiece;
        this.pieceAbilities = {};
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