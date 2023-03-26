import { AnimationStateProcessor } from "../../3d/three/animations/AnimationStateProcessor.js";
import { PieceAnimator } from "./PieceAnimator.js";

class GamePiece {
    constructor(config, callback) {
        this.config = config;
        this.gamePieceUpdateCallbacks = [];
        this.pieceAnimator = new PieceAnimator();

        let instanceCb = function(assetInstance) {
            this.instance = assetInstance;
            callback(this)
        }.bind(this);

        client.dynamicMain.requestAssetInstance(config.assetId, instanceCb)
    }

    getPieceSpatial() {
        return this.instance.getSpatial();
    }


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

        let spatial = this.getPieceSpatial();
        let tempVec = ThreeAPI.tempVec3;
        tempVec.copy(spatial.getSpatialPosition());
        tempVec.x += Math.sin(scenarioTime*0.7)*0.01;
        tempVec.y = 2;
        tempVec.z += Math.cos(scenarioTime*0.7)*0.01;

        spatial.setPosXYZ(
            tempVec.x,
            tempVec.y,
            tempVec.z
        )
    }


}

export { GamePiece }