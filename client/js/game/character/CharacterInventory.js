class CharacterInventory {
    constructor() {
        this.pieces = [];
    }

    addItemToInventory(piece) {
        this.pieces.push(piece);
    }

    takeItemFromInventory(piece) {
        return MATH.quickSplice(piece, this.pieces);
    }

}

export { CharacterInventory }