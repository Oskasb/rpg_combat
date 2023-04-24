class AbilitySlot {
    constructor(gamePiece, slotIndex) {
        this.gamePiece = gamePiece;
        this.slotIndex = slotIndex;
        this.pieceAbility = null;
    }

    setAbility(pieceAbility) {
        this.pieceAbility = pieceAbility;
    }

}

export { AbilitySlot }