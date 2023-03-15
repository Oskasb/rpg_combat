

"use strict";

define([

        '3d/three/ThreeModelLoader'
    ],
    function(
        ThreeModelLoader
    ) {

        var stampVerts = [
            -1,  0,  1,
            1,   0,  1,
            -1,  0, -1,
            1,   0, -1
        ];

        var quadVerts = [
            -1, -1, 0,
            1,  -1, 0,
            -1,  1, 0,
            1,   1, 0
        ];


        var quadUvs = [
            0, 0,
            1, 0,
            0, 1,
            1, 1
        ];

        var quadInds =[
            0, 1, 2,
            2, 1, 3
        ];

        var plantUvs = [
            0, 0,
            1, 0,
            0, 1,
            1, 1,
            1, 0,
            0, 0,
            1, 1,
            0, 1
        ];

        var plantInds =[
            0, 1, 2,
            2, 1, 3,
            4, 5, 6,
            6, 5, 7
        ];


        var plantVerts = [
            // Front
            -1, -0.2,  0.1,
            1, -0.2, -0.1,
            -1,  1.8,  0.1,
            1,  1.8, -0.1,

            // Left
            0.1, -0.2, -1,
            -0.1, -0.2,  1,
            0.1,  1.8, -1,
            -0.1,  1.8,  1

        ];


        var cross3Verts = [
            // Front
            -1,  1, 0,
            1,   1, 0,
            -1, -1, 0,
            1,  -1, 0,
            // Back
            1,  1,  0,
            -1,  1, 0,
            1, -1,  0,
            -1, -1, 0,
            // Left
            0,  1, -1,
            0,  1,  1,
            0, -1, -1,
            0, -1,  1,
            // Right
            0,  1,  1,
            0,  1, -1,
            0, -1,  1,
            0, -1, -1,
            // Top
            -1, 0,  1,
            1,  0,  1,
            -1, 0, -1,
            1,  0, -1,
            // Bottom
            1,  0,  1,
            -1, 0,  1,
            1,  0, -1,
            -1, 0, -1
        ];


        var trailGeometry = new THREE.PlaneBufferGeometry(2, 2, 5, 1);



        var ParticleMesh = function() {2

        };

        var plantclamped = false;

        ParticleMesh.plant3d = function() {
            if (!plantclamped) {
                for (var i = 0; i < plantUvs.length; i++) {
                    plantUvs[i] = MATH.clamp(plantUvs[i], 0.01, 0.99);
                }
                plantclamped = true;
            }

            return {verts:plantVerts, indices:plantInds, uvs:plantUvs};
        };

        ParticleMesh.cross3d = function() {
            return {verts:cross3Verts, indices:boxIndices, uvs:boxUvs};
        };

        ParticleMesh.quad = function() {
            return {verts:quadVerts, indices:quadInds, uvs:quadUvs};
        };

        ParticleMesh.trail5 = function() {

            console.log("trailGeometry :", trailGeometry);

            var verts = trailGeometry.attributes.position.array;
            var uv =    trailGeometry.attributes.uv.array;
            var ind =   trailGeometry.index.array;

            return {verts:verts, indices:ind, uvs:uv};
        };


        ParticleMesh.stamp = function() {
            return {verts:stampVerts, indices:quadInds, uvs:quadUvs};
        };

        var boxclamped = false;

        var boxNormals;
        var boxVerts = [];

        var boxUvs = [];

        var boxIndices = [];

        ParticleMesh.box3d = function() {

            if (!boxclamped) {

                var box = new THREE.BoxBufferGeometry(1, 1, 1, 1, 1, 1);

                boxVerts   = box.attributes.position.array;
                boxNormals = box.attributes.normal.array;
                boxUvs     = box.attributes.uv.array;
                boxIndices = box.index.array;
                for (var i = 0; i < boxUvs.length; i++) {
                    boxUvs[i] = MATH.clamp(boxUvs[i], 0.01, 0.99);
                }
                boxclamped = true;
            }

            return {verts:boxVerts, indices:boxIndices, normals:boxNormals, uvs:boxUvs};
        };

        var geomStore = {};

        var queueLoad = function(conf, cb) {

            //    console.log("Queue Load:", [window], conf);

            setTimeout(function() {
                ParticleMesh.modelGeometry(conf, cb)
            }, 1000);

        };


        ParticleMesh.modelGeometry = function(modelConf, callback) {

            //    callback(ParticleMesh.box3d());
            //    return;

            var modelId = modelConf.model_id;

            if (!geomStore[modelId]) {

                var modelPool = ThreeModelLoader.getModelPool();

                var modelList = ThreeModelLoader.getModelList();

                if (!modelList[modelId]) {

                    if (typeof(window.outerWidth) !== 'number') {
                        console.log("model ID requested in worker", modelId, modelList);
                        geomStore[modelId] = ParticleMesh.box3d();
                        callback(geomStore[modelId]);
                        return;
                    }
                    console.log("Bad model ID on main thread", modelId, modelList);
                    //    ThreeModelLoader.loadModelId(modelId);
                    //    queueLoad(modelConf, callback);
                    return;
                }

                var modelFile = ThreeModelLoader.getModelFileById(modelList[modelId].model);

                console.log("ParticleModelPool:", modelId, modelList[modelId].model, modelList, modelPool, modelFile);

                if (!modelFile.originalModel) {
                    ThreeModelLoader.loadModelId(modelId);
                    queueLoad(modelConf, callback);
                    return;
                }

                if (!modelFile.originalModel) {
                    console.log("No Original Model Found!");
                    //    queueLoad(modelConf, callback);
                    return;
                }

                var store = [];
                ThreeModelLoader.extractFirstMeshGeometry(modelFile.originalModel.children[0], store);

                if (!store.length) {
                    console.log("No geometry found for:", modelFile.originalModel.children[0])
                }

                var geometry = store.pop();

                var verts   = geometry.attributes.position.array;
                var normals = geometry.attributes.normal.array;
                var uvs     = geometry.attributes.uv.array;
                var index   = geometry.index.array;
                geomStore[modelId] = {verts:verts, uvs:uvs, indices:index, normals:normals}
            }

            console.log("Setup particle Mesh geometry", modelId, geometry, geomStore[modelId]);

            callback(geomStore[modelId]);
        };

        return ParticleMesh;

    });