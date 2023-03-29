class  GameWorld  {
    constructor() {
        this.pieces = [];
    }

    gameWorldRegisterPiece(piece) {
        this.pieces.push(piece);
    }

    gameWorldReleasePiece(piece) {
        return MATH.quickSplice(this.pieces, piece);
    }

}

export { GameWorld }