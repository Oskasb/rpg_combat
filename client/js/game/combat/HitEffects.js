import * as CombatFxUtils from "./../combat/CombatFxUtils.js";
import * as CombatFxOptions from "./../combat/CombatFxOptions.js";
import { Vector3 } from "../../../libs/three/math/Vector3.js";
import { Object3D } from "../../../libs/three/core/Object3D.js";

let tempVec3 = new Vector3();
let tempObj3D = new Object3D();


function fireBall(gamePiece) {

    let effectCb = function(efct) {
        efct.activateEffectFromConfigId()
        let tempObj = ThreeAPI.tempObj;
        tempObj.position.copy(gamePiece.getPos());
        let size = gamePiece.getStatusByKey('size');
        tempObj.position.y += size*0.8
        ThreeAPI.tempVec3.set(size*0.2, size*0.75, size*0.2)
        tempObj.lookAt(ThreeAPI.getCamera().position);
        MATH.spreadVector(tempObj.position, ThreeAPI.tempVec3)
        efct.quat.copy(tempObj.quaternion);

        tempObj.rotateZ(Math.random()*MATH.TWO_PI)

        MATH.randomVector(ThreeAPI.tempVec3);
        ThreeAPI.tempVec3.multiplyScalar(2)
        ThreeAPI.tempVec3.y = Math.abs(ThreeAPI.tempVec3.y);
        efct.setEffectSpriteXY(3, 4);
        ThreeAPI.tempVec3.add(tempObj.position)

        tempVec3.set(size, size, size);
        MATH.randomVector(tempVec3);
        tempVec3.multiplyScalar(size)
        //     MATH.spreadVector(tempObj.position, tempVec3)


        efct.setEffectColorRGBA(CombatFxUtils.setRgba(0.6, 0.5, 0.4, 0.3))

        let time = CombatFxUtils.setupLifecycle(efct, 0.7+Math.random()*0.2, 0.7, 0.4);

        efct.activateSpatialTransition(tempObj.position, efct.quat, ThreeAPI.tempVec3, tempObj.quaternion, 1 + 3*Math.random(), 2+ 2*Math.random(), time, CombatFxUtils.endOnLanded, 0.1)
    }

    for (let i = 0; i < 25; i++) {
        EffectAPI.buildEffectClassByConfigId('additive_particles_8x8', 'particle_additive_pool',  effectCb)
    }

    let shockwaveCb = function(efct) {
        efct.activateEffectFromConfigId()
        let tempObj = ThreeAPI.tempObj;
        tempObj.position.copy(gamePiece.getPos());
        let size = gamePiece.getStatusByKey('size');
        tempObj.position.y += size*0.7;
        tempVec3.y += 10000;
        tempObj.lookAt(tempVec3);
        tempVec3.copy(gamePiece.getPos());
        tempVec3.y = tempObj.position.y;
        efct.setEffectSpriteXY(0, 0);

        efct.setEffectColorRGBA(CombatFxUtils.setRgba(0.82, 0.67, 0.31, 0.4))
        let time = CombatFxUtils.setupLifecycle(efct, 0.45, 0.1, 0.9);
        efct.activateSpatialTransition(tempObj.position, tempObj.quaternion, tempVec3, tempObj.quaternion, 0, 14, time, CombatFxUtils.endOnLanded, 0.1)

    }

    EffectAPI.buildEffectClassByConfigId('additive_stamps_8x8', 'stamp_additive_pool',  shockwaveCb)


    let implosionCb = function(efct) {
        efct.activateEffectFromConfigId()
        let tempObj = ThreeAPI.tempObj;
        tempObj.position.copy(gamePiece.getPos());
        let size = gamePiece.getStatusByKey('size');
        tempObj.position.y += size*0.7;
        tempVec3.y += 10000;
        tempObj.lookAt(tempVec3);
        tempVec3.copy(gamePiece.getPos());
        tempVec3.y = tempObj.position.y;
        efct.setEffectSpriteXY(1, 1);

        efct.setEffectColorRGBA(CombatFxUtils.setRgba(0.12, -0.07, 0.51, 0.4))
        efct.activateSpatialTransition(tempObj.position, tempObj.quaternion, tempVec3, tempObj.quaternion, 12, 0, 0.23, CombatFxUtils.endOnLanded, 0.1)

    }

    EffectAPI.buildEffectClassByConfigId('additive_stamps_8x8', 'stamp_additive_pool',  implosionCb)
}

