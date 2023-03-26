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

    initPieceAnimator = function(piece, rigData) {
        this.gamePiece = piece;
        this.setupPieceAnimations(rigData)

    };

    setupAnimations = function(model, scale) {

        let joints = model.jointMap;
        let anims = model.animMap;

        let key;
        let joint;

        for (let key in joints) {
            joint = new AttachmentJoint(key, scale, this.callbacks.setAttachmentUpdated);
            this.attachmentJoints[key] = joint;
        }

        this.jointMap = joints;

        for (let key in anims) {
            let animState = new AnimationState(anims[key]);
            this.animationStates.push(animState);
        }


    };

    addAttachmentUpdate = function(attachmentUpdate) {
        this.attachmentUpdates.push(attachmentUpdate);
    };


    setupPieceAnimations = function(rigData) {

        let animations = rigData['animations'];
        console.log("Anim states: ", this.animationStates);
        for (let key in animations) {

            let animState = MATH.getFromArrayByKeyValue(this.animationStates, 'key', key)
            console.log("Anim state: ", animState);

            this.animations[key] = new PieceAnim(key, animations[key], animState);
            console.log("Add anim: ", key);
        }

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
                // console.log("Refresh Legs")
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

