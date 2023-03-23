import {InstanceBuffer} from './InstanceBuffer.js';
import {GeometryInstance} from './GeometryInstance.js';

class InstanceAPI {
    constructor() {
    //    console.log('INIT InstanceAPI');
        this.bufferCuont = 0;
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
        this.bufferCuont++
        let extractFirstMeshGeometry = function(child, buffers) {

            child.traverse(function(node) {
                if (node.type === 'Mesh') {
                    let geometry = node.geometry;
                    buffers.verts   = geometry.attributes.position.array;
                    buffers.normals = geometry.attributes.normal.array;
                    buffers.uvs     = geometry.attributes.uv.array;
                    buffers.indices = geometry.index.array;
                }
            });

        };

        if (this.materials.indexOf(material) === -1) {
            this.materials.push(material);
        }

        let count = settings.instances;
        let attribs = settings.attributes;

        let buffers = {};
        extractFirstMeshGeometry(model.scene.children[0], buffers);
        let insBufs = new InstanceBuffer(buffers.verts, buffers.uvs, buffers.indices, buffers.normals);
        insBufs.mesh.name = id+' '+this.bufferCuont+' '+material.id;
     //   insBufs.extractFirstMeshGeometry(model.scene.children[0], buffers);


        for (let i = 0; i < attribs.length; i++) {
            let attrib = this.attributes[attribs[i]];
            let buffer = insBufs.buildBuffer(attrib.dimensions, count);
            insBufs.attachAttribute(buffer, attribs[i], attrib.dimensions, attrib.dynamic);
        }

        insBufs.setMaterial(material);
        this.instanceBuffers[id] = insBufs;
        this.instanceBuffers[id].setInstancedCount(0);
        insBufs.addToScene(settings.cameraspace);
        return insBufs;
    };

    instantiateGeometry = function(id, callback) {
        if (!this.instances[id]) {
            this.instances[id] = []
        }
        let idx = this.instances[id].length;
        this.instanceBuffers[id].setInstancedCount(idx+1);
        let instance = new GeometryInstance(id, idx, this.instanceBuffers[id]);
        this.instances[id].push(instance);
        callback(instance);
    };

    getUiSysInstanceBuffers = function(uiSysKey) {
        return this.uiSystems[uiSysKey];
    };

    setupInstancingBuffers = function(msg) {

        let uiSysId     = msg[0];
        let assetId     = msg[1];
        let bufferNames = msg[2];
        let buffers     = msg[3];
        let order       = msg[4];

    //    console.log("setupInstancingBuffers: ", assetId);

        if (!this.uiSystems[uiSysId]) {
            this.uiSystems[uiSysId] = [];
        }

        let assetLoaded = function(threeModel) {
        //    console.log("assetLoaded: ", threeModel.id);
            let instanceBuffers = threeModel.instanceBuffers;
            for (let i = 0; i < bufferNames.length; i++) {
                let attrib = this.attributes[bufferNames[i]];
                instanceBuffers.attachAttribute(buffers[i], bufferNames[i], attrib.dimensions, attrib.dynamic)
            }

            instanceBuffers.setRenderOrder(order)
            this.uiSystems[uiSysId].push(instanceBuffers);
        }.bind(this);

       ThreeAPI.loadThreeAsset('MODELS_', assetId, assetLoaded);

    };



    updateInstances = function(tpf, systemTime) {

        let updateUiSystemBuffers = function(instanceBuffers) {
            instanceBuffers.setInstancedCount(instanceBuffers.updateBufferStates( systemTime));
        };

        this.systemTime = systemTime;

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
            if (mat) {
                if (mat.uniforms) {
                    if (mat.uniforms.systemTime) {
                        mat.uniforms.systemTime.value = this.systemTime;
                    } else {
                        console.log("no uniform yet...")
                    }
                }
            } else {
                console.log("no material yet...")
            }

        }

    };

}

export { InstanceAPI };
