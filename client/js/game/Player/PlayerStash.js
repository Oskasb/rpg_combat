

class PlayerStash {
    constructor() {
        this.pos = new THREE.Vector3(1.4, 0.2, 3.5);
        this.extents = new THREE.Vector3(1, 0.4, 1);
        this.pieces = [];
    }

    setStashPosition(pos) {
        this.pos.copy(pos);
    }

    positionPieceInStash(piece) {
        ThreeAPI.tempVec3.copy(this.pos);
        MATH.spreadVector(ThreeAPI.tempVec3, this.extents);
        piece.getSpatial().setPosVec3(ThreeAPI.tempVec3);
    }

    addPieceToStash(piece) {
        this.positionPieceInStash(piece)
        this.pieces.push(piece);
    }

    takePieceFromStash(piece) {
        return MATH.quickSplice(piece, this.pieces);
    }



}
export { PlayerStash }