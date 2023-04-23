import { Vector3 } from "../../../libs/three/math/Vector3.js";

let tempVec3 = new Vector3();

let rgba = {
    r:1, g:1, b:1, a:1
}

let setRgba = function(r, g, b, a) {
    rgba.r = r;
    rgba.g = g;
    rgba.b = b;
    rgba.a = a;
}

let fxLanded = function(fx) {
    //    console.log("Fx arrives", fx)
}

let endOnLanded = function(fx) {
    fx.endEffectOfClass()
}

function fireBallEffect(gamePiece, dmg, attacker) {

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
        MATH.spreadVector(tempObj.position, tempVec3)

        setRgba(0.1, 0.1, -0.1, 0.1)
        efct.setEffectColorRGBA(rgba)

        efct.activateSpatialTransition(tempObj.position, efct.quat, ThreeAPI.tempVec3, tempObj.quaternion, 1 + 3*Math.random(), 2*Math.random(), 0.2+Math.random()*0.3, endOnLanded, 0.1)
    }

    for (let i = 0; i < 25; i++) {
        EffectAPI.buildEffectClassByConfigId('additive_stamps_8x8', 'effect_additive_pool',  effectCb)
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
        setRgba(0.12, 0.07, 0.01, 0.04)
        efct.setEffectColorRGBA(rgba)
        efct.activateSpatialTransition(tempObj.position, tempObj.quaternion, tempVec3, tempObj.quaternion, 0, 14, 0.3, endOnLanded, 0.1)

    }

    EffectAPI.buildEffectClassByConfigId('additive_stamps_8x8', 'effect_additive_pool',  shockwaveCb)


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
        setRgba(0.12, -0.07, 0.51, 0.14)
        efct.setEffectColorRGBA(rgba)
        efct.activateSpatialTransition(tempObj.position, tempObj.quaternion, tempVec3, tempObj.quaternion, 12, 0, 0.23, endOnLanded, 0.1)

    }

    EffectAPI.buildEffectClassByConfigId('additive_stamps_8x8', 'effect_additive_pool',  implosionCb)
}

function magicMissileEffect(gamePiece, hp, healer) {

    let applies = 0;
    let effectCb = function(efct) {

        let tempObj = ThreeAPI.tempObj;
        tempObj.position.copy(gamePiece.getPos());
        let size = gamePiece.getStatusByKey('size');
        tempObj.position.y += size*1.7
        tempObj.lookAt(ThreeAPI.getCamera().position);

        efct.quat.copy(tempObj.quaternion);
        tempVec3.copy(gamePiece.getPos());

        tempVec3.y = tempObj.position.y + 0.2+Math.sqrt(applies*0.2);

        ThreeAPI.tempVec3.set(Math.sqrt(applies*0.2), Math.sqrt(applies*0.2), Math.sqrt(applies*0.2))
        MATH.spreadVector(tempVec3, ThreeAPI.tempVec3)

        efct.setEffectSpriteXY(1+Math.floor(Math.random()*3), 7);

        efct.activateSpatialTransition(tempObj.position, efct.quat, tempVec3, tempObj.quaternion, size*0.1, size*0.5, 1.5, endOnLanded, 0.2)
        efct.activateEffectFromConfigId()
        applies ++;
    };

    for (let i = 0; i < hp; i++) {
        EffectAPI.buildEffectClassByConfigId('additive_stamps_8x8', 'effect_health_recovered',  effectCb)
    }


}

function webEffect(gamePiece) {
    let effectCb = function(efct) {
        efct.activateEffectFromConfigId()
        let tempObj = ThreeAPI.tempObj;
        tempObj.position.copy(gamePiece.getPos());
        let size = gamePiece.getStatusByKey('size');
        tempObj.position.y = -0.2
        ThreeAPI.tempVec3.set(size*0.2, size*0.75, size*0.2)
        tempObj.quaternion.set(0, 0, 0, 1);
        tempObj.lookAt(ThreeAPI.getCamera().position);
        //    MATH.spreadVector(tempObj.position, ThreeAPI.tempVec3)
        tempObj.rotateZ(3.14)
        efct.quat.copy(tempObj.quaternion);
        tempVec3.copy(gamePiece.getPos());
        tempVec3.y += 10000;
        tempObj.lookAt(tempVec3);

        tempVec3.y = 0.2;
        setRgba(0.7, 0.7, 0.7, 0.5)
        efct.setEffectColorRGBA(rgba)
        efct.setEffectSpriteXY(2, 5);
        //    MATH.spreadVector(tempVec3, ThreeAPI.tempVec3)
        efct.activateSpatialTransition(tempObj.position, efct.quat, tempVec3, tempObj.quaternion, size*0.6, size*2.0, 1.0, endOnLanded, 0.5)
    }

    // for (let i = 0; i < dmg; i++) {
    EffectAPI.buildEffectClassByConfigId('additive_stamps_8x8', 'effect_damage_taken',  effectCb)
    // }
}

export {
    fireBallEffect,
    magicMissileEffect,
    webEffect
}