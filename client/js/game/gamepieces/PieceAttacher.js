import { PieceAttachment } from "./PieceAttachment.js";

class PieceAttacher {
    constructor() {
        this.pieceAttachments = {};
        this.activeJoints = [];
        this.attachedWorldEntities = [];
    };

    initPieceAttacher = function (piece, rigData) {
        this.gamePiece = piece;
        return this.setupPieceAttachments(rigData)
    };

    setupPieceAttachments = function (rigData) {

        let joints = rigData['joints'];

        this.gamePiece.jointData = joints;

        let jointMap = this.gamePiece.modelInstance.originalModel.jointMap;

        console.log(jointMap);        for (let key in joints) {
            this.pieceAttachments[key] = new PieceAttachment(key, joints[key], this.gamePiece.pieceAnimator.attachmentJoints[key]);
        }
        return this.pieceAttachments;
    };

    attachSpatialToJoint = function (spatial, jointKey) {
        this.attachedWorldEntities.push(spatial);
        let joint = this.getAttachmentJoint(jointKey).setAttachedSpatial(spatial, this.gamePiece.modelInstance);
        this.activeJoints.push(joint);
    };

    getAttachmentJoint = function (key) {
        return this.pieceAttachments[key];
    };

    isActiveJointKey = function (key) {
        return this.getAttachmentJoint(key).getActiveAttachment();
    };

    releaseJointKey = function (key) {
        return this.getAttachmentJoint(key).releaseActiveAttachment();
    };

    removeAttachedEntities = function () {
        while (this.attachedWorldEntities.length) {
            MainWorldAPI.getWorldSimulation().despawnWorldEntity(this.attachedWorldEntities.pop());
        }
    };

    tickAttacher(){
        for (let i = 0; i < this.activeJoints.length;i++) {
            this.activeJoints[i].inheritJointDynamicPosition()
        }
    }

}
export { PieceAttacher }

