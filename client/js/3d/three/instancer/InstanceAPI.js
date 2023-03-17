import {InstanceBuffer} from './InstanceBuffer.js';
import {GeometryInstance} from './GeometryInstance.js';

class InstanceAPI {
    constructor() {
        this.modelCount = 0;
        this.tempVec = new THREE.Vector3();
        this.instanceBuffers = {};

        this.instances = {};
        this.materials = [];
        this.uiSystems = {};
        this.systemTime = 0;
        this.attributes = {
            "startTime"      : { "dimensions":1, "dynamic":true },
            "duration"       : { "dimensions":1, "dynamic":false},
            "offset"         : { "dimensions":3, "dynamic":false},
            "texelRowSelect" : { "dimensions":4, "dynamic":false},
            "lifecycle"      : { "dimensions":4, "dynamic":false},
            "tileindex"      : { "dimensions":2                 },
            "sprite"         : { "dimensions":4, "dynamic":false},
            "diffusors"      : { "dimensions":4, "dynamic":false},
            "vertexColor"    : { "dimensions":4, "dynamic":false},
            "scale3d"        : { "dimensions":3, "dynamic":false},
            "orientation"    : { "dimensions":4, "dynamic":false}
        };
    }

    addToModelCount() {
        this.modelCount++;
    }

    getModelCount() {
        return this.modelCount;
    }

        registerGeometry = function(id, model, settings, material) {

            if (this.materials.indexOf(material) === -1) {
                this.materials.push(material);
            }

            var count = settings.instances;
            var attribs = settings.attributes;

            var buffers = {};
            var insBufs = new InstanceBuffer(buffers.verts, buffers.uvs, buffers.indices, buffers.normals);
            insBufs.extractFirstMeshGeometry(model.scene.children[0], buffers);


            for (var i = 0; i < attribs.length; i++) {
                var attrib = attributes[attribs[i]];
                var buffer = insBufs.buildBuffer(attrib.dimensions, count);
                insBufs.attachAttribute(buffer, attribs[i], attrib.dimensions, attrib.dynamic);
            }

            insBufs.setMaterial(material);
            instanceBuffers[id] = insBufs;
            instanceBuffers[id].setInstancedCount(0);
            insBufs.addToScene(settings.cameraspace);
            return insBufs;
        };

        instantiateGeometry = function(id, callback) {
            if (!instances[id]) {
                instances[id] = []
            }
            var idx = instances[id].length;
            instanceBuffers[id].setInstancedCount(idx+1);
            var instance = new GeometryInstance(id, idx, instanceBuffers[id]);
            instances[id].push(instance);
            callback(instance);
        };

        setupInstancingBuffers = function(msg) {

            let _this = this;
            let uiSysId     = msg[0];
            let assetId     = msg[1];
            let bufferNames = msg[2];
            let buffers     = msg[3];
            let order       = msg[4];

            if (!this.uiSystems[uiSysId]) {
                this.uiSystems[uiSysId] = [];
            }

            let assetLoaded = function(src, asset) {

                let instanceBuffers = asset.instanceBuffers;
                for (let i = 0; i < bufferNames.length; i++) {
                    let attrib = attributes[bufferNames[i]];
                    instanceBuffers.attachAttribute(buffers[i], bufferNames[i], attrib.dimensions, attrib.dynamic)
                }

                instanceBuffers.setRenderOrder(order)
                _this.uiSystems[uiSysId].push(instanceBuffers);
            }

            ThreeAPI.loadThreeAsset('MODELS_', assetId, assetLoaded);

        };



        updateInstances = function(tpf) {

            let updateUiSystemBuffers = function(instanceBuffers) {

                instanceBuffers.setInstancedCount(instanceBuffers.updateBufferStates( this.systemTime));
            };



            this.systemTime += tpf;

            for (let key in this.uiSystems) {
                for (let i = 0; i < this.uiSystems[key].length; i++) {
                    updateUiSystemBuffers(this.uiSystems[key][i])
                }
            }

            ThreeAPI.setGlobalUniform( 'fogDensity', ThreeAPI.readEnvironmentUniform('fog', 'density'));
            ThreeAPI.setGlobalUniform( 'fogColor' ,ThreeAPI.readEnvironmentUniform('fog', 'color'));
            ThreeAPI.setGlobalUniform( 'sunLightColor' ,ThreeAPI.readEnvironmentUniform('sun', 'color'));
            ThreeAPI.setGlobalUniform( 'ambientLightColor' ,ThreeAPI.readEnvironmentUniform('ambient', 'color'));

            let quat = ThreeAPI.readEnvironmentUniform('sun', 'quaternion');
            this.tempVec.set(0, 0, -1);
            this.tempVec.applyQuaternion(quat);
            ThreeAPI.setGlobalUniform( 'sunLightDirection' ,this.tempVec);

            for (let i = 0; i < this.materials.length; i++) {
                let mat = this.materials[i];
                if (mat.uniforms) {
                    if (mat.uniforms.systemTime) {
                        mat.uniforms.systemTime.value = this.systemTime;
                    } else {
                        console.log("no uniform yet...")
                    }
                }

            }

        };

    }

export { InstanceAPI };
