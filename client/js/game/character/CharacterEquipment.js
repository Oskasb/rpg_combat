class CharacterEquipment {
    constructor() {
        this.pieces = [];
    }

    characterEquipItem(piece) {
        this.pieces.push(piece)
    };

    takeEquippedItem(piece) {
        return MATH.quickSplice(piece, this.pieces);
    }

}

export { CharacterEquipment }