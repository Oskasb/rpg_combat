class InstanceSpatial{

        constructor(obj3d) {
            this.obj3d = obj3d;
            this.frameMovement = new THREE.Vector3(0.0, 0.01, 0.0);
        };

        getFrameMovement = function() {
            return this.frameMovement;
        };

        getSpatialPosition = function() {
            return this.obj3d.position;
        };

        setPosXYZ = function(x, y, z) {
            this.frameMovement.copy(this.obj3d.position);
            this.obj3d.position.x = x;
            this.obj3d.position.y = y;
            this.obj3d.position.z = z;
            this.frameMovement.sub(this.obj3d.position);
            if (this.geometryInstance) {
                this.geometryInstance.applyObjPos();
            }
        };

        setRotXYZ = function(x, y, z) {
            let obj3d = this.obj3d;
            obj3d.quaternion.x = 0;
            obj3d.quaternion.y = 1;
            obj3d.quaternion.z = 0;
            obj3d.quaternion.w = 0;
            obj3d.rotateX(x);
            obj3d.rotateY(y);
            obj3d.rotateZ(z)
            if (this.geometryInstance) {
                this.geometryInstance.applyObjQuat();
            }
        };
        setQuatXYZW = function(x, y, z, w) {
            this.obj3d.quaternion.x = x;
            this.obj3d.quaternion.y = y;
            this.obj3d.quaternion.z = z;
            this.obj3d.quaternion.w = w;
            if (this.geometryInstance) {
                this.geometryInstance.applyObjQuat();
            }
        };

        setScaleXYZ = function(x, y, z) {
            this.obj3d.scale.x = x;
            this.obj3d.scale.y = y;
            this.obj3d.scale.z = z;
            if (this.geometryInstance) {
                this.geometryInstance.applyObjScale();
            }
        };

        setPosVec3 = function(posVec3) {
            this.obj3d.position.copy(posVec3);
            if (this.geometryInstance) {
                this.geometryInstance.applyObjPos();
            }
        };

        rotateXYZ = function(x, y, z) {
            this.obj3d.rotateX(x);
            this.obj3d.rotateY(y);
            this.obj3d.rotateZ(z);
            if (this.geometryInstance) {
                this.geometryInstance.applyObjQuat();
            }
        };

        applySpatialUpdateToBuffers() {
            if (this.geometryInstance) {
                this.geometryInstance.applyObjQuat();
                this.geometryInstance.applyObjScale();
                this.geometryInstance.applyObjPos();
            }
        }

        attachToDynamicJoint = function(dynamicJoint) {
            this.dynamicJoint = dynamicJoint;
        };

        stickToDynamicJoint = function(dynamicJoint) {
            this.stickToObj3D(dynamicJoint.obj3d);
        };

        stickToObj3D(obj3d) {
            this.obj3d.position.copy(obj3d.position);
            this.obj3d.scale.copy(obj3d.scale);
            this.obj3d.quaternion.copy(obj3d.quaternion);

            if (this.geometryInstance) {
                this.geometryInstance.applyObjPos();
                this.geometryInstance.applyObjQuat();
                this.geometryInstance.applyObjScale();
            }
        }

        updateSpatialFrame = function() {

        };

        updateSpatialMatrix = function() {

            if (!this.geometryInstance) {
                this.obj3d.updateMatrixWorld();
            }

        };

        setGeometryInstance = function(geomIns) {
            this.geometryInstance = geomIns;
            this.geometryInstance.applyObjPos();
            this.geometryInstance.applyObjQuat();
            this.geometryInstance.applyObjScale();

        };

    }

export {InstanceSpatial}
