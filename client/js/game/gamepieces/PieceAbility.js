import * as CombatEffects from "./../combat/feedback/CombatEffects.js";
import { Vector3 } from "./../../../libs/three/math/Vector3.js";
import { Object3D } from "./../../../libs/three/core/Object3D.js";

let tempVec3 = new Vector3();
let tempObj3D = new Object3D();

class PieceAbility {
    constructor(gamePiece, abilityId, config) {
        this.warmup = 0;
        this.gamePiece = gamePiece;
        this.abilityId = abilityId;
        this.config = config;
        this.abilityStatus = {};

        this.status = {};

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

        let isActivated = function() {
            if (this.getAbilityTarget()) {
                return true;
            }
        }.bind(this);

        let getProgressStatus = function() {
            return MATH.clamp(Math.sin(GuiAPI.getUiSystemTime()*3), 0, 1)
        }.bind(this);

        let getCooldownStatus = function() {
            return MATH.clamp(Math.cos(GuiAPI.getUiSystemTime()*3), 0, 1)
        }.bind(this);

        let getIsAvailable = function() {
            return MATH.clamp(Math.cos(GuiAPI.getUiSystemTime()*6.2), 0, 1)
        }.bind(this);

        this.call = {
            getProgressStatus:getProgressStatus,
            getCooldownStatus:getCooldownStatus,
            getIsAvailable:getIsAvailable,
            isActivated:isActivated,
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

    setAbilityTarget(target) {
        this.target=target;
    }
    getAbilityTarget() {
        return this.target;
    }

    activatePieceAbility() {
        console.log("Call Activate Ability", this);
        GameAPI.registerGameUpdateCallback(this.call.updateActivatedAbility)
        this.gamePiece.setStatusValue('activeAbility', this)

        this.warmup = GameAPI.getGameTime();

    }

    selectMostHurtFriend(friends) {
        let status = 10;
        let friend = null;
        for (let i = 0; i < friends.length; i++) {
            let piece = friends[i].gamePiece;

            let hp = piece.getStatusByKey('hp');
            let maxHP = piece.getStatusByKey('maxHP');
            let fraction = MATH.calcFraction(0, maxHP, hp);
            if (fraction < status) {
                friend = piece;
                status = fraction;
            }

        }
        return friend;
    }

    updateActivatedAbility() {
        this.gamePiece.getModel().getJointKeyWorldTransform('HAND_R', tempObj3D)
        CombatEffects.effectCalls()[this.config['precast_effect']](this.gamePiece, tempObj3D)
        this.gamePiece.getModel().getJointKeyWorldTransform('HAND_L', tempObj3D)
        CombatEffects.effectCalls()[this.config['precast_effect']](this.gamePiece, tempObj3D)

        if (this.config.target === 'friendly' && GameAPI.getGameTime() - this.warmup > 0.5) {
            let friends = this.gamePiece.threatDetector.getFriendliesInRangeOf(this.gamePiece, this.config.range)
            if (this.config.heal) {
                let friendlyTarget = this.selectMostHurtFriend(friends)
                this.setAbilityTarget(friendlyTarget)
                this.sendAbilityToTarget()
            } else {
                console.log("No targeting function for ability: ", this);
                GameAPI.unregisterGameUpdateCallback(this.call.updateActivatedAbility)
                return;
            }

        } else if (this.gamePiece.getTarget() && GameAPI.getGameTime() - this.warmup > 0.5) {
            this.setAbilityTarget(this.gamePiece.getTarget())
            this.sendAbilityToTarget()
        }

    }

    updateReleasedAbility() {

        let fraction = MATH.calcFraction(this.sendTime, this.arriveTime, GameAPI.getGameTime());

        if (fraction < 1) {
            this.gamePiece.getModel().getJointKeyWorldTransform('HAND_R', tempObj3D)
            tempVec3.copy(this.target.getPos())
            tempVec3.y += this.target.getStatusByKey('size')* 0.7;
            MATH.interpolateVec3FromTo(tempObj3D.position, tempVec3, fraction, tempObj3D.position)
            CombatEffects.effectCalls()[this.config['precast_effect']](this.gamePiece, tempObj3D)
        } else {
            this.applyAbilityToTarget(this.target)
        }

    }

    activateAbilityMissile(index) {
        let target = this.getAbilityTarget();
        let onArriveCb = function(fx) {
            fx.endEffectOfClass()
            this.applyAbilityToTarget()
        }.bind(this);
        this.gamePiece.getModel().getJointKeyWorldTransform('HAND_R', tempObj3D)
        CombatEffects.effectCalls()[this.config['missile_effect']](tempObj3D.position, target, index, onArriveCb, target.getCenterMass)
    }

    sendAbilityToTarget() {
        GameAPI.unregisterGameUpdateCallback(this.call.updateActivatedAbility)
        this.sendTime = GameAPI.getGameTime();
        this.arriveTime = this.sendTime+0.75;
        let missileCount = 1;
        if (this.config['missiles']) {
            if (typeof(this.config['missiles'] === 'array')) {
                missileCount = this.config['missiles'][this.abilityStatus.level];
            }
        }
        for (let i = 0; i < missileCount; i++) {
            this.activateAbilityMissile(i);
        }

    }

    processAbilityDamage() {
        if (this.config['damage']) {
           return this.config['damage'][this.abilityStatus.level];
        }

        if (this.config['heal']) {
            return this.config['heal'][this.abilityStatus.level];
        }
    }

    processAbilityStatusModifier(targetPiece) {
        let statusModifier = this.config['modify_target_status'];
        let statusId = statusModifier['status'];
        let duration = statusModifier['duration'][this.abilityStatus.level];
        targetPiece.applyStatusModifier(statusId, duration)
    }

    applyAbilityDamageToTarget(targetPiece) {
        let hpModifier = this.processAbilityDamage();

        CombatEffects.effectCalls()[this.config['post_hit_effect']](targetPiece)

        if (this.config['modify_target_status']) {
            this.processAbilityStatusModifier(targetPiece);
        }

        if (this.config['heal']) {
            targetPiece.applyHeal(hpModifier, this.gamePiece);
        }

        if (this.config['damage']) {
            targetPiece.applyDamage(hpModifier, this.gamePiece);
        }

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

    applyAbilityToTarget() {
        let target = this.getAbilityTarget();
        CombatEffects.effectCalls()[this.config['on_hit_effect']](target)
        this.gamePiece.setStatusValue('activeAbility', null)
        //if (this.config['damage']) {
            this.applyAbilityDamageToTarget(target);
            let radius =  this.config['radius'];
            if (radius) {
                this.applyDamageAtRadiusFromTarget(radius, target)
            }
        //}


    }
}

export { PieceAbility }