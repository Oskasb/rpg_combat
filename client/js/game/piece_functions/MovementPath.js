class MovementPath {
    constructor(gamePiece) {
        this.gamePiece = gamePiece;
        this.pieceMovement = gamePiece.pieceMovement;
        this.currentPosTile = null;
        this.targetPosTile = null;
    }


    updatePositionOnGrid(encounterGrid) {
        let pos = this.gamePiece.getPos();
        let gridTile = encounterGrid.getTileAtPosition(pos);
        if (this.currentPosTile !== gridTile || gridTile.getTileStatus() === 'FREE'){
            if (this.currentPosTile) {
                this.currentPosTile.indicateTileStatus(false);
            }
            gridTile.indicateTileStatus(false);
            if (this.gamePiece.getStatusByKey('isItem') === 1 && (gridTile.getTileStatus() === 'FREE')) {
                gridTile.setTileStatus('HAS_ITEM')
            } else {
                gridTile.setTileStatus('OCCUPIED')
            }
            gridTile.indicateTileStatus(true);
            this.currentPosTile = gridTile;
        }
    }

    updateMovementOnGrid(encounterGrid) {
        ThreeAPI.tempVec3.copy(this.pieceMovement.targetPosVec3);
        let targetPos = ThreeAPI.tempVec3;
        let gridTile = encounterGrid.getTileAtPosition(targetPos);
        if (this.targetPosTile !== gridTile){
            if (this.targetPosTile) {
                this.targetPosTile.indicateTileStatus(false);
            }
            gridTile.indicateTileStatus(false);
            gridTile.setTileStatus('MOVE_TO')
            gridTile.indicateTileStatus(true);
        //    this.pieceMovement.targetPosVec3.copy(gridTile.obj3d.position);
            this.targetPosTile = gridTile;
        }

    }

    tickMovementPath(tpf, gameTime) {
        let encounterGrid = GameAPI.getActiveEncounterGrid();
        if (encounterGrid) {
            if (encounterGrid.gridTiles.length) {
                this.updateMovementOnGrid(encounterGrid);
                this.updatePositionOnGrid(encounterGrid);
            }
        }
    }

}

export { MovementPath }