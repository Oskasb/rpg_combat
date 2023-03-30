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

        let inheritJoint = function() {
            this.inheritJointDynamicPosition()
        }.bind(this);

        let applyBones = function(boneMap) {
            this.applyBoneMap(boneMap)
        }.bind(this);

        this.callbacks = {
            updateAttachedSpatial:inheritJoint,
            applyBoneMap:applyBones,
            attachEffect:attachEffect
        }

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

    applyJointOffsets = function(jointData) {
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

    applyBoneMap(boneMap) {
        this.dynamicBone = boneMap[this.dynamicBoneId]
    };

    registerAttachedSpatial = function(spatial, joint, dynamicBones) {
        this.attachedSpatial = spatial;

     //   spatial.attachToDynamicJoint(this.dynamicBone);
        return this;

    };

}

export { AttachmentJoint }