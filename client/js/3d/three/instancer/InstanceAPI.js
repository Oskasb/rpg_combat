"use strict";


define([
        '3d/three/instancer/InstanceBuffer',
        '3d/three/instancer/GeometryInstance'
    ],
    function(
        InstanceBuffer,
        GeometryInstance
    ) {

        var instanceBuffers = {};

        var instances = {};
        var materials = [];

        var uiSystems = {};

        var systemTime = 0;

        var attributes = {
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

        var InstanceAPI = function() {};


        InstanceAPI.registerGeometry = function(id, model, settings, material) {

            if (materials.indexOf(material) === -1) {
                materials.push(material);
            }

            var count = settings.instances;
            var attribs = settings.attributes;

            var buffers = {};
            InstanceBuffer.extractFirstMeshGeometry(model.scene.children[0], buffers);
            var insBufs = new InstanceBuffer(buffers.verts, buffers.uvs, buffers.indices, buffers.normals);

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

        InstanceAPI.instantiateGeometry = function(id, callback) {
            if (!instances[id]) {
                instances[id] = []
            }
            var idx = instances[id].length;
            instanceBuffers[id].setInstancedCount(idx+1);
            var instance = new GeometryInstance(id, idx, instanceBuffers[id]);
            instances[id].push(instance);
            callback(instance);
        };

        InstanceAPI.setupInstancingBuffers = function(msg) {

            var uiSysId     = msg[0];
            var assetId     = msg[1];
            var bufferNames = msg[2];
            var buffers     = msg[3];
            var order       = msg[4];

            if (!uiSystems[uiSysId]) {
                uiSystems[uiSysId] = [];
            }

            var assetLoaded = function(src, asset) {

                var instanceBuffers = asset.instanceBuffers;
                for (var i = 0; i < bufferNames.length; i++) {
                    var attrib = attributes[bufferNames[i]];
                    instanceBuffers.attachAttribute(buffers[i], bufferNames[i], attrib.dimensions, attrib.dynamic)
                }

                instanceBuffers.setRenderOrder(order)
                uiSystems[uiSysId].push(instanceBuffers);
            }

            ThreeAPI.loadThreeAsset('MODELS_', assetId, assetLoaded);

        };

        var updateUiSystemBuffers = function(instanceBuffers) {

            instanceBuffers.setInstancedCount(instanceBuffers.updateBufferStates(systemTime));
        };

        var quat;
        var tempVec = new THREE.Vector3();
        var i;

        InstanceAPI.updateInstances = function(tpf) {

            systemTime += tpf;

            for (var key in uiSystems) {
                for (i = 0; i < uiSystems[key].length; i++) {
                    updateUiSystemBuffers(uiSystems[key][i])
                }
            }

            var mat;

            ThreeAPI.setGlobalUniform('fogDensity', ThreeAPI.readEnvironmentUniform('fog', 'density'));
            ThreeAPI.setGlobalUniform( 'fogColor' ,ThreeAPI.readEnvironmentUniform('fog', 'color'));
            ThreeAPI.setGlobalUniform( 'sunLightColor' ,ThreeAPI.readEnvironmentUniform('sun', 'color'));
            ThreeAPI.setGlobalUniform( 'ambientLightColor' ,ThreeAPI.readEnvironmentUniform('ambient', 'color'));

            quat = ThreeAPI.readEnvironmentUniform('sun', 'quaternion');
            tempVec.set(0, 0, -1);
            tempVec.applyQuaternion(quat);
            ThreeAPI.setGlobalUniform( 'sunLightDirection' ,tempVec);

            for (i = 0; i < materials.length; i++) {
                mat = materials[i];
                if (mat.uniforms) {
                    if (mat.uniforms.systemTime) {
                        mat.uniforms.systemTime.value = systemTime;
                    } else {
                        console.log("no uniform yet...")
                    }
                }

            }

        };


        return InstanceAPI;
    });