function magicHit(gamePiece) {

    let effectCb = function(efct) {
        efct.activateEffectFromConfigId()
        let tempObj = ThreeAPI.tempObj;
        tempObj.position.copy(gamePiece.getCenterMass());
        tempObj.lookAt(ThreeAPI.getCamera().position);
        efct.quat.copy(tempObj.quaternion);

        tempObj.rotateZ(Math.random()*MATH.TWO_PI)

        MATH.randomVector(ThreeAPI.tempVec3);
        ThreeAPI.tempVec3.multiplyScalar(2)
        ThreeAPI.tempVec3.y = Math.abs(ThreeAPI.tempVec3.y);
        efct.setEffectSpriteXY(4, 3);
        ThreeAPI.tempVec3.add(tempObj.position)

        //     MATH.spreadVector(tempObj.position, tempVec3)
        let fromSize = 0;
        let toSize = MATH.randomBetween(0.4, 2);

        efct.setEffectColorRGBA(CombatFxUtils.setRgba(0.4, 0.7, 0.9, 0.6))

        let time = CombatFxUtils.setupLifecycle(efct, 0.4+Math.random()*0.3, 0.03, 0.4);

        efct.activateSpatialTransition(ThreeAPI.tempVec3, efct.quat, gamePiece.getCenterMass(), efct.quat, fromSize, toSize, time, CombatFxUtils.endOnLanded, 0.1)
    }

    for (let i = 0; i < 12; i++) {
        EffectAPI.buildEffectClassByConfigId('additive_particles_8x8', 'particle_additive_pool',  effectCb)
    }

    let shockwaveCb = function(efct) {
        efct.activateEffectFromConfigId()
        let tempObj = ThreeAPI.tempObj;
        tempObj.position.copy(gamePiece.getPos());
        let size = gamePiece.getStatusByKey('size');
        tempObj.position.y += size*0.7;
        tempObj.lookAt(ThreeAPI.getCamera().position);
        tempVec3.copy(gamePiece.getPos());
        tempVec3.y = tempObj.position.y;
        efct.setEffectSpriteXY(0, 0);
        let fromSize = 0.3;
        let toSize = 6
        efct.setEffectColorRGBA(CombatFxUtils.setRgba(0.42, 0.67, 0.99, 0.99))
        let time = CombatFxUtils.setupLifecycle(efct, 0.35, 0.5, 0.6);
        efct.activateSpatialTransition(tempObj.position, tempObj.quaternion, tempVec3, tempObj.quaternion, fromSize, toSize, time, CombatFxUtils.endOnLanded, 0.1)

    }

    EffectAPI.buildEffectClassByConfigId('additive_stamps_8x8', 'stamp_additive_pool',  shockwaveCb)


    let implosionCb = function(efct) {
        efct.activateEffectFromConfigId()
        let tempObj = ThreeAPI.tempObj;
        tempObj.position.copy(gamePiece.getPos());
        let size = gamePiece.getStatusByKey('size');
        tempObj.position.y += size*0.7;
        tempVec3.y += 10000;
        tempObj.lookAt(tempVec3);
        tempVec3.copy(gamePiece.getPos());
        tempVec3.y = tempObj.position.y;
        efct.setEffectSpriteXY(1, 1);

        efct.setEffectColorRGBA(CombatFxUtils.setRgba(0.32, -0.17, 0.99, 0.9))
        let fromSize = 4 // MATH.randomBetween(4, 6)
        let toSize = 2;

        let time = CombatFxUtils.setupLifecycle(efct, 0.3, 0.02, 0.14);

        efct.activateSpatialTransition(tempObj.position, tempObj.quaternion, tempVec3, tempObj.quaternion, fromSize, toSize, time, CombatFxUtils.endOnLanded, 0.1)

    }

    EffectAPI.buildEffectClassByConfigId('additive_stamps_8x8', 'stamp_additive_pool',  implosionCb)
}

