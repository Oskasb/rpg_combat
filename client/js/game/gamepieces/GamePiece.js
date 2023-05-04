import { PieceActionSystem } from "./PieceActionSystem.js";
import { CombatSystem } from "../combat/CombatSystem.js";
import { ThreatDetector } from "../combat/ThreatDetector.js";
import { PieceAnimator } from "./PieceAnimator.js";
import { PieceComposer } from "../piece_functions/PieceComposer.js";
import { PieceAttacher } from "./PieceAttacher.js";
import { PieceMovement } from "../piece_functions/PieceMovement.js";
import { MovementPath } from "../piece_functions/MovementPath.js";
import { PieceState } from "./PieceState.js";
import { PieceAbilitySystem } from "./PieceAbilitySystem.js";
import { PieceInfoGui } from "../../application/ui/gui/game/PieceInfoGui.js";
import { PieceText } from "../../application/ui/gui/game/PieceText.js";
import { CompanionSystem } from "../companion/CompanionSystem.js";
import * as PieceEffects from "./feedback/PieceEffects.js";

import { Vector3 } from "../../../libs/three/math/Vector3.js";
import { Object3D } from "../../../libs/three/core/Object3D.js";
let tempVec3 = new Vector3();
let tempObj3d = new Object3D()
let pieceIndex = 0;
class GamePiece {
    constructor(config, callback) {
        pieceIndex++
        this.pieceIndex = pieceIndex;
        this.config = config;
        this.companions = [];
        this.character = null;
        this.isDead = false;
        this.ownerPiece = null;
        this.gamePieceUpdateCallbacks = [];
        this.pieceActionSystem = new PieceActionSystem();

        this.combatSystem = new CombatSystem(this);
        this.threatDetector = new ThreatDetector(this);
        this.pieceText = new PieceText(this);
        this.pieceAnimator = new PieceAnimator();
        this.pieceAttacher = new PieceAttacher();
        this.modelInstance = null;
        this.pieceState = new PieceState(this);
        this.pieceInfoGui = new PieceInfoGui(this)
        this.companionSystem = new CompanionSystem(this)
        this.pieceAbilitySystem = new PieceAbilitySystem(this);

        let tickGamePiece = function(tpf, gameTime) {
        //    this.notifyDamageTaken(5);
            if (Math.random() < 0.94) {
        //        this.printPieceText(Math.floor(Math.random()*100), null, 0.5);
            }

            if (this.isDead) {
            //    console.log("The dead cant dance, dont update me")
                return;
            }
            if (this.getStatusByKey('status_frozen') === 0) {
                MATH.callAll(this.gamePieceUpdateCallbacks, tpf, gameTime, this);
                this.pieceAnimator.updatePieceAnimations(tpf, gameTime);
                this.pieceAttacher.tickAttacher();
                this.movementPath.tickMovementPath(tpf, gameTime);

            } else {
            //    this.pieceActionSystem
            //    this.pieceAnimator.updatePieceAnimations(tpf, gameTime, true);
            }

            this.pieceState.tickPieceState(tpf, gameTime);
            for (let i = 0; i < this.companions.length; i++) {
                let companion = this.companions[i]
                companion.companionSystem.tickCompanionSystem(tpf, gameTime);
                companion.callbacks.tickGamePiece(tpf, gameTime);
            }

        }.bind(this);

        let tickPieceEquippedItem = function(tpf, gameTime) {


                if (this.getSpatial().obj3d.parent) {
                if (typeof(this.getSpatial().obj3d.parent.parent) === 'object') {
                    this.getSpatial().stickToObj3D(this.getSpatial().obj3d.parent.parent)
                    this.getSpatial().obj3d.updateMatrixWorld();
                } else {
                    console.log("Hierarchy problem here, investigate")
                }
                }
        }.bind(this);

        let getPieceState = function() {
            return this.pieceState;
        }.bind(this)

        this.callbacks = {
            tickGamePiece:tickGamePiece,
            tickPieceEquippedItem:tickPieceEquippedItem,
            getPieceState:getPieceState
        };

        let compositCb = function(piece) {
            this.pieceMovement = new PieceMovement(piece);
            this.movementPath = new MovementPath(piece);
            this.pieceState.initPieceState();
            callback(piece)
        }.bind(this);

        this.getSpatial = function() {
            return this.modelInstance.getSpatial();
        }.bind(this);

        this.getPos = function() {
            return this.modelInstance.getSpatial().getPos();
        }.bind(this);

        this.getCenterMass = function() {
            tempVec3.copy(this.getPos());
            tempVec3.y += this.getStatusByKey('height') * 0.7;
            return tempVec3;
        }.bind(this)

        this.getAboveHead = function(above) {
            tempVec3.copy(this.getPos());
            tempVec3.y += this.getStatusByKey('height') + above;
            return tempVec3;
        }.bind(this)

        this.getRandomJointId = function() {
            let jointMap = this.getModel().getJointMap();
            return MATH.getRandomObjectEntry(jointMap)
        }

        this.getRandomBone = function() {
            let map = this.getModel().getBoneMap();
            return MATH.getRandomObjectEntry(map)
        }.bind(this);

        this.getBoneWorldPosition = function(bone) {
            this.getModel().updateBoneWorldTransform(bone, tempObj3d)
            return tempObj3d.position;
        }.bind(this);

        this.getJointWorldPosition = function(boneName) {
            if (boneName === 'root_node') {
                return this.getCenterMass();
            }
            this.getModel().getBoneWorldTransform(boneName, tempObj3d)
            return tempObj3d.position;
        }.bind(this);

        new PieceComposer(this, config, compositCb)

    }

