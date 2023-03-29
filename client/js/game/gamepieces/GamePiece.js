import { AnimationStateProcessor } from "../../3d/three/animations/AnimationStateProcessor.js";
import { PieceAnimator } from "./PieceAnimator.js";
import { PieceComposer } from "../piece_functions/PieceComposer.js";
import { PieceAttacher } from "./PieceAttacher.js";

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

        new PieceComposer(this, config, callback)

    }

    getOnUpdateCallback() {
        return this.callbacks.tickGamePiece;
    };

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

    disbandGamePiece() {
        this.modelInstance.decommissionInstancedModel();
        this.gamePieceUpdateCallbacks.length = 0;
    };




}

export { GamePiece }