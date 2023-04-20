import { PieceActionSystem } from "./PieceActionSystem.js";
import { CombatSystem } from "../combat/CombatSystem.js";
import { ThreatDetector } from "../combat/ThreatDetector.js";
import { PieceAnimator } from "./PieceAnimator.js";
import { PieceComposer } from "../piece_functions/PieceComposer.js";
import { PieceAttacher } from "./PieceAttacher.js";
import { PieceMovement } from "../piece_functions/PieceMovement.js";
import { MovementPath } from "../piece_functions/MovementPath.js";
import { PieceState } from "./PieceState.js";
import { PieceInfoGui } from "../../application/ui/gui/game/PieceInfoGui.js";
import { CompanionSystem } from "../companion/CompanionSystem.js";
import { Vector3 } from "../../../libs/three/math/Vector3.js";

let tempVec3 = new Vector3();

class GamePiece {
    constructor(config, callback) {
        this.companions = [];
        this.character = null;
        this.isDead = false;
        this.gamePieceUpdateCallbacks = [];
        this.pieceActionSystem = new PieceActionSystem();
        this.combatSystem = new CombatSystem(this);
        this.threatDetector = new ThreatDetector(this);

        this.pieceAnimator = new PieceAnimator();
        this.pieceAttacher = new PieceAttacher();
        this.modelInstance = null;
        this.pieceState = new PieceState(this);
        this.pieceInfoGui = new PieceInfoGui(this)
        this.companionSystem = new CompanionSystem(this)

        let tickGamePiece = function(tpf, gameTime) {
            if (this.isDead) {
                console.log("The dead cant dance, dont update me")
                return;
            }
            MATH.callAll(this.gamePieceUpdateCallbacks, tpf, gameTime, this);
            this.pieceAnimator.updatePieceAnimations(tpf, gameTime);
            this.pieceAttacher.tickAttacher();
            this.pieceState.tickPieceState(tpf, gameTime);
            this.movementPath.tickMovementPath(tpf, gameTime);
            for (let i = 0; i < this.companions.length; i++) {
                this.companions[i].companionSystem.tickCompanionSystem(tpf, gameTime);
                this.companions[i].callbacks.tickGamePiece(tpf, gameTime);
            }

        }.bind(this);

        let tickPieceEquippedItem = function(tpf, gameTime) {
            if (this.getSpatial().obj3d.parent) {
                this.getSpatial().stickToObj3D(this.getSpatial().obj3d.parent.parent)
            }
        }.bind(this);

        this.callbacks = {
            tickGamePiece:tickGamePiece,
            tickPieceEquippedItem:tickPieceEquippedItem
        };

        let compositCb = function(piece) {
            this.pieceMovement = new PieceMovement(piece);
            this.movementPath = new MovementPath(piece);
            callback(piece)
        }.bind(this);

        new PieceComposer(this, config, compositCb)

    }



    notifyOpponentStatusUpdate(opponentPiece, statusKey, statusValue) {
        this.combatSystem.opponentStatusUpdate(opponentPiece, statusKey, statusValue);
    }

    getStatusByKey = function(key) {
        return this.pieceState.status[key];
    }

    setStatusValue = function(key, value) {
        return this.pieceState.status[key] = value;
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

    getSpatial = function() {
        return this.modelInstance.getSpatial();
    };

    getCharacter(){
        return this.character;
    }

    getPos = function() {
        return this.getSpatial().obj3d.position;
    }
    getQuat = function() {
        return this.getSpatial().obj3d.quaternion;
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
    };

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

    getStatus() {
        return this.pieceState.status;
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
    }
    clearEngagementStatus() {
        this.movementPath.cancelMovementPath()
        this.pieceState.pieceStateProcessor.clearCombatState(this.pieceState.status)
    }
    notifyOpponentKilled() {
        let newHostile = this.threatDetector.getNearestKnownHostile();
        if (newHostile) {
        let newTarget = newHostile.gamePiece;
            let rangeCheck = this.distanceToReachTarget(newTarget);
            if (rangeCheck > 1.5) {
                this.setStatusValue('engageTarget', newTarget);
            } else {
                console.log("NEW TARGET IN MELEE RANGE", newTarget.isDead, newTarget, this.getStatusByKey('charState'))
                if (this === GameAPI.getMainCharPiece()) {
                    evt.dispatch(ENUMS.Event.MAIN_CHAR_SELECT_TARGET, {piece:newTarget, longPress:0, value:true })
                }
                this.combatSystem.attackCombatTarget(newTarget);
                this.combatSystem.selectedTarget = newTarget;
                this.setStatusValue('disengagingTarget', null);
                this.setStatusValue('selectTarget', null);
                this.setStatusValue('engageTarget', null);
                this.setStatusValue('combatTarget', newTarget);
                this.setStatusValue('targState', ENUMS.CharacterState.COMBAT);
                this.setStatusValue('charState', ENUMS.CharacterState.COMBAT);
            }
        }
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
        }
    };

    disbandGamePiece() {
        this.movementPath.cancelMovementPath()
            GameAPI.takePieceFromWorld(this);
            this.modelInstance.decommissionInstancedModel();
            this.gamePieceUpdateCallbacks.length = 0;

    };




}

export { GamePiece }