    setEquippedToPiece(ownerPiece) {
        this.ownerPiece = ownerPiece
    }

    getAbilities() {
        return this.pieceAbilitySystem.getSlottedAbilities()
    }
    getAbilitySystem() {
        return this.pieceAbilitySystem;
    }

    getOwnerPiece() {
        return this.ownerPiece;
    }

    notifyOpponentStatusUpdate(opponentPiece, statusKey, statusValue) {
        this.combatSystem.opponentStatusUpdate(opponentPiece, statusKey, statusValue);
    }

    getStatusByKey = function(key) {
        let pieceState = this.callbacks.getPieceState();
        if (!pieceState) {
            console.log("no pieceStatus", key, this);
            return;
        }
        if (typeof(pieceState.status[key]) === 'undefined') {
            console.log("No status", key, this)
            return;
        }
        let amount = pieceState.status[key];
        if (typeof (amount) === 'number') {
            if (pieceState.equipmentModifiers[key]) {
                amount += pieceState.equipmentModifiers[key];
            }
            if (pieceState.abilityModifiers[key]) {
                amount += pieceState.abilityModifiers[key];
            }
            if (pieceState.levelModifiers[key]) {
                amount += pieceState.levelModifiers[key];
            }
        }

        return amount;
    }

    setStatusValue = function(key, value) {
        return this.pieceState.status[key] = value;
    }

    applyEquipmentStatusModifier = function(key, value) {
        this.pieceState.applyEquipmentModifier(key, value);
    }

    applyAbilityStatusModifier = function(key, value) {
        this.pieceState.applyAbilityModifier(key, value);
    }

    setEquipSlotId(slot) {
        this.equipToSslotId = slot;
    }

    getEquipSlotId() {
        return this.equipToSslotId;
    }

    getOnUpdateCallback() {
        return this.callbacks.tickGamePiece;
    };

    getPieceMovement() {
        return this.pieceMovement;
    }



    getCharacter(){
        return this.character;
    }

    getQuat = function() {
        return this.getSpatial().getQuat();
    }

    getCurrentPathTile() {
        return this.movementPath.getTileAtPos(this.getPos());
    }

    distanceToReachTarget = function(targetPiece) {
        let targetTile = targetPiece.movementPath.getTileAtPos(targetPiece.getPos());
        let tile = this.movementPath.getTileAtPos(this.getPos());
        if (!tile) {
            console.log("Something breaks here sometimes...", this)
            return 0;
        }
        let range = this.getStatusByKey('meleeRange')
        range+= this.getStatusByKey('size')*0.5
        range+= targetPiece.getStatusByKey('size')*0.5
        let distance = tempVec3.subVectors(tile.getPos(), targetTile.getPos()).length();
        return distance - range;
    }
    getPathTiles = function() {
        return this.movementPath.pathTiles;
    }
    setModelInstance(modelInstance) {
        this.modelInstance = modelInstance;
        this.enablePieceAnimations()
    };

