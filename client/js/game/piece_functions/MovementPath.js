class MovementPath {
    constructor(gamePiece) {
        this.gamePiece = gamePiece;
        this.pieceMovement = gamePiece.pieceMovement;
        this.pathTargetPos = new THREE.Vector3();
        this.turnPathEnd = new THREE.Vector3()
        this.currentPosTile = null;
        this.targetPosTile = null;
        this.tempVec = new THREE.Vector3();
        this.pathTiles = [];
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
            this.targetPosTile = gridTile;
        }

        this.lineEvent = {
            from:new THREE.Vector3(),
            to: new THREE.Vector3(),
            color:'CYAN'
        }
    }


    drawPathLine(from, to, color) {
        this.lineEvent.from.copy(from)
        this.lineEvent.to.copy(to);
        this.lineEvent.color = color || 'CYAN';
        evt.dispatch(ENUMS.Event.DEBUG_DRAW_LINE, this.lineEvent);
    }


    pathAddTurn() {

    }

    determineGridPathToPos(posVec) {

        let cPos = this.gamePiece.getPos();
        this.pathTargetPos.copy(posVec);
     //   this.pathTargetPos.sub(cPos);
        let speed = this.gamePiece.getStatusByKey('move_speed');
        let remainingTime = GameAPI.getTurnStatus().turnProgress;
        let remainingDistance = MATH.distanceBetween(cPos, posVec)
        if (remainingDistance > speed*remainingTime) {
            this.turnPathEnd.copy(this.pathTargetPos)
            this.turnPathEnd.sub(cPos);
            this.turnPathEnd.normalize();

            this.turnPathEnd.multiplyScalar(speed*remainingTime);
            this.turnPathEnd.add(cPos);
        } else {
            this.turnPathEnd.copy(posVec);
        }

        this.drawPathLine(cPos, this.pathTargetPos, 'GREEN');
        this.drawPathLine(cPos, this.turnPathEnd, 'CYAN');
        this.drawPathLine(this.turnPathEnd, posVec,'BLUE');
     //   this.drawPathLine(cPos, posVec, 'RED');

    }

   moveAlongActiveGridPath() {
        this.pieceMovement.moveTowards(this.turnPathEnd);
    }

    updatePathTiles() {
        if (this.targetPosTile) {
        //    this.determineGridPathToPos(this.targetPosTile.getPos())
        }
    }

    tickMovementPath(tpf, gameTime) {
        let encounterGrid = GameAPI.getActiveEncounterGrid();
        if (encounterGrid) {
            if (encounterGrid.gridTiles.length) {
                this.updatePathTiles()
                this.updateMovementOnGrid(encounterGrid);
                this.updatePositionOnGrid(encounterGrid);
            }
        }
    }

}

export { MovementPath }