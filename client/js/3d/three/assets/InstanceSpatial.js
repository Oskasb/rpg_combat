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


        attachToDynamicJoint = function(dynamicJoint) {
            this.dynamicJoint = dynamicJoint;
        };


        stickToDynamicJoint = function(dynamicJoint) {

            let obj3d = dynamicJoint.obj3d;

            this.obj3d.position.copy(obj3d.position);
            this.obj3d.scale.copy(obj3d.scale);
            this.obj3d.quaternion.copy(obj3d.quaternion);

            if (this.geometryInstance) {
                this.geometryInstance.applyObjPos();
                this.geometryInstance.applyObjQuat();
                this.geometryInstance.applyObjScale();
            }

        };


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
