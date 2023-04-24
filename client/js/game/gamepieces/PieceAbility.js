class PieceAbility {
    constructor(gamePiece, abilityId, config) {
        this.gamePiece = gamePiece;
        this.abilityId = abilityId;
        this.config = config;
        this.abilityStatus = {};
    }

    setAbilityStatus(abilityStatus) {
        for (let key in abilityStatus) {
            this.abilityStatus[key] = abilityStatus[key];
        }
    }


}

export { PieceAbility }