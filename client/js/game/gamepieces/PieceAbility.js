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

    sendAbilityToTarget(target) {
        this.sendTime = GameAPI.getGameTime();
        this.arriveTime = this.sendTime+0.75;
        this.target = target;
        GameAPI.unregisterGameUpdateCallback(this.call.updateActivatedAbility)
        GameAPI.registerGameUpdateCallback(this.call.updateReleasedAbility)

    }

    applyAbilityToTarget(target) {
        CombatEffects.effectCalls()[this.config['apply_effect']](target, 25)
        this.gamePiece.setStatusValue('activeAbility', null)
        GameAPI.unregisterGameUpdateCallback(this.call.updateReleasedAbility)
        if (this.config['damage']) {
            let damage = this.config['damage'][this.abilityStatus.level];
            if (this.config['radius']) {
                let radius =  this.config['radius'];
                let hostiles = this.gamePiece.threatDetector.getHostilesNearInRangeFromPiece(target, radius)
                console.log(hostiles)
                for (let i = 0; i < hostiles.length; i++) {
                    let hp = hostiles[i].gamePiece.getStatusByKey('hp');
                    hp -= damage;
                    hostiles[i].gamePiece.setStatusValue('hp', hp);
                    hostiles[i].gamePiece.notifyDamageTaken(damage, this.gamePiece);
                }
            }
        }
    }
}

export { PieceAbility }