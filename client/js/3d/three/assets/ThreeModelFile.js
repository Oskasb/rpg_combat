import {ExpandingPool} from '../../../application/utils/ExpandingPool.js';
import {InstanceSpatial} from './InstanceSpatial.js';

        class ThreeModelFile {
            constructor(id, config, callback) {

        //    console.log("ThreeModelFile", id, config);

            this.id = id;


            let instantiateAsset = function(assetId, callback) {
                this.cloneSkinnedModelOriginal(callback)
            }.bind(this);

            this.expandingPool = new ExpandingPool(this.id, instantiateAsset);

                let modelLoaded = function(glb) {
            //    console.log("glb loaded", glb);
                this.scene = glb;
                callback(this);
            }.bind(this);



                let loader = new THREE.GLTFLoader();
                let loadGLB = function(url, cacheMesh) {

                    // Makes a Scene

                    let obj;
                    let animations = [];

                    let err = function(e, x) {
                        console.log("glb ERROR:", e, x);
                    };

                    let prog = function(p, x) {
                        //    console.log("glb PROGRESS:", p, x);
                    };

                    let loaded = function ( model ) {

                        obj = model.scene;
                        obj.animations = model.animations;

                        cacheMesh(obj);
                    };

                    let loadModel = function(src) {

                        loader.load(src, loaded, prog, err);
                    };

                    loadModel(url+'.glb')

                };

            loadGLB(config.url, modelLoaded)
        };

        returnCloneToPool = function(spatial) {
            ThreeAPI.hideModel(spatial.obj3d);

            if (this.expandingPool.pool.indexOf(spatial) !== -1) {
                console.log("Bad Model recovery", this.id, spatial, this);
                return;
            }

            this.expandingPool.returnToExpandingPool(spatial);
        };

        getCloneFromPool = function(callback) {
            this.expandingPool.getFromExpandingPool(callback)
        };


        cloneMeshModelOriginal = function() {
            return this.scene.clone();
        };

        cloneSkinnedModelOriginal = function(callback) {

            let cloneGltf = function(mesh, clone) {

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


            var clone = cloneGltf(this.scene, this.cloneMeshModelOriginal());
            clone.frustumCulled = false;
            var spatial = new InstanceSpatial(clone);
            callback(spatial)
        };

    }

export { ThreeModelFile };