import * as CombatEffects from "./../combat/CombatEffects.js";
import { Vector3 } from "../../../libs/three/math/Vector3.js";
import { Object3D } from "../../../libs/three/core/Object3D.js";

let tempVec3 = new Vector3();
let tempObj3D = new Object3D();

class PieceAbility {
    constructor(gamePiece, abilityId, config) {
        this.warmup = 0;
        this.gamePiece = gamePiece;
        this.abilityId = abilityId;
        this.config = config;
        this.abilityStatus = {};

        this.sendTime = 0;
        this.arriveTime = 0;
        this.target = null;

        let activateAbility = function() {
            this.activatePieceAbility()
        }.bind(this)
        let updateReleasedAbility = function() {
            this.updateReleasedAbility()
        }.bind(this)
        let updateActivatedAbility = function() {
            this.updateActivatedAbility()
        }.bind(this)
        this.call = {
            activatePieceAbility:activateAbility,
            updateReleasedAbility:updateReleasedAbility,
            updateActivatedAbility:updateActivatedAbility
        }

    }

    setAbilityStatus(abilityStatus) {
        for (let key in abilityStatus) {
            this.abilityStatus[key] = abilityStatus[key];
        }
    }

    activatePieceAbility() {
        console.log("Call Activate Ability", this);
        GameAPI.registerGameUpdateCallback(this.call.updateActivatedAbility)
        this.gamePiece.setStatusValue('activeAbility', this)

        this.warmup = GameAPI.getGameTime();

    }

    updateActivatedAbility() {
        this.gamePiece.getModel().getJointKeyWorldTransform('HAND_R', tempObj3D)
        CombatEffects.effectCalls()[this.config['activated_effect']](this.gamePiece, tempObj3D)
        this.gamePiece.getModel().getJointKeyWorldTransform('HAND_L', tempObj3D)
        CombatEffects.effectCalls()[this.config['activated_effect']](this.gamePiece, tempObj3D)


        if (this.gamePiece.getTarget() && GameAPI.getGameTime() - this.warmup > 0.5) {
            this.sendAbilityToTarget(this.gamePiece.getTarget())
        }

    }

    updateReleasedAbility() {

        let fraction = MATH.calcFraction(this.sendTime, this.arriveTime, GameAPI.getGameTime());

        if (fraction < 1) {
            this.gamePiece.getModel().getJointKeyWorldTransform('HAND_R', tempObj3D)
            tempVec3.copy(this.target.getPos())
            tempVec3.y += this.target.getStatusByKey('size')* 0.7;
            MATH.interpolateVec3FromTo(tempObj3D.position, tempVec3, fraction, tempObj3D.position)
            CombatEffects.effectCalls()[this.config['activated_effect']](this.gamePiece, tempObj3D)
        } else {
            this.applyAbilityToTarget(this.target)
        }

    }

    activateAbilityMissile(target, index) {

        let onArriveCb = function(fx) {
            fx.endEffectOfClass()
            this.applyAbilityToTarget(this.target)
        }.bind(this);
        this.gamePiece.getModel().getJointKeyWorldTransform('HAND_R', tempObj3D)
        CombatEffects.effectCalls()[this.config['missile_effect']](tempObj3D.position, target, index, onArriveCb, target.getPos)
    }

    sendAbilityToTarget(target) {
        GameAPI.unregisterGameUpdateCallback(this.call.updateActivatedAbility)
        this.sendTime = GameAPI.getGameTime();
        this.arriveTime = this.sendTime+0.75;
        this.target = target;
        let missileCount = 1;
        if (this.config['missiles']) {
            if (typeof(this.config['missiles'] === 'array')) {
                missileCount = this.config['missiles'][this.abilityStatus.level];
            }
        }
        for (let i = 0; i < missileCount; i++) {
            this.activateAbilityMissile(target, i);
        }

    }

    applyAbilityDamageToTarget(targetPiece) {
        let damage = this.config['damage'][this.abilityStatus.level];
        CombatEffects.effectCalls()[this.config['damage_effect']](targetPiece)
        let hp = targetPiece.getStatusByKey('hp');
        hp -= damage;
        targetPiece.setStatusValue('hp', hp);
        targetPiece.notifyDamageTaken(damage, this.gamePiece);

    }

    applyDamageAtRadiusFromTarget(radius, target) {
        let hostiles = this.gamePiece.threatDetector.getHostilesNearInRangeFromPiece(target, radius)
        for (let i = 0; i < hostiles.length; i++) {
            let hostile = hostiles[i].gamePiece;
            if (!hostile.isDead) {
                if (hostile !== target) {
                    this.applyAbilityDamageToTarget(hostile);
                    tempObj3D.position.copy(hostile.getPos());
                    tempObj3D.position.y = target.getPos().y;
                    tempObj3D.lookAt(target.getPos());
                    hostile.getSpatial().stickToObj3D(tempObj3D);
                }
            }
        }
    }

    applyAbilityToTarget(target) {
        CombatEffects.effectCalls()[this.config['apply_effect']](target)
        this.gamePiece.setStatusValue('activeAbility', null)
        if (this.config['damage']) {
            this.applyAbilityDamageToTarget(target);
            let radius =  this.config['radius'];
            if (radius) {
                this.applyDamageAtRadiusFromTarget(radius, target)
            }
        }
    }
}

export { PieceAbility }