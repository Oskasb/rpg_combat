"use strict";

define([

    ],
    function(

    ) {

        var PieceAttachment = function(key, workerData, attachmentJoint) {
            this.key = key;
            this.dataKey = 'joints';
            this.workerData = workerData;
            this.attachmentJoint = attachmentJoint;
        };

        PieceAttachment.prototype.getData = function() {
            return this.workerData.readDataKey(this.dataKey)[this.key];
        };

        PieceAttachment.prototype.setAttachedWorldEntity = function(worldEntity) {
            this.attachmentJoint.registerAttachedEntity(worldEntity, this.getData());
        };

        PieceAttachment.prototype.releaseAttachedWorldEntity = function() {
            console.log("Release WE PieceAttachment", this.getActiveAttachment());
            this.attachmentJoint.detatchAttachedEntity();
        };

        PieceAttachment.prototype.getActiveAttachment = function() {
            this.attachmentJoint.getAttachedEntity();
        };

        PieceAttachment.prototype.activateNow = function(weight, timeScale) {

        };

        return PieceAttachment;

    });

