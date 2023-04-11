class  GameWorld  {
    constructor() {
        this.itemPieces = [];
    }

    gameWorldRegisterPiece(piece) {
        this.itemPieces.push(piece);
    }

    gameWorldReleasePiece(piece) {
        return MATH.quickSplice(this.itemPieces, piece);
    }

}

export { GameWorld }