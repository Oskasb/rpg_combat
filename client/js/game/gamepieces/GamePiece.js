import { PieceActionSystem } from "./PieceActionSystem.js";
import { CombatSystem } from "../combat/CombatSystem.js";
import { ThreatDetector } from "../combat/ThreatDetector.js";
import { AnimationStateProcessor } from "../../3d/three/animations/AnimationStateProcessor.js";
import { PieceAnimator } from "./PieceAnimator.js";
import { PieceComposer } from "../piece_functions/PieceComposer.js";
import { PieceAttacher } from "./PieceAttacher.js";
import { PieceMovement } from "../piece_functions/PieceMovement.js";
import { MovementPath } from "../piece_functions/MovementPath.js";
import { PieceState } from "./PieceState.js";

class GamePiece {
    constructor(config, callback) {
        this.gamePieceUpdateCallbacks = [];
        this.pieceActionSystem = new PieceActionSystem();
        this.combatSystem = new CombatSystem(this);
        this.threatDetector = new ThreatDetector(this);

        this.pieceAnimator = new PieceAnimator();
        this.pieceAttacher = new PieceAttacher();
        this.modelInstance = null;
        this.pieceState = new PieceState(this);

        let tickGamePiece = function(tpf, gameTime) {
            MATH.callAll(this.gamePieceUpdateCallbacks, tpf, gameTime, this);
            this.pieceAnimator.updatePieceAnimations(tpf, gameTime);
            this.pieceAttacher.tickAttacher();
            this.pieceState.tickPieceState(tpf, gameTime);
            this.movementPath.tickMovementPath(tpf, gameTime);
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

    getPos = function() {
        return this.getSpatial().obj3d.position;
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

    hideGamePiece = function() {
        if (this.getSpatial().geometryInstance) {
            ThreeAPI.tempVec3.set(0, 0, 0);
            this.getSpatial().geometryInstance.setScale(ThreeAPI.tempVec3)
        }else {
            ThreeAPI.hideModel(this.modelInstance.obj3d)
        }

    };

    showGamePiece = function() {
        if (this.getSpatial().geometryInstance) {
            ThreeAPI.tempVec3.set(1, 1, 1);
            this.getSpatial().geometryInstance.setScale(ThreeAPI.tempVec3);

        }else {
            ThreeAPI.showModel(this.modelInstance.obj3d)
        }
    };

    disbandGamePiece() {
        GameAPI.takePieceFromWorld(this);
        this.modelInstance.decommissionInstancedModel();
        this.gamePieceUpdateCallbacks.length = 0;
    };




}

export { GamePiece }