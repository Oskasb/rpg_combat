class InstanceDynamicJoint {
    constructor(bone, instancedModel) {
        this.tempVec1 = new THREE.Vector3();
        this.bone = bone;
        this.instancedModel = instancedModel;
        this.obj3d = new THREE.Object3D();
        this.offsetObj3d = new THREE.Object3D();
        this.jointArgs = [];
    }


        setJointEnum = function(jointEnum) {
            this.jointEnum = jointEnum
        };

        getOffsetObj3D = function() {
            return this.offsetObj3d;
        };

        stickToBoneWorldMatrix = function() {

            this.bone.matrixWorld.decompose(this.obj3d.position, this.obj3d.quaternion, this.obj3d.scale);

            if (this.offsetObj3d.position.lengthSq()) {
                this.tempVec1.copy(this.offsetObj3d.position);
                this.tempVec1.applyQuaternion(this.obj3d.quaternion);
                this.obj3d.position.add(this.tempVec1);
            }

            this.tempVec1.setFromMatrixScale(this.bone.matrixWorld);
            this.obj3d.scale.divide(this.tempVec1);
            this.obj3d.scale.multiply(this.offsetObj3d.scale);
            this.obj3d.quaternion.multiply(this.offsetObj3d.quaternion);



            this.jointArgs[0] = ENUMS.Event.DYNAMIC_JOINT;
            this.jointArgs[1] = this.jointEnum;
            this.jointArgs[2] = this.obj3d.position.x;
            this.jointArgs[3] = this.obj3d.position.y;
            this.jointArgs[4] = this.obj3d.position.z;

        //    evt.fire(this.instancedModel.getPointer()+ENUMS.Numbers.PTR_PING_OFFSET, this.jointArgs);

        };

        updateSpatialFrame = function() {
            if (this.instancedModel.active) {
                this.stickToBoneWorldMatrix()
            }

        };

    };

export { InstanceDynamicJoint };
