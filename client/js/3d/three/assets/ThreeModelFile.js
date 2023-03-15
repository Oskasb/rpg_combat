"use strict";

define([
        'application/ExpandingPool',
        '3d/three/assets/InstanceSpatial'
    ],
    function(
        ExpandingPool,
        InstanceSpatial
    ) {

        var ThreeModelFile = function(id, config, callback) {

        //    console.log("ThreeModelFile", id, config);

            this.id = id;


            var instantiateAsset = function(assetId, callback) {
                this.cloneSkinnedModelOriginal(callback)
            }.bind(this);

            this.expandingPool = new ExpandingPool(this.id, instantiateAsset);

            var modelLoaded = function(glb) {
            //    console.log("glb loaded", glb);
                this.scene = glb;
                callback(this);
            }.bind(this);

            loadGLB(config.url, modelLoaded)
        };

        ThreeModelFile.prototype.returnCloneToPool = function(spatial) {
            ThreeAPI.hideModel(spatial.obj3d);

            if (this.expandingPool.pool.indexOf(spatial) !== -1) {
                console.log("Bad Model recovery", this.id, spatial, this);
                return;
            }

            this.expandingPool.returnToExpandingPool(spatial);
        };

        ThreeModelFile.prototype.getCloneFromPool = function(callback) {
            this.expandingPool.getFromExpandingPool(callback)
        };


        ThreeModelFile.prototype.cloneMeshModelOriginal = function() {
            return this.scene.clone();
        };

        ThreeModelFile.prototype.cloneSkinnedModelOriginal = function(callback) {
            var clone = cloneGltf(this.scene, this.cloneMeshModelOriginal());
            clone.frustumCulled = false;
            var spatial = new InstanceSpatial(clone);
            callback(spatial)
        };

        var loader = new THREE.GLTFLoader();

        var loadGLB = function(url, cacheMesh) {

            // Makes a Scene

            var obj;
            var animations = [];

            var err = function(e, x) {
                console.log("glb ERROR:", e, x);
            };

            var prog = function(p, x) {
            //    console.log("glb PROGRESS:", p, x);
            };

            var loaded = function ( model ) {

                obj = model.scene;
                obj.animations = model.animations;

                cacheMesh(obj);
            };

            var loadModel = function(src) {

                loader.load(src, loaded, prog, err);
            };

            loadModel(url+'.glb')

        };

        var cloneGltf = function(mesh, clone) {

                var skinnedMeshes = {};

                mesh.traverse(function(node) {
                    if (node.isSkinnedMesh) {
                        skinnedMeshes[node.name] = node;
                    }
                });

                var cloneBones = {};
                var cloneSkinnedMeshes = {};

                clone.traverse(function(node) {
                    node.frustumCulled = false;
                    if (node.isBone) {
                        cloneBones[node.name] = node;
                    }

                    if (node.isSkinnedMesh) {
                        cloneSkinnedMeshes[node.name] = node;
                    }
                });

                for (var name in skinnedMeshes) {
                    var skinnedMesh = skinnedMeshes[name];
                    var skeleton = skinnedMesh.skeleton;
                    var cloneSkinnedMesh = cloneSkinnedMeshes[name];

                    var orderedCloneBones = [];

                    for (var i = 0; i < skeleton.bones.length; ++i) {
                        var cloneBone = cloneBones[skeleton.bones[i].name];
                        orderedCloneBones.push(cloneBone);
                    }

                    cloneSkinnedMesh.bind(
                        new THREE.Skeleton(orderedCloneBones, skeleton.boneInverses),
                        cloneSkinnedMesh.matrixWorld);
                }

            return clone
        };

        return ThreeModelFile;

    });