class CharacterAbilities{
    constructor() {
        this.gamePiece = null;
        this.addedAbilities = [];
    }

    initCharacterAbilities(gamePiece) {
        this.gamePiece = gamePiece;
    }


    addCharacterAbility(abilityId) {
        this.addedAbilities.push(abilityId)
    }

}

export { CharacterAbilities }