class PieceMovement {
    constructor(gamePiece) {
        this.gamePiece = gamePiece;
        this.spatial = gamePiece.getSpatial();
        this.startTime = 0;
        this.targetTime = 1;
        this.targetSpatial = null;
        this.startPos = new THREE.Vector3();
        this.targetPos = new THREE.Vector3();
        this.velocity = new THREE.Vector3();

        let _this = this;
        let tickMovement = function(tpf, gameTime) {
            _this.applyFrameToMovement(tpf, gameTime);
        };

        this.callbacks = {
            onGameUpdate:tickMovement
        }

        this.onArriveCallbacks = [];

    }

    moveToTargetAtTime(tSpatial, overTime, callback) {
        let now = GameAPI.getGameTime();
        if (this.onArriveCallbacks.length === 0) {
            GameAPI.registerGameUpdateCallback(this.callbacks.onGameUpdate);
        }
        this.startTime = now;
        this.targetTime = now+overTime;
        this.targetPos.copy(tSpatial.getSpatialPosition());
        this.targetSpatial = tSpatial;
        this.startPos.copy(this.spatial.getSpatialPosition());
        if (typeof(callback) === 'function') {
            this.onArriveCallbacks.push();
        }
    }


    interpolatePosition(tpf) {
        let now = GameAPI.getGameTime();
        if (this.targetTime+tpf > now) {
            let fraction = MATH.calcFraction(this.startTime, this.targetTime, now);
            this.targetPos.copy(this.targetSpatial.getSpatialPosition());
            this.targetPos.y+=Math.sin(fraction*4.24)*2;
            MATH.interpolateVec3FromTo(this.startPos, this.targetPos, fraction, ThreeAPI.tempVec3 , 'curveSigmoid');
            this.spatial.setPosVec3(ThreeAPI.tempVec3);
        } else {
            this.targetSpatial = null;
            MATH.callAll(this.onArriveCallbacks, this.gamePiece);
            MATH.emptyArray(this.onArriveCallbacks);
            GameAPI.unregisterGameUpdateCallback(this.callbacks.onGameUpdate);
        }
    }

    applyFrameToMovement(tpf, gameTime) {

        if (this.targetTime > gameTime) {
            this.interpolatePosition(tpf);
        }
    }


}

export { PieceMovement }