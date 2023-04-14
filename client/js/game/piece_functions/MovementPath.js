class MovementPath {
    constructor(gamePiece) {
        this.isPathing = false;
        this.gamePiece = gamePiece;
        this.pathTargetPiece = null;
        this.pathTargetTile = null;
        this.pieceMovement = gamePiece.pieceMovement;
        this.pathTargetPos = new THREE.Vector3();
        this.turnPathEnd = new THREE.Vector3()
        this.currentPosTile = null;
        this.targetPosTile = null;
        this.destinationTile = null;
        this.tempVec = new THREE.Vector3();
        this.nodeTile = {
            tile:null,
            turnFraction:1
        };
        this.pathTiles = [];

        let onTurnEnd = function() {
            this.gamePiece.setStatusValue('turn_moves', 0);
            GameAPI.unregisterGameTurnCallback(this.callbacks.onTurnEnd);
        }.bind(this)

        let onPathEnd = function() {
            onTurnEnd();
            let currentTile = GameAPI.getActiveEncounterGrid().getTileAtPosition(this.gamePiece.getPos());
            if (currentTile !== this.destinationTile) {
                GameAPI.registerGameTurnCallback(this.callbacks.updatePathTurn);
            }
        }.bind(this);

        let updatePathTurn = function(turnStatus) {
            GameAPI.unregisterGameTurnCallback(this.callbacks.updatePathTurn);
            this.determineGridPathToPos(this.destinationTile.getPos());
            this.moveAlongActiveGridPath();
        }.bind(this)

        let turnEndNodeMove = function() {
            console.log("Turn End Node Move")
            GameAPI.registerGameTurnCallback(this.callbacks.onTurnEnd);
            this.callbacks.onPathEnd();
        }.bind(this)

        this.pathEndCallbacks = [];

        this.callbacks = {
            onTurnEnd:onTurnEnd,
            onPathEnd:onPathEnd,
            updatePathTurn:updatePathTurn,
            turnEndNodeMove:turnEndNodeMove
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

    clearTilePathStatus(tilePath) {
        this.isPathing = false;
        while(tilePath.length) {
            let tile = tilePath.pop();
            tile.setTileStatus('FREE');
            tile.indicateTileStatus(false);
        }
    }

    cancelMovementPath(tilePath) {
        this.pathTargetPiece = null;
        this.pathTargetTile = null;
        if (tilePath.length) {
            this.pieceMovement.cancelActiveTransition()
        }
        this.clearTilePathStatus(tilePath)
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

        this.pathTiles.push(startTile);
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

            let elevation = tile.getPos().y;

            let color = 'YELLOW';

            if ( Math.abs(elevation) > Math.abs(this.pathTiles[i].getPos().y) + 0.7)  {
                this.drawPathLine(this.tempVec, tile.getPos(), 'RED')
                i = tileCount;
            } else {
                this.pathTiles.push(tile);

                this.drawPathLine(this.tempVec, tile.getPos(), color)
                this.tempVec.copy(tile.getPos());
            }

        }

    }


    buildGridPath(posVec) {
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

        this.drawPathLine(cPos, this.turnPathEnd, 'CYAN');
        let endTile = GameAPI.getActiveEncounterGrid().getTileAtPosition(this.turnPathEnd);
        this.turnPathEnd.copy(endTile.getPos());

        this.selectTilesBeneathPath(GameAPI.getActiveEncounterGrid().getTileAtPosition(cPos), endTile)

    }

    determineGridPathToPos(posVec) {
        this.cancelMovementPath(this.pathTiles)
        this.buildGridPath(posVec)
    }


    moveTroughTilePath(cb) {
        this.pieceMovement.moveAlongTilePath(this.pathTiles, cb)
    }

    addPathEndCallback(cb) {
        if (this.pathEndCallbacks.indexOf(cb) === -1) {
            this.pathEndCallbacks.push(cb)
        } else {
            console.log("path end cb already installed", cb)
        }

        if (this.pathEndCallbacks.length > 1) {
            console.log("multiple path end callbacks installed, should not be")
        }
    }

    moveAlongActiveGridPath() {

    //    let turnMoves = this.gamePiece.getStatusByKey('turn_moves');
      //  turnMoves++;
      //  this.gamePiece.setStatusValue('turn_moves', turnMoves);


        let tileCount = this.pathTiles.length;
        if (tileCount ){
            if (this.isPathing === false) {
                this.moveTroughTilePath(this.callbacks.onPathEnd);
            }
            this.isPathing = true;

        } else {
            this.isPathing = false;
            MATH.callAndClearAll(this.pathEndCallbacks, this.gamePiece)
        //    console.log("NO TILE COUNT")
        //    this.callbacks.onPathEnd();
        }
    }

    setPathTargetPiece(targetPiece) {
        this.pathTargetPiece = targetPiece;
        this.determinePathToTargetPiece(targetPiece)
    }

    selectTileByAttackRangeTo(currentDestinationTile, targetPiece) {
        let distanceRemaining = this.gamePiece.distanceToReachTarget(targetPiece);
        if (distanceRemaining > 0) {
            let tempVec = ThreeAPI.tempVec3
            let dist = distanceRemaining + currentDestinationTile.size * 0.25
            MATH.vectorAtPositionTowards(this.gamePiece.getPos(), targetPiece.getPos(), dist, tempVec)
            return GameAPI.getActiveEncounterGrid().getTileAtPosition(tempVec);
        } else {
            return currentDestinationTile;
        }
    }
    determinePathToTargetPiece(targetPiece) {

        if (!this.destinationTile) {
            this.setDestination(targetPiece.getPos());
        }

        let tileAtTarget =  GameAPI.getActiveEncounterGrid().getTileAtPosition(targetPiece.getPos());
    //    if (tileAtTarget !== this.pathTargetTile) {
            this.pathTargetTile = tileAtTarget;
            let selectedTile = this.selectTileByAttackRangeTo(this.destinationTile, targetPiece);
        //    if (selectedTile !== this.destinationTile) {
                this.clearTilePathStatus(this.pathTiles);
                this.destinationTile = selectedTile
                this.buildGridPath(selectedTile.getPos())
       //     }
    //    } else {
    //        this.pathTiles.push()
    //    }
    }

    updatePathTiles() {
        if (this.destinationTile) {

        //    this.drawPathLine(this.gamePiece.getPos(), this.turnPathEnd, 'CYAN');
            this.drawPathLine(this.turnPathEnd, this.destinationTile.getPos(), 'BLUE');
        }
    }

    tickMovementPath(tpf, gameTime) {
        let encounterGrid = GameAPI.getActiveEncounterGrid();
        if (encounterGrid) {
            if (encounterGrid.gridTiles.length) {

                if (this.pathTargetPiece) {
                    this.determinePathToTargetPiece(this.pathTargetPiece);
                }

                if (this.isPathing === false) {
                    this.moveAlongActiveGridPath();
                }

                this.updatePathTiles()
                this.updateMovementOnGrid(encounterGrid);
                this.updatePositionOnGrid(encounterGrid);
            }
        }
    }

}

export { MovementPath }