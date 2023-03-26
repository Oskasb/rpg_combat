class PieceAttachment {
    constructor(key, workerData, attachmentJoint) {
            this.key = key;
            this.dataKey = 'joints';
            this.workerData = workerData;
            this.attachmentJoint = attachmentJoint;
        };

        getData = function() {
            return this.workerData.readDataKey(this.dataKey)[this.key];
        };

        setAttachedWorldEntity = function(worldEntity) {
            this.attachmentJoint.registerAttachedEntity(worldEntity, this.getData());
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

