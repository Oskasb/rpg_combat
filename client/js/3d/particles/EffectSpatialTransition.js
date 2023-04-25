import { Vector3 } from "../../../libs/three/math/Vector3.js";
let tempVec3 = new Vector3();
class EffectSpatialTransition {
    constructor(gameEffect) {

        this.gameEffect = gameEffect;

        this.startTime = 0;
        this.targetTime = 1;
        this.targetSpatial = null;
        this.startObj3D = new THREE.Object3D();
        this.targetObj3D = new THREE.Object3D();
        this.startSize = 0;
        this.endSize = 0;
        this.spread = 0;
        this.bounce = 1;

        let tickMovement = function(tpf, gameTime) {
            this.applyFrameToMovement(tpf, gameTime);
        }.bind(this);

        this.callbacks = {
            onGameUpdate:tickMovement
        }

        this.onArriveCallbacks = [];

    }

    initEffectTransition(fromPos, fromQuat, toPos, toQuat, fromSize, toSize, overTime, callback, bounce, spread) {
        let now = GameAPI.getGameTime();
        this.startTime = now;
        this.targetTime = now+overTime;

        this.startObj3D.position.copy(fromPos);
        this.startObj3D.quaternion.copy(fromQuat);
        this.startObj3D.scale.set(fromSize, fromSize, fromSize)
        this.targetObj3D.position.copy(toPos);
        this.targetObj3D.quaternion.copy(toQuat);
        this.targetObj3D.scale.set(toSize, toSize, toSize)

        this.startSize = fromSize;
        this.endSize = toSize;
        this.bounce = bounce || 0;
        this.spread = spread || 0;

        if (typeof(callback) === 'function') {
            this.onArriveCallbacks.push(callback);
        }
    }

    interpolatePosition() {
        let now = GameAPI.getGameTime();
        if (this.targetTime > now) {
            let fraction = MATH.calcFraction(this.startTime, this.targetTime, now);
            if (fraction > 1) fraction = 1;

        //    this.targetSpatial.getSpatialPosition(this.targetPos);

        //    this.targetObj3D.position.y+=Math.sin(fraction*Math.PI)*0.7+1.1;
            let size = MATH.interpolateFromTo(this.startSize, this.endSize, fraction);

            MATH.interpolateVec3FromTo(this.startObj3D.position, this.targetObj3D.position, fraction, tempVec3 , 'curveSigmoid');
            tempVec3.y += Math.sin(fraction*Math.PI)*this.bounce;


            tempVec3.x += Math.sin(fraction*MATH.HALF_PI)*this.spread*Math.cos(fraction*MATH.HALF_PI);
            tempVec3.z += Math.sin(fraction*MATH.HALF_PI)*this.spread*Math.cos(fraction*MATH.HALF_PI);
            let tempQuat = ThreeAPI.tempObj.quaternion;
            tempQuat.slerpQuaternions(this.startObj3D.quaternion, this.targetObj3D.quaternion, fraction)

            this.gameEffect.setEffectPosition(tempVec3);
            this.gameEffect.setEffectQuaternion(tempQuat);

            this.gameEffect.scaleEffectSize(size);

        } else {
            MATH.callAndClearAll(this.onArriveCallbacks, this.gameEffect);
        }
    }

    applyFrameToMovement(tpf, gameTime) {
        if (this.targetTime+tpf > gameTime) {
            this.interpolatePosition(tpf);
        }
    }

}

export { EffectSpatialTransition }