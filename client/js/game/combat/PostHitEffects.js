import * as CombatFxUtils from "./../combat/CombatFxUtils.js";
import { Vector3 } from "../../../libs/three/math/Vector3.js";
import { Object3D } from "../../../libs/three/core/Object3D.js";

let tempVec3 = new Vector3();
let tempObj3D = new Object3D();


function catchOnFire(gamePiece) {



    let effectCb = function(efct) {
        efct.activateEffectFromConfigId()
        let tempObj = ThreeAPI.tempObj;
        let jointId = gamePiece.getRandomJointId();

        let jointPos = function() {
            return gamePiece.getJointWorldPosition(jointId);
        }

        tempObj.position.copy(gamePiece.getJointWorldPosition(jointId));
        let size = gamePiece.getStatusByKey('size');
    //    tempObj.position.y += size*0.4
        ThreeAPI.tempVec3.set(size*0.2, size*0.75, size*0.2)
        tempObj.lookAt(ThreeAPI.getCamera().position);
        MATH.randomVector(ThreeAPI.tempVec3);
        ThreeAPI.tempVec3.multiplyScalar(size*0.5);
    //    MATH.spreadVector(tempObj.position, ThreeAPI.tempVec3)
        efct.quat.copy(tempObj.quaternion);

        tempObj.rotateZ(Math.random()*MATH.TWO_PI)

        MATH.randomVector(ThreeAPI.tempVec3);
        ThreeAPI.tempVec3.y = 0;
        ThreeAPI.tempVec3.multiplyScalar(size*0.5)

        efct.setEffectSpriteXY(3, 4);
        ThreeAPI.tempVec3.add(gamePiece.getPos())

        efct.setEffectColorRGBA(CombatFxUtils.setRgba(0.8, 0.7, 0.4, 0.8))
        let startSize = size*0.8;
        let endSize = size*0.8 + Math.random()*size*2.5
        let time = CombatFxUtils.setupLifecycle(efct, 1.5+Math.random()*2.2, 0.3, 0.4);

        efct.activateSpatialTransition(tempObj.position, efct.quat, tempObj.position, tempObj.quaternion, startSize, endSize, time, CombatFxUtils.endOnLanded, 0.2, 0, jointPos)
    }

    for (let i = 0; i < 5; i++) {
        EffectAPI.buildEffectClassByConfigId('additive_particles_8x8', 'particle_additive_pool',  effectCb)
    }
}

function residualMagic(gamePiece) {



    let effectCb = function(efct) {
        efct.activateEffectFromConfigId()
        let tempObj = ThreeAPI.tempObj;
        let jointId = gamePiece.getRandomJointId();

        let jointPos = function() {
        //    let jointId = gamePiece.getRandomJointId();
            return gamePiece.getJointWorldPosition(jointId);
        }

        tempObj.position.copy(gamePiece.getJointWorldPosition(jointId));
        let size = gamePiece.getStatusByKey('size');
        tempObj.position.y += size*0.4
        ThreeAPI.tempVec3.set(size*0.2, size*0.75, size*0.2)
        tempObj.lookAt(ThreeAPI.getCamera().position);

        efct.quat.copy(tempObj.quaternion);

        tempObj.rotateZ(Math.random()*MATH.TWO_PI)

        MATH.randomVector(ThreeAPI.tempVec3);
        ThreeAPI.tempVec3.y = 0;
        ThreeAPI.tempVec3.multiplyScalar(size*0.5)

   //     efct.setEffectSpriteXY(3, 4);
        ThreeAPI.tempVec3.add(tempObj.position)

        let startSize = size*0.8;
        let endSize = size*0.8 + Math.random()*size*2.5
        let time = CombatFxUtils.setupLifecycle(efct, 1.5+Math.random()*2.2, 0.3, 0.4);

        efct.activateSpatialTransition(ThreeAPI.tempVec3, efct.quat, ThreeAPI.tempVec3, tempObj.quaternion, startSize, endSize, time, CombatFxUtils.endOnLanded, 0.2, 0, jointPos)
    }

    for (let i = 0; i < 3; i++) {
        EffectAPI.buildEffectClassByConfigId('additive_particles_8x8', 'residual_magic_damage_effect',  effectCb)
    }
}


export {
    catchOnFire,
    residualMagic
}