    getModel() {
        return this.modelInstance;
    }
    animateActionState(actionName) {
        let action = this.pieceActionSystem.actions[actionName][0];
        if (action) {
            if (action.active.length) {
                let actionMap = this.pieceActionSystem.actions[actionName][0].active;
                let animId = MATH.getRandomArrayEntry(actionMap)
                this.applyPieceAnimationState(animId);
            }
        }
    }

    applyPieceAnimationState(animName, duration, channel, weight) {
        this.modelInstance.animator.applyAnimationState(animName, this.animStateMap, duration, channel, weight)
    }

    activatePieceAnimation = function(animName, weight, timeScale, fadeTime) {
        this.pieceAnimator.activatePieceAnimation(animName, weight, timeScale, fadeTime);
    };

    getPlayingAnimation = function(animName) {
        return this.pieceAnimator.isActiveAnimationKey(animName);
    };

    attachPieceSpatialToJoint = function(spatial, jointKey) {
        return this.pieceAttacher.attachSpatialToJoint(spatial, jointKey);
    };

    getJointActiveAttachment = function(key) {
        return this.pieceAttacher.isActiveJointKey(key);
    };



    releaseJointActiveAttachment = function(key, spatial) {
        return this.pieceAttacher.releaseJointKey(key, spatial);
    };

    addPieceUpdateCallback = function(cb) {
        if (this.gamePieceUpdateCallbacks.indexOf(cb) === -1) {
            this.gamePieceUpdateCallbacks.push(cb);
        }
    };

    removePieceUpdateCallback = function(cb) {
        MATH.quickSplice(this.gamePieceUpdateCallbacks, cb);
    };


    actionStateEnded = function(action) {
        MATH.quickSplice(this.activeActions, action);
    };

    printPieceText(string, messageType, duration) {
        this.pieceText.pieceTextPrint(string, messageType, duration);
    }

    applyDamage(amount, attacker) {
        let hp = this.getStatusByKey('hp');
    //    let maxHP = this.getStatusByKey('maxHP');
        let newHP = MATH.clamp(hp - Math.floor(amount), 0, hp);
        this.setStatusValue('hp', newHP);
        let harm = hp-newHP;
        this.printPieceText(harm, ENUMS.Message.DAMAGE_NORMAL_TAKEN, 1);
        if (harm !== 0) {
            PieceEffects.damageEffect(this, harm, attacker)
            if (newHP === 0) {

                if (this.getStatusByKey('status_frozen')) {
                    this.enablePieceAnimations();
                    this.setStatusValue('status_frozen', 0)
                    this.setStatusValue('animating', 1)
                }

                let overkillFx = function() {
                    PieceEffects.damageEffect(this, overkillHP, attacker)
                }.bind(this)

                let overkillHP = amount - harm;
                setTimeout(function() {
                    overkillFx()
                }, 250)
            }
        }
    }

    applyHeal(amount, healer) {
        let hp = this.getStatusByKey('hp');
        let maxHP = this.getStatusByKey('maxHP');
        let newHP = MATH.clamp(Math.floor(amount) + hp, hp, maxHP);
        this.setStatusValue('hp', newHP);
        let heal = newHP-hp;
        if (heal !== 0) {
            PieceEffects.healEffect(this, heal, healer)
            this.printPieceText(heal, ENUMS.Message.HEALING_GAINED, 2.5);
        }
    }

    applyStatusModifier(statusId, duration) {
        this.setStatusValue(statusId, duration);
    }

    applyPieceLevel(targetLevel) {
        PieceEffects.healEffect(this, targetLevel, this)
        this.pieceState.processLevelUpTo(targetLevel, this);
    }

    disablePieceAnimations() {
        let mixer = this.getModel().getAnimationMixer()
        if (mixer) {
            ThreeAPI.deActivateMixer(mixer);
        }
    }

    enablePieceAnimations() {
        let mixer = this.getModel().getAnimationMixer()
        if (mixer) {
            ThreeAPI.activateMixer(mixer);
        }
    }

