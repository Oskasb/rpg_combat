class PieceAttachment {
    constructor(key, joint, attachmentJoint) {
            this.key = key;
            this.joint = joint;
            this.attachmentJoint = attachmentJoint;
        };

        setAttachedSpatial = function(spatial, modelInstance) {
            return this.attachmentJoint.registerAttachedSpatial(spatial, this.joint, modelInstance.boneMap);
        };

        releaseActiveAttachment = function() {
            return this.attachmentJoint.detachAttachedEntity();
        };

        getActiveAttachment = function() {
            return this.attachmentJoint.getAttachedEntity();
        };

        activateNow = function(weight, timeScale) {

        };
    }

    export { PieceAttachment }

