"use strict";

define([
        'game/pieces/PieceAnim'
    ],
    function(
        PieceAnim
    ) {

        var PieceAnimator = function() {

            this.animations = {};
            this.activeAnimations = [];
            this.removes = [];

            this.timeAtKey = 0;
            this.poseKey = ENUMS.getKey('Animations', ENUMS.Animations.IDLE);

        };

        PieceAnimator.prototype.initPieceAnimator = function(piece, onReady) {
            this.gamePiece = piece;
            this.worldEntity = piece.getWorldEntity();
            piece.setPieceAnimator(this);
            this.setupPieceAnimations(onReady)
        };

        PieceAnimator.prototype.setupPieceAnimations = function(onReady) {

    //        console.log("Animator", this);
            var skeleton_rig = this.gamePiece.readConfigData('skeleton_rig');
            this.gamePiece.setRigKey(skeleton_rig);

            if (skeleton_rig) {

                var onDataReady = function() {
                var animations = this.gamePiece.getRigData().readDataKey('animations');

                for (var key in animations) {
                    this.animations[key] = new PieceAnim(key, this.gamePiece.getRigData(), this.worldEntity.getAnimationState(key));
                }

            }.bind(this);

                this.gamePiece.rigData.fetchData(skeleton_rig, onDataReady);

            }

            onReady(this);
        };


        PieceAnimator.prototype.getPieceAnim = function(animationKey) {
            return this.animations[animationKey];
        };


        PieceAnimator.prototype.setPoseKey = function(key) {
            this.timeAtKey = 0;
            this.poseKey = key
        };

        PieceAnimator.prototype.getPoseKey = function() {
            return this.poseKey;
        };

        PieceAnimator.prototype.getTimeAtKey = function() {
            return this.timeAtKey;
        };

        PieceAnimator.prototype.getActionMap = function(actionType) {
            return this.gamePiece.getRigData().readDataKey('action_maps')[actionType];
        };


        PieceAnimator.prototype.activatePieceAnimation = function(animationKey, weight, timeScale, fadeTime) {


            var anim = this.getPieceAnim(animationKey);

            if (!anim) {
                console.log("Bad animationKey: ", animationKey)
                return;
            }


            if (this.activeAnimations.indexOf(anim) === -1) {
                anim.activateNow(weight, timeScale, fadeTime);

                var currentInChannel = MATH.getFromArrayByKeyValue(this.activeAnimations, 'channel', anim.channel);

                if (currentInChannel) {
                    currentInChannel.notifyOverwrite(anim.fadeTime);
                }

                this.activeAnimations.push(anim);
            } else {

                if (anim.channel === 0) {
            //        console.log("Refresh Legs")
                }

                anim.refreshDuration();
                anim.setTimeScale(timeScale);
                anim.setWeight(weight);
            }

        };

        PieceAnimator.prototype.isActiveAnimationKey = function(key) {
            return MATH.getFromArrayByKeyValue(this.activeAnimations, 'key', key);
        };

        PieceAnimator.prototype.updatePieceAnimations = function(tpf, time) {

            this.timeAtKey += tpf;

            for (var i = 0; i < this.activeAnimations.length; i++) {
                this.activeAnimations[i].updateAnimation(tpf, time, this.removes);
            }

            while (this.removes.length) {
                MATH.quickSplice(this.activeAnimations, this.removes.pop());
            }

        };

        return PieceAnimator;

    });