    getTarget = function() {
        let selectedTarget = this.getStatusByKey('selectedTarget')
        let engagingTarget = this.getStatusByKey('engagingTarget')
        let disengagingTarget = this.getStatusByKey('disengagingTarget')
        let combatTarget = this.getStatusByKey('combatTarget')
        return selectedTarget || engagingTarget || combatTarget || disengagingTarget ;
    }

    applyPieceDeadStatus() {
        this.isDead = true;
        this.clearEngagementStatus();
        PieceEffects.deathEffect(this)

        let endAnimMixer = function() {
            this.disablePieceAnimations()
        }.bind(this);
        setTimeout(function() {
            endAnimMixer();
        }, 2000)
    }
    clearEngagementStatus() {
        this.movementPath.cancelMovementPath()
        this.pieceState.pieceStateProcessor.clearCombatState(this.pieceState.status)
    }
    notifyOpponentKilled(deadOpponent) {


        let oldTarget = this.getTarget();

        let newHostile = this.threatDetector.getNearestKnownHostile();
        if (newHostile) {
        let newTarget = newHostile.gamePiece;
            let rangeCheck = this.distanceToReachTarget(newTarget);
            if (rangeCheck > 10) {
                this.clearEngagementStatus();
                return;
            }

            this.movementPath.setPathTargetPiece(newTarget)
            this.setStatusValue('engageTarget', newTarget);
            if (rangeCheck > 1.5) {
            //    this.setStatusValue('selectTarget', newTarget);
                this.clearEngagementStatus();

                if (this === GameAPI.getMainCharPiece()) {
                    evt.dispatch(ENUMS.Event.MAIN_CHAR_SELECT_TARGET, {piece:newTarget, longPress:0, value:true })
                } else {
                    this.setStatusValue('selectedTarget', newTarget);
                }
            } else {
                console.log("NEW TARGET IN MELEE RANGE", newTarget.isDead, newTarget, this.getStatusByKey('charState'))

                this.combatSystem.attackCombatTarget(newTarget);
                this.combatSystem.selectedTarget = newTarget;
                this.setStatusValue('disengagingTarget', null);
                this.setStatusValue('selectTarget', null);
                this.setStatusValue('engageTarget', null);
                this.setStatusValue('combatTarget', newTarget);
                this.setStatusValue('targState', ENUMS.CharacterState.COMBAT);
                this.setStatusValue('charState', ENUMS.CharacterState.COMBAT);
            }

            let master = this.getStatusByKey('following')
            if (master) {
                master.notifyOpponentKilled(deadOpponent);
            }

            if (deadOpponent === oldTarget) {
                for (let i = 0; i < this.companions.length; i++) {
                //    this.companions[i].notifyOpponentKilled(deadOpponent)
                }
            }

            return newTarget;
        }

        this.clearEngagementStatus();
    }
    hideGamePiece = function() {
        if (this.getSpatial().geometryInstance) {
            tempVec3.set(0, 0, 0);
            this.getSpatial().geometryInstance.setScale(tempVec3)
        }else {
            ThreeAPI.hideModel(this.modelInstance.obj3d)
        }
    };

    addCompanion(gamePiece) {
        if (MATH.arrayContains(this.companions, gamePiece)) return;
        gamePiece.setStatusValue('following', this)
        console.log("piece adds companion", gamePiece)
        let dynChars = GameAPI.getActiveDynamicScenario().characters;
        let pieces = GameAPI.getActiveDynamicScenario().pieces;
        MATH.quickSplice(dynChars, gamePiece.getCharacter());
        MATH.quickSplice(pieces, gamePiece);
        this.companions.push(gamePiece);
    }


    showGamePiece = function() {
        if (this.getSpatial().geometryInstance) {
            tempVec3.set(1, 1, 1);
            this.getSpatial().geometryInstance.setScale(tempVec3);

        }else {
            ThreeAPI.showModel(this.modelInstance.obj3d)
            this.enablePieceAnimations()
        }
    };

    disbandGamePiece() {
        this.movementPath.cancelMovementPath()
            GameAPI.takePieceFromWorld(this);
            this.modelInstance.decommissionInstancedModel();
            this.gamePieceUpdateCallbacks.length = 0;
            this.disablePieceAnimations()
    };




}

export { GamePiece }