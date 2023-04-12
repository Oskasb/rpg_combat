import { TileIndicator } from "../../application/ui/gui/game/TileIndicator.js";

class GridTile {
    constructor(tileX, tileZ, size, thickness, obj3d) {
        this.tileX = tileX;
        this.tileZ = tileZ;
        this.size = size;
        this.thickness = thickness;
        this.obj3d = obj3d;
        this.tileStatus = 'FREE'
        this.tileIndicator = new TileIndicator(this);
    }

    indicateTileStatus(bool) {
        if (bool) {
            this.tileIndicator.activateTileIndicator();
        } else {
            this.tileIndicator.removeTileIndicator();
            this.tileIndicator.removeIndicatorFx();
        }

    }

    setTileStatus(status) {
        this.tileStatus = status;
    }
    getTileStatus() {
        return this.tileStatus;
    }
    getTilePos() {
        return this.obj3d.position;
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