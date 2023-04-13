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

        let onArrive = function() {

        }

        this.callbacks = {
            onGameUpdate:tickMovement,
            onArrive:onArrive
        }

        this.onArriveCallbacks = [];

    }


    moveTowards(targetPos) {
        let tpos = this.setTargetPosition(targetPos);
        let turnTimeRemaining = GameAPI.getTurnStatus().timeRemaining
        let speed = this.gamePiece.getStatusByKey('move_speed');
        let spos = this.gamePiece.getPos()
        let distance = MATH.distanceBetween(spos, tpos);
        let travelTime = distance * ( turnTimeRemaining / speed )  ;
        this.moveToTargetAtTime('walk', spos, tpos, travelTime, this.callbacks.onArrive)
    }

    setTargetPosition(vec3) {
        this.targetPosVec3.copy(vec3)
        return this.targetPosVec3;
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

        if (typeof(callback) === 'function') {
            if (this.onArriveCallbacks.indexOf(callback) === -1) {
                this.onArriveCallbacks.push(callback);
                this.startTime = now;
                this.spatial.setPosVec3(source);
                this.target = target;
                this.margin = margin || 0.01;
            }
        }

        this.startPos.copy(source);
        this.targetTime = now+overTime;
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