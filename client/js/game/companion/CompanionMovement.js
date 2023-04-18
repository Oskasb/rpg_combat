class CompanionMovement {
    constructor(gamePiece) {
        this.gamePiece = gamePiece;
    }

    updateCompanionMovement(followingPiece) {
        let tilePath = followingPiece.movementPath.tilePath;
        let endTile = tilePath.getTurnEndTile();

        let destinationVec3 = followingPiece.getCompanionFormationDestination(endTile, this.gamePiece)
        this.gamePiece.movementPath.setDestination(destinationVec3);

        let pos;
     //   if (!endTile) {
            pos = followingPiece.getPos()
    //    } else {
    //        pos = endTile.getPos()
    //    }
    //    this.gamePiece.movementPath.buildGridPath(pos);
    //    this.gamePiece.movementPath.tilePath.setEndTile(endTile);
    }

}

export { CompanionMovement }