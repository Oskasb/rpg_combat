import {Vector3} from "../../../libs/three/math/Vector3.js";
let tempVec = new Vector3()

let drawPathTiles = function(pathTiles) {
    for (let i = 0; i < pathTiles.length; i++) {
        evt.dispatch(ENUMS.Event.DEBUG_DRAW_CROSS, {pos:pathTiles[i].getPos(), color:'WHITE', size:0.2})
    }
}

let drawPathTileVector = function(pathTiles, gamePiece) {
    if (pathTiles.length > 1) {
        evt.dispatch(ENUMS.Event.DEBUG_DRAW_CROSS, {pos:pathTiles[0].getPos(), color:'GREEN', size:0.3})
        evt.dispatch(ENUMS.Event.DEBUG_DRAW_CROSS, {pos:pathTiles[1].getPos(), color:'YELLOW', size:0.3})
        evt.dispatch(ENUMS.Event.DEBUG_DRAW_LINE, {from:gamePiece.getPos(), to:pathTiles[1].getPos(), color:'YELLOW'})
    } else {
        evt.dispatch(ENUMS.Event.DEBUG_DRAW_CROSS, {pos:gamePiece.getPos(), color:'RED', size:0.5})
    }

}

class PathWalker {
    constructor(gamePiece, tilePath) {
        this.gamePiece = gamePiece;
        this.tilePath = tilePath;
    }


    setMovementHeadingVector(fromVec3, toVec3) {
        evt.dispatch(ENUMS.Event.DEBUG_DRAW_LINE, {from:fromVec3, to:toVec3, color:'YELLOW'})

    }

    processTilePathMovement(onArriveCB, tpf, gameTime) {
        let pathTiles = this.tilePath.getTiles();
        let gamePiece = this.gamePiece;
        drawPathTiles(pathTiles);

        if (pathTiles.length > 1) {
            // Move towards next tile, assuming index 0 is close enough
            evt.dispatch(ENUMS.Event.DEBUG_DRAW_CROSS, {pos:pathTiles[0].getPos(), color:'GREEN', size:0.3})
            evt.dispatch(ENUMS.Event.DEBUG_DRAW_CROSS, {pos:pathTiles[1].getPos(), color:'YELLOW', size:0.3})
            this.setMovementHeadingVector(gamePiece.getPos(), pathTiles[1].getPos())
        } else {
            // final tile is near or reached, path end point
            if (pathTiles.length !== 0) {
                this.setMovementHeadingVector(gamePiece.getPos(), pathTiles[0].getPos())
                evt.dispatch(ENUMS.Event.DEBUG_DRAW_CROSS, {pos:gamePiece.getPos(), color:'ORANGE', size:0.5})
            } else {
                evt.dispatch(ENUMS.Event.DEBUG_DRAW_CROSS, {pos:gamePiece.getPos(), color:'RED', size:0.5})
            }
        }
    }

    updatePathWalker(onArriveCB, tpf, gameTime) {
        this.processTilePathMovement(onArriveCB, tpf, gameTime)
    }

}

export { PathWalker }