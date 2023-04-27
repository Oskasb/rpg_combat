import * as PostHitEffects from "./../combat/PostHitEffects.js";
import * as HitEffects from "./../combat/HitEffects.js";
import * as MissileEffects from "./../combat/MissileEffects.js";
import * as PrecastEffects from "./../combat/PrecastEffects.js";


function effectCalls() {
    return {

        combat_effect_hands_fire:PrecastEffects.handsOnFire,
        combat_effect_fire_missile:MissileEffects.fireMissile,
        combat_effect_fireball:HitEffects.fireBall,
        damage_effect_catch_on_fire:PostHitEffects.catchOnFire,

        combat_effect_hands_magic_power:PrecastEffects.magicPowerHands,
        combat_effect_magic_missile:MissileEffects.magicMissile,
        combat_effect_magic_hit:HitEffects.magicHit,
        damage_effect_magic_residual:PostHitEffects.residualMagic,

        combat_effect_hands_heal_power:PrecastEffects.healPowerHands,
        combat_effect_heal_missile:MissileEffects.healingMissile,
        combat_effect_heal_apply:HitEffects.healHit,
        damage_effect_heal_residual:PostHitEffects.residualHeal
    }
}

export {
    effectCalls
}