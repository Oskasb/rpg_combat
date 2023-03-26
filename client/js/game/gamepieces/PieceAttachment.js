class PieceAttachment {
    constructor(key, joint, attachmentJoint) {
            this.key = key;
            this.joint = joint;
            this.attachmentJoint = attachmentJoint;
        };

        setAttachedSpatial = function(spatial, modelInstance) {
            console.log(modelInstance);
            return this.attachmentJoint.registerAttachedSpatial(spatial, this.joint, modelInstance.boneMap);
        };

        releaseAttachedWorldEntity = function() {
            console.log("Release WE PieceAttachment", this.getActiveAttachment());
            this.attachmentJoint.detatchAttachedEntity();
        };

        getActiveAttachment = function() {
            this.attachmentJoint.getAttachedEntity();
        };

        activateNow = function(weight, timeScale) {

        };
    }

    export { PieceAttachment }

