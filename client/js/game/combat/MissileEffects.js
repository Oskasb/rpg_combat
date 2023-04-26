import * as CombatFxUtils from "./../combat/CombatFxUtils.js";
import { Vector3 } from "../../../libs/three/math/Vector3.js";
import { Object3D } from "../../../libs/three/core/Object3D.js";

let tempVec3 = new Vector3();
let tempObj3D = new Object3D();



function magicMissile(fromPos, gamePiece, index, onArriveCB, getPosFunc) {

    let distance = MATH.distanceBetween(fromPos, getPosFunc());
    let effectCb = function(efct) {

        efct.activateEffectFromConfigId()
        let tempObj = ThreeAPI.tempObj;
        tempObj.position.copy(fromPos);
        let size = gamePiece.getStatusByKey('size');
        tempObj.lookAt(ThreeAPI.getCamera().position);
        tempVec3.copy(gamePiece.getPos());
   //     efct.setEffectSpriteXY(1, 2);
        //    setRgba(0.39, 0.88, 0.91, 0.99)
        //    efct.setEffectColorRGBA(rgba)
        let startSize = 0.6;
        let endSize = 0.3 + Math.random()*0.8;
        let time = CombatFxUtils.setupLifecycle(efct, 0.12*(index+1) + 0.3*distance + 0.1, 0.3, 0.2);
        let spread = 0.06*(index)*distance + 0.02*distance
        if (MATH.isOddNumber(index)) {
            spread*=-1;
        }
        efct.activateSpatialTransition(fromPos, tempObj.quaternion, gamePiece.getPos(), tempObj.quaternion, startSize, endSize, time, onArriveCB, (1 - Math.abs(spread))*0.04*distance, spread, getPosFunc)
    }

    EffectAPI.buildEffectClassByConfigId('additive_stamps_8x8', 'magic_missile_projectile_effect',  effectCb)

}

function fireMissile(fromPos, gamePiece, index, onArriveCB, getPosFunc) {

    let distance = MATH.distanceBetween(fromPos, getPosFunc());
    let effectCb = function(efct) {

        efct.activateEffectFromConfigId()
        let tempObj = ThreeAPI.tempObj;
        tempObj.position.copy(fromPos);
        let size = gamePiece.getStatusByKey('size');
        tempVec3.copy(gamePiece.getPos());
        let startSize = 1.2;
        let endSize = 1.3 + Math.random()*0.5
        let time = CombatFxUtils.setupLifecycle(efct, 0.22*(index+1) + 0.2*distance + 0.1, 0.3, 0.3);
        let spread = 0.12*(index) + 0.12*distance
        if (MATH.isOddNumber(index)) {
            spread*=-1;
        }
        efct.activateSpatialTransition(fromPos, tempObj.quaternion, gamePiece.getPos(), tempObj.quaternion, startSize, endSize, time, onArriveCB, (2 - Math.abs(spread))*0.1*distance, spread, getPosFunc)
    }

    //   for (let i = 0; i < 2; i++) {
    EffectAPI.buildEffectClassByConfigId('additive_particles_8x8', 'fire_missile_particle_additive_pool',  effectCb)
    //   }

}

function healingMissile(fromPos, gamePiece, index, onArriveCB, getPosFunc) {

    let distance = MATH.distanceBetween(fromPos, getPosFunc());
    let effectCb = function(efct) {

        efct.activateEffectFromConfigId()
        let tempObj = ThreeAPI.tempObj;

        let bone = gamePiece.getRandomBone();

        let bonePos = function() {
            //    let jointId = gamePiece.getRandomJointId();
            return gamePiece.getBoneWorldPosition(bone);
        }

        tempObj.position.copy(gamePiece.getBoneWorldPosition(bone));

        let size = gamePiece.getStatusByKey('size');
        tempObj.lookAt(ThreeAPI.getCamera().position);
        tempVec3.copy(gamePiece.getPos());
        efct.setEffectSpriteXY(0, 2);

            efct.setEffectColorRGBA(CombatFxUtils.setRgba(-0.39, 0.99, -0.21, 0.99))
        let startSize = 0.6;
        let endSize = 0.3 + Math.random()*0.8;
        let time = CombatFxUtils.setupLifecycle(efct, 0.22*(index) + 0.3*distance + 0.2, 0.3, 0.2);
        let spread = 0.32*(index) + 0.1*distance
        if (MATH.isOddNumber(index)) {
            spread*=-1;
        }
        efct.activateSpatialTransition(fromPos, tempObj.quaternion, gamePiece.getPos(), tempObj.quaternion, startSize, endSize, time, onArriveCB, (2 - Math.abs(spread))*0.5, spread, bonePos)
    }

    EffectAPI.buildEffectClassByConfigId('additive_particles_8x8', 'particle_additive_pool',  effectCb)

}

export {
    magicMissile,
    fireMissile,
    healingMissile
}