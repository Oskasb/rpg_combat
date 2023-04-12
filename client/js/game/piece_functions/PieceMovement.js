import { SpatialTransition } from "./SpatialTransition.js";

class PieceMovement {
    constructor(gamePiece) {
        this.target = null;
        this.targetPosVec3 = new THREE.Vector3();
        this.gamePiece = gamePiece;
        this.spatial = gamePiece.getSpatial();
        this.spatialTransition = new SpatialTransition();
        this.startTime = 0;
        this.targetTime = 1;
        this.targetSpatial = null;
        this.startPos = new THREE.Vector3();
        this.targetPos = new THREE.Vector3();
        this.margin = 0;

        let _this = this;
        let tickMovement = function(tpf, gameTime) {
            _this.applyFrameToMovement(tpf, gameTime);
        };

        this.callbacks = {
            onGameUpdate:tickMovement
        }

        this.onArriveCallbacks = [];

    }

    setTargetPosition(vec3) {
        this.targetPosVec3.copy(vec3)
    }

    getTargetPosition() {
        return this.targetPosVec3;
    }

    moveToTargetAtTime(mode, source, target, overTime, callback, margin) {

        if (mode === 'grab_loot') {
            return this.spatialTransition.initSpatialTransition(mode, this.gamePiece, target, overTime, callback )
        } else {

        }

        let now = GameAPI.getGameTime();
        if (this.onArriveCallbacks.length === 0) {
            this.gamePiece.addPieceUpdateCallback(this.callbacks.onGameUpdate);
        }

        this.target = target;
        this.margin = margin || 0.01;
        this.startTime = now;
        this.targetTime = now+overTime;
        this.targetPos.copy(target);
        this.startPos.copy(source);
        this.spatial.setPosVec3(source);
        if (typeof(callback) === 'function') {
            this.onArriveCallbacks.push(callback);
        }
    }

    interpolatePosition(tpf) {
        let now = GameAPI.getGameTime();
        this.targetPos.copy(this.target);
        let distanceRemaining = MATH.distanceBetween(this.spatial.obj3d.position, this.targetPos)
        if (distanceRemaining > this.margin) {
            let fraction = MATH.calcFraction(this.startTime, this.targetTime, now);
            if (fraction > 1) {
                fraction = 1
            }

            MATH.interpolateVec3FromTo(this.startPos, this.targetPos, MATH.curveQuad(Math.sin(fraction*MATH.HALF_PI)), ThreeAPI.tempVec3);
            this.spatial.setPosVec3(ThreeAPI.tempVec3);
        } else {
            this.spatial.call.setStopped();
            MATH.callAll(this.onArriveCallbacks, this.gamePiece);
            MATH.emptyArray(this.onArriveCallbacks);
            this.gamePiece.removePieceUpdateCallback(this.callbacks.onGameUpdate);
        }
    }

    applyFrameToMovement(tpf) {
        this.interpolatePosition(tpf);
    }


}

export { PieceMovement }