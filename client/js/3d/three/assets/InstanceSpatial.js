"use strict";

define([
        'evt'
    ],
    function(
        evt
    ) {

    var tempVec1 = new THREE.Vector3();

        var InstanceSpatial = function(obj3d) {
            this.obj3d = obj3d;
            this.frameMovement = new THREE.Vector3();
        };

        InstanceSpatial.prototype.getFrameMovement = function() {
            return this.frameMovement;
        };

        InstanceSpatial.prototype.getSpatialPosition = function() {
            return this.obj3d.position;
        };

        InstanceSpatial.prototype.setPosXYZ = function(x, y, z) {
            this.frameMovement.copy(this.obj3d.position);
            this.obj3d.position.x = x;
            this.obj3d.position.y = y;
            this.obj3d.position.z = z;
            this.frameMovement.sub(this.obj3d.position);
            if (this.geometryInstance) {
                this.geometryInstance.applyObjPos();
            }
        };

        InstanceSpatial.prototype.setQuatXYZW = function(x, y, z, w) {
            this.obj3d.quaternion.x = x;
            this.obj3d.quaternion.y = y;
            this.obj3d.quaternion.z = z;
            this.obj3d.quaternion.w = w;
            if (this.geometryInstance) {
                this.geometryInstance.applyObjQuat();
            }
        };

        InstanceSpatial.prototype.setScaleXYZ = function(x, y, z) {
            this.obj3d.scale.x = x;
            this.obj3d.scale.y = y;
            this.obj3d.scale.z = z;
            if (this.geometryInstance) {
                this.geometryInstance.applyObjScale();
            }
        };


        InstanceSpatial.prototype.attachToDynamicJoint = function(dynamicJoint) {
            this.dynamicJoint = dynamicJoint;
        };


        InstanceSpatial.prototype.stickToDynamicJoint = function() {

            let obj3d = this.dynamicJoint.obj3d;

            this.obj3d.position.copy(obj3d.position);
            this.obj3d.scale.copy(obj3d.scale);
            this.obj3d.quaternion.copy(obj3d.quaternion);

            if (this.geometryInstance) {
                this.geometryInstance.applyObjPos();
                this.geometryInstance.applyObjQuat();
                this.geometryInstance.applyObjScale();
            }

        };


        InstanceSpatial.prototype.updateSpatialFrame = function() {

            if (this.dynamicJoint) {
            //    this.dynamicJoint.stickToBoneWorldMatrix();
                this.stickToDynamicJoint()
            }

        };

        InstanceSpatial.prototype.updateSpatialMatrix = function() {

            if (!this.geometryInstance) {
                this.obj3d.updateMatrixWorld();
            }

        };


        InstanceSpatial.prototype.setGeometryInstance = function(geomIns) {
            this.geometryInstance = geomIns;
        };

        return InstanceSpatial;

    });


