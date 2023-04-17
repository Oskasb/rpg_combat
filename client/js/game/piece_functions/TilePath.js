import { Vector3 } from "../../../libs/three/math/Vector3.js";

let tempVec3 = new Vector3()

class TilePath {
    constructor(gamePiece) {
        this.gamePiece = gamePiece;
        this.startTile = null;
        this.endTile = null;
        this.pathTiles = [];
        this.activeTurn = 0;
    }

    setStartTile(tile) {
        this.startTile = tile;
    }

    getStartTile() {
        return this.startTile;
    }

    setEndTile(tile) {
        this.endTile = tile;
    }

    getEndTile() {
        return this.endTile;
    }

    getTiles() {
        return this.pathTiles;
    }



}

export { TilePath }