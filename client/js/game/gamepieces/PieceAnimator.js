import { PieceAnim } from "./PieceAnim.js";
import { AttachmentJoint } from "../../3d/three/animations/AttachmentJoint.js";
import { AnimationState } from "../../3d/three/animations/AnimationState.js";

class PieceAnimator {
    constructor() {
        this.animations = {};
        this.activeAnimations = [];
        this.removes = [];

        this.animationStates = [];
        this.attachmentJoints = [];
        this.attachmentUpdates = [];

        this.timeAtKey = 0;
        this.poseKey = ENUMS.getKey('Animations', ENUMS.Animations.IDLE);

        let setAttachmentUpdated = function(joint) {
            this.addAttachmentUpdate(joint)
        }.bind(this);

        this.callbacks = {
            setAttachmentUpdated:setAttachmentUpdated
        }

    }

    initPieceAnimator = function(piece, onReady) {
        this.gamePiece = piece;
        this.setupPieceAnimations(onReady)
    };


    setupAnimations = function(data) {

        let key;
        let joint;

        for (let i = 0; i < data.jointKeys.length; i ++) {
            key = ENUMS.getKey('Joints',data.jointKeys[i]);
            joint = new AttachmentJoint(key, this.gamePiece.getSpatial().scale, this.callbacks.setAttachmentUpdated);
            this.attachmentJoints[i] = joint;
            this.jointMap[this.data.jointKeys[i]] = i;
        }

        for (let i = 0; i < data.animKeys.length; i ++) {
            let animKey = ENUMS.getKey('Animations',data.animKeys[i]);
            let animState = new AnimationState(animKey);
            this.animationStates.push(animState);
        }
    };

    addAttachmentUpdate = function(attachmentUpdate) {
        this.attachmentUpdates.push(attachmentUpdate);
    };

    getAnimationState = function(key) {
        return MATH.getFromArrayByKeyValue(this.animationStates, 'key', key)
    };


    setupPieceAnimations = function(onReady) {

        //        console.log("Animator", this);
        let skeleton_rig = this.gamePiece.readConfigData('skeleton_rig');
        this.gamePiece.setRigKey(skeleton_rig);

        if (skeleton_rig) {

            let onDataReady = function() {
                let animations = this.gamePiece.getRigData().readDataKey('animations');

                for (let key in animations) {
                    this.animations[key] = new PieceAnim(key, this.gamePiece.getRigData(), this.getAnimationState(key));
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

