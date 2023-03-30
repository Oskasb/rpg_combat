class AttachmentJoint {
    constructor(key, parentScale, dynamicBoneId) {
        this.key = key;
        this.dynamicBoneId = dynamicBoneId;
        this.parentScale = parentScale;
        this.obj3d = new THREE.Object3D();

        this.dynamicPosition = new THREE.Vector3();

        this.attachedSpatial = null;

        this.positionUpdateCallbacks = [];

        let attachEffect = function(effect) {
            effect.attachToJoint(this)
        }.bind(this);

        this.callbacks = {
            attachEffect:attachEffect
        }
        this.jointDataApplied = false;

    };

    getJointKey = function() {
        return this.key;
    };

    getAttachEffectCallback = function() {
        return this.callbacks.attachEffect;
    };

    inheritJointDynamicPosition = function() {
        this.dynamicBone.stickToBoneWorldMatrix();

        let spatObj = this.dynamicBone.obj3d;
        spatObj.position.add(this.obj3d.position);
        spatObj.scale.multiply(this.obj3d.scale);
        spatObj.quaternion.multiply(this.obj3d.quaternion);

        this.attachedSpatial.stickToDynamicJoint(this.dynamicBone);

        MATH.callAll(this.positionUpdateCallbacks, this.dynamicPosition)

    };

    addPositionUpdateCallback = function(cb) {
        this.positionUpdateCallbacks.push(cb)
    };

    removePositionUpdateCallback = function(cb) {
        MATH.quickSplice(this.positionUpdateCallbacks, cb);
    };

    getDynamicPosition = function(storeVec) {
        storeVec.copy(this.dynamicPosition);
    };

    applyJointData = function(jointData) {
        console.log("joint apply data");
        this.jointDataApplied = true;
            this.obj3d.position.x = jointData.offset[0];
        this.obj3d.position.y = jointData.offset[1];
        this.obj3d.position.z = jointData.offset[2];

        this.obj3d.quaternion.set(0, 0, 0, 1);
        this.obj3d.rotateX(jointData.rot[0]);
        this.obj3d.rotateY(jointData.rot[1]);
        this.obj3d.rotateZ(jointData.rot[2]);

        this.obj3d.scale.x = jointData.scale[0];
        this.obj3d.scale.y = jointData.scale[1];
        this.obj3d.scale.z = jointData.scale[2];
        this.obj3d.scale.multiply(this.parentScale);
        this.obj3d.position.multiply(this.obj3d.scale)
    };

    detachAttachedEntity = function() {
        this.attachedSpatial.dynamicJoint = null;
        this.attachedSpatial = null;
        return this;
    };

    getAttachedEntity = function() {
        return this.attachedSpatial;
    };

    registerAttachedSpatial = function(spatial, joint, dynamicBones) {
        this.attachedSpatial = spatial;

        if (!this.jointDataApplied) {
            this.joint = joint;
            this.applyJointData(joint);
            this.dynamicBone = dynamicBones[this.dynamicBoneId]
        }

     //   spatial.attachToDynamicJoint(this.dynamicBone);

     //   console.log("registerAttachedEntity", spatial, this.dynamicBone);
        return this;

    };

}

export { AttachmentJoint }