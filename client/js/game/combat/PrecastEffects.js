import * as CombatFxUtils from "./../combat/CombatFxUtils.js";
import { Vector3 } from "../../../libs/three/math/Vector3.js";
import { Object3D } from "../../../libs/three/core/Object3D.js";

let tempVec3 = new Vector3();
let tempObj3D = new Object3D();


function handsOnFire(gamePiece, obj3d) {

    let effectCb = function(efct) {
        efct.activateEffectFromConfigId()
        let tempObj = ThreeAPI.tempObj;
        tempObj.position.copy(obj3d.position);
        let size = gamePiece.getStatusByKey('size');
        //    tempObj.position.y += size*0.3
        ThreeAPI.tempVec3.copy(obj3d.scale)
        ThreeAPI.tempVec3.multiplyScalar(size*0.1);
        tempObj.lookAt(ThreeAPI.getCamera().position);
        MATH.spreadVector(tempObj.position, ThreeAPI.tempVec3)
        efct.quat.copy(tempObj.quaternion);

        tempObj.rotateZ(Math.random()*MATH.TWO_PI)

        MATH.randomVector(ThreeAPI.tempVec3);
        ThreeAPI.tempVec3.multiplyScalar(0.3)
        ThreeAPI.tempVec3.y = Math.abs(ThreeAPI.tempVec3.y);
        efct.setEffectSpriteXY(3, 4);
        ThreeAPI.tempVec3.add(tempObj.position)

        tempVec3.set(size, size, size);
        MATH.randomVector(tempVec3);
        tempVec3.multiplyScalar(size)
        //     MATH.spreadVector(tempObj.position, tempVec3)


        efct.setEffectColorRGBA(CombatFxUtils.setRgba(0.6, 0.5, 0.4, 0.3))

        let startSize = size*0.2;
        let endSize = size*0.8 + Math.random()*size*1.5
        let time = CombatFxUtils.setupLifecycle(efct, 0.3+Math.random()*0.3, 0.7, 0.4);

        efct.activateSpatialTransition(tempObj.position, efct.quat, ThreeAPI.tempVec3, tempObj.quaternion, startSize, endSize, time, CombatFxUtils.endOnLanded, 0.1)
    }

    for (let i = 0; i < 2; i++) {
        EffectAPI.buildEffectClassByConfigId('additive_particles_8x8', 'particle_additive_pool',  effectCb)
    }

    let shockwaveCb = function(efct) {
        efct.activateEffectFromConfigId()
        let tempObj = ThreeAPI.tempObj;
        tempObj.position.copy(obj3d.position);
        let size = gamePiece.getStatusByKey('size');
        tempObj.lookAt(ThreeAPI.getCamera().position);
        tempVec3.copy(gamePiece.getPos());
        efct.setEffectSpriteXY(0, 0);

        efct.setEffectColorRGBA(CombatFxUtils.setRgba(0.82, 0.67, 0.31, 0.8))
        let startSize = size*0.6;
        let endSize = size*0.8 + Math.random()*size*0.2
        let time = CombatFxUtils.setupLifecycle(efct, 0.2, 0.1, 0.2);
        efct.activateSpatialTransition(obj3d.position, tempObj.quaternion, obj3d.position, tempObj.quaternion, startSize, endSize, time, CombatFxUtils.endOnLanded, 0.1)
    }

    EffectAPI.buildEffectClassByConfigId('additive_stamps_8x8', 'stamp_additive_pool',  shockwaveCb)

}


function magicPowerHands(gamePiece, obj3d) {

    let effectCb = function(efct) {
        efct.activateEffectFromConfigId()
        let tempObj = ThreeAPI.tempObj;
        tempObj.position.copy(obj3d.position);
        let size = gamePiece.getStatusByKey('size');
        //    tempObj.position.y += size*0.3
        ThreeAPI.tempVec3.copy(obj3d.scale)
        ThreeAPI.tempVec3.multiplyScalar(size*0.1);
        tempObj.lookAt(ThreeAPI.getCamera().position);
        MATH.spreadVector(tempObj.position, ThreeAPI.tempVec3)
        efct.quat.copy(tempObj.quaternion);

        tempObj.rotateZ(Math.random()*MATH.TWO_PI)

        MATH.randomVector(ThreeAPI.tempVec3);
        ThreeAPI.tempVec3.multiplyScalar(0.3)
        ThreeAPI.tempVec3.y = Math.abs(ThreeAPI.tempVec3.y);
        efct.setEffectSpriteXY(3, 3);
        ThreeAPI.tempVec3.add(tempObj.position)

        tempVec3.set(size, size, size);
        MATH.randomVector(tempVec3);
        tempVec3.multiplyScalar(size)
        //     MATH.spreadVector(tempObj.position, tempVec3)


        efct.setEffectColorRGBA(CombatFxUtils.setRgba(0.6, 0.5, 0.9, 0.9))

        let startSize = size*0.5;
        let endSize = size*1.8 + Math.random()*size*1.5
        let time = CombatFxUtils.setupLifecycle(efct, 0.3+Math.random()*0.3, 0.7, 0.4);

        efct.activateSpatialTransition(tempObj.position, efct.quat, ThreeAPI.tempVec3, tempObj.quaternion, startSize, endSize, time, CombatFxUtils.endOnLanded, 0.1)
    }

    for (let i = 0; i < 2; i++) {
        EffectAPI.buildEffectClassByConfigId('additive_particles_8x8', 'particle_additive_pool',  effectCb)
    }

    let shockwaveCb = function(efct) {
        efct.activateEffectFromConfigId()
        let tempObj = ThreeAPI.tempObj;
        tempObj.position.copy(obj3d.position);
        let size = gamePiece.getStatusByKey('size');
        tempObj.lookAt(ThreeAPI.getCamera().position);
        tempVec3.copy(gamePiece.getPos());
        efct.setEffectSpriteXY(4, 0);

        efct.setEffectColorRGBA(CombatFxUtils.setRgba(0.32, 0.77, 0.99, 0.99))
        let startSize = size*0.2;
        let endSize = MATH.randomBetween(0.5, 1.8)*size
        let time = CombatFxUtils.setupLifecycle(efct, MATH.randomBetween(0.2, 0.4), 0.4, 0.5);
        efct.activateSpatialTransition(obj3d.position, tempObj.quaternion, obj3d.position, tempObj.quaternion, startSize, endSize, time, CombatFxUtils.endOnLanded, MATH.randomBetween(-0.1, 0.1), MATH.randomBetween(-0.1, 0.1))
    }

    EffectAPI.buildEffectClassByConfigId('additive_particles_8x8', 'stamp_additive_pool',  shockwaveCb)

}

export {
    handsOnFire,
    magicPowerHands
}