import { PieceAnim } from "./PieceAnim.js";

class PieceAnimator {
    constructor() {
        this.animations = {};
        this.activeAnimations = [];
        this.removes = [];

        this.timeAtKey = 0;
        this.poseKey = ENUMS.getKey('Animations', ENUMS.Animations.IDLE);
    }

    initPieceAnimator = function(piece, onReady) {
        this.gamePiece = piece;
        this.worldEntity = piece.getWorldEntity();
        piece.setPieceAnimator(this);
        this.setupPieceAnimations(onReady)
    };

    setupPieceAnimations = function(onReady) {

        //        console.log("Animator", this);
        let skeleton_rig = this.gamePiece.readConfigData('skeleton_rig');
        this.gamePiece.setRigKey(skeleton_rig);

        if (skeleton_rig) {

            let onDataReady = function() {
                let animations = this.gamePiece.getRigData().readDataKey('animations');

                for (let key in animations) {
                    this.animations[key] = new PieceAnim(key, this.gamePiece.getRigData(), this.worldEntity.getAnimationState(key));
                }

            }.bind(this);

            this.gamePiece.rigData.fetchData(skeleton_rig, onDataReady);

        }

        onReady(this);
    };


    getPieceAnim = function(animationKey) {
        return this.animations[animationKey];
    };


    setPoseKey = function(key) {
        this.timeAtKey = 0;
        this.poseKey = key
    };

    getPoseKey = function() {
        return this.poseKey;
    };

    getTimeAtKey = function() {
        return this.timeAtKey;
    };

    getActionMap = function(actionType) {
        return this.gamePiece.getRigData().readDataKey('action_maps')[actionType];
    };


    activatePieceAnimation = function(animationKey, weight, timeScale, fadeTime) {


        let anim = this.getPieceAnim(animationKey);

        if (!anim) {
            console.log("Bad animationKey: ", animationKey)
            return;
        }


        if (this.activeAnimations.indexOf(anim) === -1) {
            anim.activateNow(weight, timeScale, fadeTime);

            let currentInChannel = MATH.getFromArrayByKeyValue(this.activeAnimations, 'channel', anim.channel);

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

    isActiveAnimationKey = function(key) {
        return MATH.getFromArrayByKeyValue(this.activeAnimations, 'key', key);
    };

    updatePieceAnimations = function(tpf, time) {

        this.timeAtKey += tpf;

        for (let i = 0; i < this.activeAnimations.length; i++) {
            this.activeAnimations[i].updateAnimation(tpf, time, this.removes);
        }

        while (this.removes.length) {
            MATH.quickSplice(this.activeAnimations, this.removes.pop());
        }

    };
}

export { PieceAnimator }

