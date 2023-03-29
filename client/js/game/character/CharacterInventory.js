class CharacterInventory {
    constructor() {
        this.pieces = [];
    }

    addItemToInventory(piece, time) {
        console.log("Add inv item ", piece);
        this.pieces.push(piece);

    }

    takeItemFromInventory(piece) {
        return MATH.quickSplice(this.pieces, piece );
    }

}

export { CharacterInventory }