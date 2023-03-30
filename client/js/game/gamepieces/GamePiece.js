import { AnimationStateProcessor } from "../../3d/three/animations/AnimationStateProcessor.js";
import { PieceAnimator } from "./PieceAnimator.js";
import { PieceComposer } from "../piece_functions/PieceComposer.js";
import { PieceAttacher } from "./PieceAttacher.js";
import { PieceMovement } from "../piece_functions/PieceMovement.js";

class GamePiece {
    constructor(config, callback) {
        this.gamePieceUpdateCallbacks = [];
        this.pieceAnimator = new PieceAnimator();
        this.pieceAttacher = new PieceAttacher();
        this.modelInstance = null;

        let tickGamePiece = function(tpf, gameTime) {
            MATH.callAll(this.gamePieceUpdateCallbacks, tpf, gameTime);
            this.pieceAnimator.updatePieceAnimations(tpf, gameTime);
            this.pieceAttacher.tickAttacher()
        }.bind(this);

        this.callbacks = {
            tickGamePiece:tickGamePiece
        };

        let compositCb = function(piece) {
            this.pieceMovement = new PieceMovement(piece);
            callback(piece)
        }.bind(this);

        new PieceComposer(this, config, compositCb)

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

    setModelInstance(modelInstance) {
        this.modelInstance = modelInstance;
    };

    applyPieceAnimationState(stateId) {
        this.modelInstance.animator.applyAnimationState(stateId, this.animStateMap)
    }

    activatePieceAnimation = function(key, weight, timeScale, fadeTime) {
        this.pieceAnimator.activatePieceAnimation(key, weight, timeScale, fadeTime);
    };

    getPlayingAnimation = function(key) {
        return this.pieceAnimator.isActiveAnimationKey(key);
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

    actionStateUpdated = function(action) {
        if (action.getActionState() === ENUMS.ActionState.ACTIVATING) {
            this.activeActions.push(action);
        }
        AnimationStateProcessor.applyActionStateToGamePiece(action, this)
    };

    animateMovementState = function(state, movement) {
        AnimationStateProcessor.applyMovementStateToGamePiece(state, movement, this)
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
        this.modelInstance.decommissionInstancedModel();
        this.gamePieceUpdateCallbacks.length = 0;
    };




}

export { GamePiece }