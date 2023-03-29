

class PlayerStash {
    constructor() {
        this.pos = new THREE.Vector3(1.5, 0.1, 3.3);
        this.extents = new THREE.Vector3(1, 0.2, 1);
        this.pieces = [];
    }

    setStashPosition(pos) {
        this.pos.copy(pos);
    }

    positionPieceInStash(gamePiece) {
        ThreeAPI.tempVec3.copy(this.pos);
        MATH.spreadVector(ThreeAPI.tempVec3, this.extents);
        gamePiece.getSpatial().setPosVec3(ThreeAPI.tempVec3);
        GameAPI.registerGameUpdateCallback(gamePiece.getOnUpdateCallback());
    }

    addPieceToStash(piece) {
        this.positionPieceInStash(piece)
        this.pieces.push(piece);
    }

    takePieceFromStash(gamePiece) {
        let piece = MATH.quickSplice(gamePiece, this.pieces);
        GameAPI.unregisterGameUpdateCallback(piece.getOnUpdateCallback());
    }



}
export { PlayerStash }