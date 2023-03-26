"use strict";

define([
        'game/actions/AnimationStateProcessor'
    ],
    function(
        AnimationStateProcessor
    ) {

        var GamePiece = function(dataId) {
            this.dataId = dataId;
            this.gamePieceUpdateCallbacks = [];
            this.activeActions = [];
        };

        GamePiece.prototype.initGamePiece = function( pieceId, workerData, rigData) {
            this.pieceId = pieceId;
            this.workerData = workerData;
            this.rigData = rigData
        };

        GamePiece.prototype.setRigKey = function(rigKey) {
            this.rigKey = rigKey;
        };

        GamePiece.prototype.getRigData = function() {
            return this.rigData
        };

        GamePiece.prototype.getWorkerData = function() {
            return this.workerData
        };

        GamePiece.prototype.readConfigData = function( key) {
            return this.workerData.readDataKey(key)
        };

        GamePiece.prototype.setWorldEntity = function( worldEntity) {
            this.worldEntity = worldEntity;
        };

        GamePiece.prototype.getWorldEntity = function() {
            return this.worldEntity;
        };

        GamePiece.prototype.setPieceAnimator = function( pieceAnimator) {
            this.pieceAnimator = pieceAnimator;
        };

        GamePiece.prototype.getPieceAnimator = function( ) {
            return this.pieceAnimator;
        };

        GamePiece.prototype.activatePieceAnimation = function(key, weight, timeScale, fadeTime) {
            this.getPieceAnimator().activatePieceAnimation(key, weight, timeScale, fadeTime);
        };

        GamePiece.prototype.getPlayingAnimation = function(key) {
            return this.getPieceAnimator().isActiveAnimationKey(key);
        };


        GamePiece.prototype.setPieceAttacher = function( pieceAttacher) {
            this.pieceAttacher = pieceAttacher;
        };

        GamePiece.prototype.getPieceAttacher = function( ) {
            return this.pieceAttacher;
        };


        GamePiece.prototype.attachWorldEntityToJoint = function(worldEntity, jointKey) {
            return this.getPieceAttacher().attachEntityToJoint(worldEntity, jointKey);
        };


        GamePiece.prototype.getJointActiveAttachment = function(key) {
           return this.getPieceAttacher().isActiveJointKey(key);
        };

        GamePiece.prototype.addPieceUpdateCallback = function(cb) {
            if (this.gamePieceUpdateCallbacks.indexOf(cb) === -1) {
                this.gamePieceUpdateCallbacks.push(cb);
            }
        };


        GamePiece.prototype.removePieceUpdateCallback = function(cb) {
            MATH.quickSplice(this.gamePieceUpdateCallbacks, cb);
        };


        GamePiece.prototype.actionStateEnded = function(action) {
            MATH.quickSplice(this.activeActions, action);
        };

        GamePiece.prototype.actionStateUpdated = function(action) {
            if (action.getActionState() === ENUMS.ActionState.ACTIVATING) {
                this.activeActions.push(action);
            }
            AnimationStateProcessor.applyActionStateToGamePiece(action, this)
        };

        GamePiece.prototype.animateMovementState = function(state, movement) {
            AnimationStateProcessor.applyMovementStateToGamePiece(state, movement, this)
        };


        GamePiece.prototype.updateGamePiece = function(tpf, time) {
            MATH.callAll(this.gamePieceUpdateCallbacks, tpf, time);
            this.pieceAnimator.updatePieceAnimations(tpf, time);
        };

        GamePiece.prototype.disposeGamePiece = function() {
            GuiAPI.printDebugText("DISPOSE GAME PIECE "+this.pieceId);

            this.getPieceAttacher().removeAttachedEntities();

            MATH.emptyArray(this.gamePieceUpdateCallbacks);

            MainWorldAPI.getWorldSimulation().despawnWorldEntity(this.worldEntity);
        };

        return GamePiece;


    });