function healHit(gamePiece) {

    let effectCb = function(efct) {
        efct.activateEffectFromConfigId()
        let tempObj = ThreeAPI.tempObj;
        tempObj.position.copy(gamePiece.getCenterMass());
        tempObj.lookAt(ThreeAPI.getCamera().position);
        efct.quat.copy(tempObj.quaternion);

        tempObj.rotateZ(Math.random()*MATH.TWO_PI)

        MATH.randomVector(ThreeAPI.tempVec3);
        ThreeAPI.tempVec3.multiplyScalar(2)
        ThreeAPI.tempVec3.y = Math.abs(ThreeAPI.tempVec3.y);
        efct.setEffectSpriteXY(4, 3);
        ThreeAPI.tempVec3.add(tempObj.position)

        //     MATH.spreadVector(tempObj.position, tempVec3)
        let fromSize = 0;
        let toSize = MATH.randomBetween(0.8, 2);

        efct.setEffectColorRGBA(CombatFxUtils.setRgba(-0.3, 0.9, -0.3, 0.5))

        let time = CombatFxUtils.setupLifecycle(efct, 0.2+Math.random()*0.2, 0.13, 0.4);

        efct.activateSpatialTransition(ThreeAPI.tempVec3, efct.quat, gamePiece.getCenterMass(), efct.quat, fromSize, toSize, time, CombatFxUtils.endOnLanded, 0.1)
    }

    for (let i = 0; i < 3; i++) {
        EffectAPI.buildEffectClassByConfigId('additive_particles_8x8', 'particle_additive_pool',  effectCb)
    }

    let shockwaveCb = function(efct) {
        efct.activateEffectFromConfigId()
        let tempObj = ThreeAPI.tempObj;
        tempObj.position.copy(gamePiece.getPos());
        let size = gamePiece.getStatusByKey('size');
        tempObj.position.y += size*0.7;
        tempObj.lookAt(ThreeAPI.getCamera().position);
        tempVec3.copy(gamePiece.getPos());
        tempVec3.y = tempObj.position.y;
        efct.setEffectColorRGBA(CombatFxUtils.setRgba(-0.3, 0.7, -0.3, 0.5))
        efct.setEffectSpriteXY(3, 0);
        let fromSize = 3.3;
        let toSize = 0
        efct.setEffectColorRGBA(CombatFxUtils.setRgba(0.42, 0.67, 0.99, 0.99))
        let time = CombatFxUtils.setupLifecycle(efct, 0.25, 0.5, 0.6);
        efct.activateSpatialTransition(tempObj.position, tempObj.quaternion, tempVec3, tempObj.quaternion, fromSize, toSize, time, CombatFxUtils.endOnLanded, 0.1)

    }

    EffectAPI.buildEffectClassByConfigId('additive_stamps_8x8', 'stamp_additive_pool',  shockwaveCb)


    let implosionCb = function(efct) {
        efct.activateEffectFromConfigId()
        let tempObj = ThreeAPI.tempObj;
        tempObj.position.copy(gamePiece.getPos());
        let size = gamePiece.getStatusByKey('size');
        tempObj.position.y += size*0.7;
        tempVec3.y += 10000;
        tempObj.lookAt(tempVec3);
        tempVec3.copy(gamePiece.getPos());
        tempVec3.y = tempObj.position.y;
        efct.setEffectSpriteXY(1, 0);

        efct.setEffectColorRGBA(CombatFxUtils.setRgba(-0.2, 0.77, -0.2, 0.5))
        let fromSize = 4 // MATH.randomBetween(4, 6)
        let toSize = 1;

        let time = CombatFxUtils.setupLifecycle(efct, 0.4, 0.02, 0.14);

        efct.activateSpatialTransition(tempObj.position, tempObj.quaternion, tempVec3, tempObj.quaternion, fromSize, toSize, time, CombatFxUtils.endOnLanded, 0.1)

    }

    EffectAPI.buildEffectClassByConfigId('additive_stamps_8x8', 'stamp_additive_pool',  implosionCb)
}

export {
    fireBall,
    magicHit,
    healHit
}