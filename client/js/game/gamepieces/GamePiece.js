import { AnimationStateProcessor } from "../../3d/three/animations/AnimationStateProcessor.js";
import { PieceAnimator } from "./PieceAnimator.js";
import { PieceComposer } from "../piece_functions/PieceComposer.js";

class GamePiece {
    constructor(configName, callback) {
        this.gamePieceUpdateCallbacks = [];
        this.pieceAnimator = new PieceAnimator();
        this.modelInstance = null;
        this.rigData = null;




        new PieceComposer(this, configName, callback)
    }

    getSpatial = function() {
        return this.modelInstance.getSpatial();
    };

    setModelInstance(modelInstance) {
        this.modelInstance = modelInstance;
    };

    setRigData(ridGata) {
        this.rigData = ridGata;
    };

    activatePieceAnimation = function(key, weight, timeScale, fadeTime) {
        this.pieceAnimator.activatePieceAnimation(key, weight, timeScale, fadeTime);
    };

    getPlayingAnimation = function(key) {
        return this.pieceAnimator.isActiveAnimationKey(key);
    };

    setPieceAttacher = function( pieceAttacher) {
        this.pieceAttacher = pieceAttacher;
    };

    getPieceAttacher = function( ) {
        return this.pieceAttacher;
    };


    attachWorldEntityToJoint = function(worldEntity, jointKey) {
        return this.getPieceAttacher().attachEntityToJoint(worldEntity, jointKey);
    };


    getJointActiveAttachment = function(key) {
        return this.getPieceAttacher().isActiveJointKey(key);
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



    tickGamePiece(tpf, scenarioTime) {

        MATH.callAll(this.gamePieceUpdateCallbacks, tpf, scenarioTime);
        this.pieceAnimator.updatePieceAnimations(tpf, scenarioTime);

    }


}

export { GamePiece }