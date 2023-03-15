"use strict";

define([
        'evt'
    ],
    function(
        evt
    ) {

        var tempVec1 = new THREE.Vector3();

        var InstanceDynamicJoint = function(bone, instancedModel) {
            this.bone = bone;
            this.instancedModel = instancedModel;
            this.obj3d = new THREE.Object3D();
            this.offsetObj3d = new THREE.Object3D();
        };


        InstanceDynamicJoint.prototype.setJointEnum = function(jointEnum) {
            this.jointEnum = jointEnum
        };

        InstanceDynamicJoint.prototype.getOffsetObj3D = function() {
            return this.offsetObj3d;
        };

        var jointArgs = [];

        InstanceDynamicJoint.prototype.stickToBoneWorldMatrix = function() {

            this.bone.matrixWorld.decompose(this.obj3d.position, this.obj3d.quaternion, this.obj3d.scale);

            if (this.offsetObj3d.position.lengthSq()) {
                tempVec1.copy(this.offsetObj3d.position);
                tempVec1.applyQuaternion(this.obj3d.quaternion);
                this.obj3d.position.add(tempVec1);
            }

            tempVec1.setFromMatrixScale(this.bone.matrixWorld);
            this.obj3d.scale.divide(tempVec1);
            this.obj3d.scale.multiply(this.offsetObj3d.scale);
            this.obj3d.quaternion.multiply(this.offsetObj3d.quaternion);



            jointArgs[0] = ENUMS.Event.DYNAMIC_JOINT;
            jointArgs[1] = this.jointEnum;
            jointArgs[2] = this.obj3d.position.x;
            jointArgs[3] = this.obj3d.position.y;
            jointArgs[4] = this.obj3d.position.z;

            evt.fire(this.instancedModel.getPointer()+ENUMS.Numbers.PTR_PING_OFFSET, jointArgs);

        };


        InstanceDynamicJoint.prototype.updateSpatialFrame = function() {
            if (this.instancedModel.active) {
                this.stickToBoneWorldMatrix()
            }

        };


        return InstanceDynamicJoint;

    });


