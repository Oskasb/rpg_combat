import { Vector3 } from "../../../libs/three/math/Vector3.js";

import { Object3D } from "../../../libs/three/core/Object3D.js";
let tempObj = new Object3D()

let tempVec3 = new Vector3();
let tempVec3b = new Vector3()
class CompanionMovement {
    constructor(gamePiece) {
        this.gamePiece = gamePiece;
    }

    getCompanionFormationDestination(followingPiece) {
        let tilePath = followingPiece.movementPath.tilePath;
        let tiles = tilePath.getTiles();
        let tileCount = tiles.length;
        let companionIndex = followingPiece.companions.indexOf(this.gamePiece);

        if (tileCount > 1) {
            let lastTile = tiles[tileCount-1];
            let preLastTile = tiles[tileCount-2];
            tempObj.position.copy(preLastTile.getPos())
            tempObj.lookAt(lastTile.getPos());
        } else {
            let quat = followingPiece.getQuat()
            tempObj.quaternion.copy(quat)
            tempObj.position.copy(followingPiece.getPos())
        }

        if (companionIndex === 0) {
            tempVec3.x =1;
            tempVec3.z =-1;
            tempVec3.applyQuaternion(tempObj.quaternion);
            tempVec3.add(tempObj.position)
            tempVec3.y = followingPiece.getPos().y;
            evt.dispatch(ENUMS.Event.DEBUG_DRAW_LINE, {from:followingPiece.getPos(), to:tempVec3, color:'AQUA'});
        }

        if (companionIndex === 1) {
            tempVec3.x =-1;
            tempVec3.z =-1;
            tempVec3.applyQuaternion(tempObj.quaternion);
            tempVec3.add(tempObj.position)
            tempVec3.y = followingPiece.getPos().y;
            evt.dispatch(ENUMS.Event.DEBUG_DRAW_LINE, {from:followingPiece.getPos(), to:tempVec3, color:'CYAN'});
        }

        return tempVec3;

    }

    getCompanionDestination(followingPiece) {
        return this.getCompanionFormationDestination(followingPiece)
    }

    updateCompanionMovement(followingPiece) {

        let destinationVec3 = this.getCompanionDestination(followingPiece);
        this.gamePiece.movementPath.setDestination(destinationVec3);
    }

}

export { CompanionMovement }