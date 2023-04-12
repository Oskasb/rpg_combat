import { TileIndicator } from "../../application/ui/gui/game/TileIndicator.js";

class GridTile {
    constructor(tileX, tileZ, size, obj3d) {
        this.tileX = tileX;
        this.tileZ = tileZ;
        this.size = size;
        this.obj3d = obj3d;
        this.tileStatus = 'FREE'
    }

    getTileStatus() {
        return this.tileStatus;
    }
    setTilePos(posVec3) {
        this.obj3d.position.copy(posVec3)
    }
    setTileQuat(quat) {
        this.obj3d.quaternion.copy(quat)
    }
    setTileInstance(instance) {
        this.instance = instance;
    }

    getTileInstance() {
        return this.instance;
    }



}

export { GridTile }