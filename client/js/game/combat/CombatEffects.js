import * as PostHitEffects from "./../combat/PostHitEffects.js";
import * as HitEffects from "./../combat/HitEffects.js";
import * as MissileEffects from "./../combat/MissileEffects.js";
import * as PrecastEffects from "./../combat/PrecastEffects.js";
import {magicPowerHands} from "./../combat/PrecastEffects.js";
import {residualMagic} from "./../combat/PostHitEffects.js";


function effectCalls() {
    return {
        combat_effect_fireball:HitEffects.fireBall,
        combat_effect_magic_hit:HitEffects.magicHit,
        combat_effect_fire_missile:MissileEffects.fireMissile,
        combat_effect_magic_missile:MissileEffects.magicMissile,
        combat_effect_hands_fire:PrecastEffects.handsOnFire,
        combat_effect_hands_magic_power:PrecastEffects.magicPowerHands,
        damage_effect_catch_on_fire:PostHitEffects.catchOnFire,
        damage_effect_magic_residual:PostHitEffects.residualMagic
    }
}

export {
    effectCalls
}