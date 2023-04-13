class MovementPath {
    constructor(gamePiece) {
        this.gamePiece = gamePiece;
        this.pieceMovement = gamePiece.pieceMovement;
        this.pathTargetPos = new THREE.Vector3();
        this.turnPathEnd = new THREE.Vector3()
        this.currentPosTile = null;
        this.targetPosTile = null;
        this.destinationTile = null;
        this.tempVec = new THREE.Vector3();
        this.pathTiles = [];

        let onTurnEnd = function() {
            this.gamePiece.setStatusValue('turn_moves', 0);
            GameAPI.unregisterGameTurnCallback(this.callbacks.onTurnEnd);
        }.bind(this)

        let onPathEnd = function() {
            onTurnEnd();
            let currentTile = GameAPI.getActiveEncounterGrid().getTileAtPosition(this.gamePiece.getPos());
            if (currentTile !== this.destinationTile) {
                //   this.callbacks.updatePathTurn()
                GameAPI.registerGameTurnCallback(this.callbacks.updatePathTurn);
            }
        }.bind(this);

        let updatePathTurn = function(turnStatus) {
            GameAPI.unregisterGameTurnCallback(this.callbacks.updatePathTurn);
            this.determineGridPathToPos(this.destinationTile.getPos());
            this.moveAlongActiveGridPath();
        }.bind(this)

        this.callbacks = {
            onTurnEnd:onTurnEnd,
            onPathEnd:onPathEnd,
            updatePathTurn:updatePathTurn
        }
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

    setDestination(posVec) {
        this.destinationTile = GameAPI.getActiveEncounterGrid().getTileAtPosition(posVec);
    }


    selectTilesBeneathPath(startTile, endTile) {
        let startX = startTile.tileX;
        let startZ = startTile.tileZ;
        let endX = endTile.tileX;
        let endZ = endTile.tileZ;
        let gridTiles = GameAPI.getActiveEncounterGrid().gridTiles;

        let xDiff = endX - startX;
        let zDiff = endZ - startZ;

        this.tempVec.copy(startTile.getPos());

        let stepX = 0;
        let stepZ = 0;
        let tileX = startX;
        let tileZ = startZ;
        let incrementX = 0;
        let incrementZ = 0;
        let tileCount = Math.max(Math.abs(xDiff), Math.abs(zDiff));

        for (let i = 0; i < tileCount; i++) {

            if (incrementX < Math.abs(xDiff)) {
                incrementX++
            }

            if (incrementZ < Math.abs(zDiff)) {
                incrementZ++
            }

            stepX = incrementX * Math.sign(-xDiff);
            stepZ = incrementZ * Math.sign(-zDiff);

            tileX = gridTiles.length - (startX - stepX);
            tileZ = gridTiles[0].length - (startZ - stepZ);
            let tile = gridTiles[tileX][tileZ];
               tile.indicateTileStatus(false);
               tile.setTileStatus('FREE');
               tile.indicateTileStatus(true);
            this.drawPathLine(this.tempVec, tile.getPos(), 'YELLOW')
            this.tempVec.copy(tile.getPos());
        }

    }


determineGridPathToPos(posVec) {
    let cPos = this.gamePiece.getPos();
    this.pathTargetPos.copy(posVec);

    let turnMoves = this.gamePiece.getStatusByKey('turn_moves');
    //   this.pathTargetPos.sub(cPos);
    let speed = this.gamePiece.getStatusByKey('move_speed');
    let remainingTime = GameAPI.getTurnStatus().turnProgress;
    let remainingDistance = MATH.distanceBetween(cPos, posVec)
    if (remainingDistance > speed*remainingTime*0.999) {
        this.turnPathEnd.copy(posVec)
        this.turnPathEnd.sub(cPos);
        this.turnPathEnd.normalize();
        let travelDistance = speed*remainingTime / (1+turnMoves);
        travelDistance -= this.destinationTile.size;
        this.turnPathEnd.multiplyScalar(travelDistance);
        this.turnPathEnd.add(cPos);

    } else {
        this.turnPathEnd.copy(posVec);
    }


    //    this.drawPathLine(cPos, this.pathTargetPos, 'GREEN');
    this.drawPathLine(cPos, this.turnPathEnd, 'CYAN');
    let endTile = GameAPI.getActiveEncounterGrid().getTileAtPosition(this.turnPathEnd);
    this.turnPathEnd.copy(endTile.getPos());
    this.drawPathLine(cPos, this.turnPathEnd, 'GREEN');
    this.selectTilesBeneathPath(GameAPI.getActiveEncounterGrid().getTileAtPosition(cPos), endTile)
    //   this.drawPathLine(this.turnPathEnd, posVec,'BLUE');
    //   this.drawPathLine(cPos, posVec, 'RED');

}

moveAlongActiveGridPath() {
    console.log("Move along path")
    let turnMoves = this.gamePiece.getStatusByKey('turn_moves');
    turnMoves++;
    this.gamePiece.setStatusValue('turn_moves', turnMoves);
    GameAPI.registerGameTurnCallback(this.callbacks.onTurnEnd);
    this.pieceMovement.moveTowards(this.turnPathEnd, this.callbacks.onPathEnd);
}

updatePathTiles() {
    if (this.destinationTile) {
        //    this.determineGridPathToPos(this.targetPosTile.getPos())
        this.drawPathLine(this.gamePiece.getPos(), this.turnPathEnd, 'CYAN');
        this.drawPathLine(this.turnPathEnd, this.destinationTile.getPos(), 'BLUE');
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