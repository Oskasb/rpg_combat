class PieceAttachment {
    constructor(key, joint, attachmentJoint) {
            this.key = key;
            this.joint = joint;
            this.attachmentJoint = attachmentJoint;
        };

        setAttachedSpatial = function(spatial) {
            return this.attachmentJoint.registerAttachedSpatial(spatial, this.joint);
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

