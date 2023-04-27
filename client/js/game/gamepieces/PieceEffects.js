import * as CombatFxUtils from "./../combat/CombatFxUtils.js";
import * as CombatFxOptions from "./../combat/CombatFxOptions.js";
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

function damageEffect(gamePiece, dmg) {

    let effectCb = function(efct) {
        efct.activateEffectFromConfigId()
        let options = CombatFxOptions.setupOptsBoneToGround(efct, gamePiece)
        efct.activateSpatialTransition(options)
    }

    for (let i = 0; i < dmg; i++) {
        EffectAPI.buildEffectClassByConfigId('additive_stamps_8x8', 'effect_damage_taken',  effectCb)
    }
}

function healEffect(gamePiece, hp, healer) {

    let applies = 0;
    let effectCb = function(efct) {
        efct.activateEffectFromConfigId()
        let options = CombatFxOptions.setupOptsSprayUpwards(efct, gamePiece, applies)
        efct.setEffectSpriteXY(1+Math.floor(Math.random()*3), 7);
        efct.activateSpatialTransition(options)
        applies ++;
    };

    for (let i = 0; i < hp; i++) {
        EffectAPI.buildEffectClassByConfigId('additive_stamps_8x8', 'effect_health_recovered',  effectCb)
    }
}

function deathEffect(gamePiece) {
    let size = gamePiece.getStatusByKey('size');
    let effectCb = function(efct) {
        efct.activateEffectFromConfigId()
        let options = CombatFxOptions.setupOptsSproutFromGround(efct, gamePiece.getPos(), size)
        efct.setEffectColorRGBA(CombatFxUtils.setRgba(0.7, 0.7, 0.7, 0.5))
        efct.setEffectSpriteXY(2, 5);
        efct.activateSpatialTransition(options)
    }

    EffectAPI.buildEffectClassByConfigId('additive_stamps_8x8', 'effect_damage_taken',  effectCb)

}

export {
    damageEffect,
    healEffect,
    deathEffect
}