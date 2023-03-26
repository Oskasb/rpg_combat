import { PieceAttachment } from "./PieceAttachment.js";

class PieceAttacher {
    constructor() {
            this.pieceAttachments = {};
            this.attachedWorldEntities = [];
        };

        initPieceAttacher = function(piece) {
            this.gamePiece = piece;
            this.worldEntity = piece.getWorldEntity();
            piece.setPieceAttacher(this);
            this.setupPieceAttachments()
        };

        setupPieceAttachments = function() {

            let skeleton_rig = this.gamePiece.readConfigData('skeleton_rig');
            this.gamePiece.setRigKey(skeleton_rig);

            if (skeleton_rig) {

                var onDataReady = function() {

                    var joints = this.gamePiece.getRigData().readDataKey('joints');

                    for (var key in joints) {
                        this.pieceAttachments[key] = new PieceAttachment(key, this.gamePiece.getRigData(), this.worldEntity.getAttachmentJoint(key));
                    }

                }.bind(this);

                this.gamePiece.rigData.fetchData(skeleton_rig, onDataReady);

            }
        };

        attachEntityToJoint = function(entity, jointKey) {
            this.attachedWorldEntities.push(entity);
            this.getAttachmentJoint(jointKey).setAttachedWorldEntity(entity);
        };

        getAttachmentJoint = function(key) {
            return this.pieceAttachments[key];
        };

        isActiveJointKey = function(key) {
            return this.getAttachmentJoint(key).getActiveAttachment();
        };

        releaseJointKey = function(key) {
            return this.getAttachmentJoint(key).releaseActiveAttachment();
        };

        removeAttachedEntities = function() {

            while (this.attachedWorldEntities.length) {
                MainWorldAPI.getWorldSimulation().despawnWorldEntity(this.attachedWorldEntities.pop());
            }
        };
    }

    export { PieceAttachment }

