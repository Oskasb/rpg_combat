class SpatialTransition {
    constructor() {

        this.startTime = 0;
        this.targetTime = 1;
        this.targetSpatial = null;
        this.startPos = new THREE.Vector3();
        this.targetPos = new THREE.Vector3();

        let _this = this;
        let tickMovement = function(tpf, gameTime) {
            _this.applyFrameToMovement(tpf, gameTime);
        };

        this.callbacks = {
            onGameUpdate:tickMovement
        }

        this.onArriveCallbacks = [];
    }

    initSpatialTransition(mode, gamePiece, tSpatial, overTime, callback) {
        this.gamePiece = gamePiece;
        this.spatial = gamePiece.getSpatial();

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
            this.onArriveCallbacks.push(callback);
        }
    }

    interpolatePosition(tpf) {
        let now = GameAPI.getGameTime();
        if (this.targetTime > now) {
            let fraction = MATH.calcFraction(this.startTime, this.targetTime, now);
            if (fraction > 1) fraction = 1;
            this.targetPos.copy(this.targetSpatial.getSpatialPosition());
            this.targetPos.y+=Math.sin(fraction*Math.PI)*2;
            MATH.interpolateVec3FromTo(this.startPos, this.targetPos, fraction, ThreeAPI.tempVec3 , 'curveSigmoid');
            this.spatial.setPosVec3(ThreeAPI.tempVec3);
        } else {
            this.spatial.setPosVec3(this.targetPos);
            this.targetSpatial = null;
            MATH.callAll(this.onArriveCallbacks, this.gamePiece);
            MATH.emptyArray(this.onArriveCallbacks);
            GameAPI.unregisterGameUpdateCallback(this.callbacks.onGameUpdate);
        }
    }

    applyFrameToMovement(tpf, gameTime) {
        if (this.targetTime+tpf > gameTime) {
            this.interpolatePosition(tpf);
        }
    }
}

export { SpatialTransition }