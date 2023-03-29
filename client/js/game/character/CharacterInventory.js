class CharacterInventory {
    constructor() {
        this.pieces = [];
    }

    addItemToInventory(piece, time) {
        piece.hideGamePiece();
        this.pieces.push(piece);
    //    console.log("Add inv item ", this.pieces);
    }

    getInventoryItemByItemId(itemId) {
        if (!this.pieces.length) return;

        if (itemId === 'random') {
            //    console.log(this.pieces)
            return this.pieces[Math.floor(Math.random()*this.pieces.length)]
        } else {
            console.log("Figure this out...")

        }

    }

    takeItemFromInventory(gamePiece) {
        if (typeof (gamePiece) === 'string') {
            gamePiece = this.getInventoryItemByItemId(gamePiece);
        }
        if(gamePiece) {
            gamePiece.showGamePiece();
        }

        return MATH.quickSplice(this.pieces, gamePiece );
    }

}

export { CharacterInventory }