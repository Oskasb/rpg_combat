"use strict";

define([
        'PipelineAPI',
        'application/PipelineObject',
        '3d/three/ThreeInstanceBufferModel',
        '3d/three/ThreeTerrain'
    ],
    function(
        PipelineAPI,
        PipelineObject,
        ThreeInstanceBufferModel,
        ThreeTerrain
    ) {


        var isLoading = [];
        var modelFileIndex;
        var modelPool = {};
        var modelList = {};
        var activeModels = {};
        var activeMixers = [];



        var contentUrl = function(url) {
            return 'content'+url.slice(1);
        };

        var saveJsonUrl = function(json, url) {
            var shiftUrl = url.slice(1);
            PipelineAPI.saveJsonFileOnServer(json, shiftUrl)
        };


        var getModelFileById = function(id) {

            for (var i = 0; i < modelFileIndex.length; i++) {
                if (modelFileIndex[i].id === id) {
                    return modelFileIndex[i]
                }
            }
            console.log("No model file by id:", id, modelFileIndex);
            return false;
        };

        var getGroupSkinnedMesh = function(children) {

            for (var j = 0; j < children.length; j++) {
                console.log("Types:", children[j].type);

                if (children[j].type === 'Group') {
                    console.log("Use the SkinnedMesh", children[j]);
                    return getGroupSkinnedMesh(children[j]);
                }

                if (children[j].type === 'SkinnedMesh') {
                    console.log("Use the SkinnedMesh", children[j]);
                    return children[j];
                }

                if (children[j].children.length) {
                    return getGroupSkinnedMesh(children[j].children);
                }
            }
        };


        var cloneGltf = function(mesh, clone) {

            if (mesh.animations.length) {
                clone.animations = mesh.animations;

                var skinnedMeshes = {};

                mesh.traverse(function(node) {
                    if (node.isSkinnedMesh) {
                        skinnedMeshes[node.name] = node;
                    }
                });

                var cloneBones = {};
                var cloneSkinnedMeshes = {};

                clone.traverse(function(node) {
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

                console.log("CloneAnimated SkinMesh..", clone, mesh);
            }

            return clone
        };


        var poolMesh = function(id, mesh, count) {
            var poolCount = count || 1;

            if (!modelPool[id]) {
                modelPool[id] = [];
            }

            for (var i = 0; i < poolCount; i++) {

                if (mesh.type === 'Group') {

                    var clone = mesh;
                    clone.mixer = new THREE.AnimationMixer( clone );
                    clone.animations = mesh.animations;

                } else {

                    if (mesh.animations) {

                        var clone = mesh.clone();

                        clone.userData = {};

                    } else {
                        var clone = mesh.clone();
                    }

                }

                clone.userData.poolId = id;
                clone.frustumCulled = false;
                modelPool[id].push(clone);

                if (PipelineAPI.readCachedConfigKey("MESH_LIST", id) !== mesh) {
                    PipelineAPI.setCategoryKeyValue("MESH_LIST", id, mesh);
                }

                MATH.quickSplice(isLoading, id);

            }

            //    console.log("CACHE MESH", [id, modelPool, clone, mesh]);
        };

        var cacheMesh = function(id, mesh, pool) {

            PipelineAPI.setCategoryKeyValue('THREE_MODEL', id, mesh);
            poolMesh(id, mesh, pool)
        };


        var loadFBX = function(modelId, pool) {


            // Makes a Group

            console.log("load fbx:", modelId,  modelList[modelId].url+'.FBX')

            var err = function(e, x) {
                console.log("FBX ERROR:", e, x);
            };

            var prog = function(p, x) {
                console.log("FBX PROGRESS:", p, x);
            };


            /*

                      fbxWorker.onmessage = function(msg) {

                          var jsonLoader = new THREE.ObjectLoader();

                          var parsed = jsonLoader.parse(msg.data[1])

                          console.log("FBX WORKER RESPONSE: ", msg.data[0], parsed, msg.data[1]);

                          cacheMesh(modelId, parsed, pool);

                      }.bind(this);

                      fbxWorker.postMessage([modelId, modelList[modelId].url+'.FBX']);
             /*
           */
            var loader = new THREE.FBXLoader();
            //   loader.options.convertUpAxis = true;
            loader.load( modelList[modelId].url+'.FBX', function ( model ) {
                console.log("FBX LOADED: ",model);

                cacheMesh(modelId, model, pool);
                console.log("Model List & Pool:", modelList[modelId], modelPool);
            }, prog, err);

        };

        var loadGLB = function(modelFileData) {

            // Makes a Scene
            var modelId = modelFileData.id;
            var obj;
            var animations = [];
            var animationMap = {};

            var loadCalls = 0;

            console.log("load glb:", modelFileData.id,  modelFileData.url+'.glb')

            var err = function(e, x) {
                console.log("glb ERROR:", e, x);
            };

            var prog = function(p, x) {
                console.log("glb PROGRESS:", p, x);
            };


            var notifyFileLoad = function() {
                loadCalls--;

                if (!loadCalls) {

                    var clone1 = obj.clone(true);

                    obj.clone = function() {
                        var clone = clone1.clone(true);
                        return cloneGltf(obj, clone);
                    };

                    cacheMesh(modelId, obj, 3);
                }
            };

            var loaded = function ( model ) {
                console.log("glb LOADED: ",model);
                model.animations = animations;

                obj = model.scene;

                obj.animations = animations;

                console.log("cache glb obj: ", obj);

                modelFileData.originalModel = obj;

                console.log("Model List & Pool:", modelFileData, modelPool);

                notifyFileLoad();

            };


            var loadModel = function(src) {
                loadCalls++;
                var loader = new THREE.GLTFLoader();
                loader.load(src, loaded, prog, err);
            };


            var loadAnimation = function(animMap, key) {

                loadCalls++;

                var animLoaded = function(animScene) {
                    for (var i = 0; i < animScene.animations.length; i++) {
                        animScene.animations[i].name = key;
                        animations.push(animScene.animations[i]);
                        animMap[key].indices.push(animations.length-1);
                    }

                    animMap[key].animation = scene.animations;
                    notifyFileLoad()

                };

                var loader = new THREE.GLTFLoader();
                loader.load(animMap[key].url, animLoaded, prog, err);

            };

            if (modelFileData.animations) {
                var animMap = modelFileData.animations;
                for (var key in animMap) {
                    animationMap[key] = {
                        name:key,
                        url:animMap[key]+'.glb',
                        indices:[]
                    };
                    loadAnimation(animationMap, key)
                }
            }

            loadModel(modelFileData.url+'.glb')

        };

        var loadCollada = function(modelId, pool) {

            var loader = new THREE.ColladaLoader();
            //    loader.options.convertUpAxis = true;
            loader.load( modelList[modelId].url+'.DAE', function ( collada ) {
                var model = collada.scene;

                console.log("DAE LOADED: ",model);

                cacheMesh(modelId, model, pool);
                console.log("Model Pool:", modelPool);
            });
        };



        var getMesh = function(object, id, cb) {

            if ( object instanceof THREE.Mesh ) {
                cb(object, id);
            }

            if (typeof(object.traverse) != 'function') {
                console.log("No Traverse function", object);
                return;
            }

            object.traverse( function ( child ) {
                //    object.remove(child);

                if ( child instanceof THREE.Mesh ) {
                    //    var geom = child.geometry;
                    //    child.geometry = geom;
                    //    geom.uvsNeedUpdate = true;
                    //    console.log("Obj Mesh: ", child);
                    cb(child, id);
                }
            });
        };

        var LoadObj = function(modelId, pool) {

            var loader = new THREE.OBJLoader();

            var loadUrl = function(url, id, meshFound) {

                if (typeof(baseUrl) !== 'undefined') {

                    pool = 1;

                    url = url.substr(2);

                    url = baseUrl+url;
                    //            console.log(url);
                }

                loader.load(url, function ( object ) {

                    getMesh(object, id, meshFound)
                });
            };

            var uv2Found = function(uv2mesh, mid) {
                var meshObj = PipelineAPI.readCachedConfigKey('THREE_MODEL', mid);

                //        console.log(meshObj, uv2mesh, uv2mesh.geometry.attributes.uv);
                meshObj.geometry.addAttribute('uv2',  uv2mesh.geometry.attributes.uv);
                uv2mesh.geometry.dispose();
                uv2mesh.material.dispose();
                cacheMesh(mid, meshObj, pool);
            };

            var modelFound = function(child, mid) {
                PipelineAPI.setCategoryKeyValue('THREE_MODEL', mid, child);

                if (modelList[modelId].urluv2) {
                    loadUrl(modelList[modelId].urluv2+'.obj', modelId, uv2Found)
                } else {
                    cacheMesh(mid, child, pool);
                }
            };

            loadUrl(modelList[modelId].url+'.obj', modelId, modelFound)

        };



        var ThreeModelLoader = function() {

        };

        ThreeModelLoader.getModelFileById = function(id) {
            return getModelFileById(id);
        };

        ThreeModelLoader.createObject3D = function() {
            return new THREE.Object3D();
        };

        ThreeModelLoader.getModelList = function() {
            return modelList;
        };

        ThreeModelLoader.getModelPool = function() {
            return modelPool;
        };


        ThreeModelLoader.extractFirstMeshGeometry = function(child, store) {

            child.traverse(function(node) {
                if (node.type === 'Mesh') {
                    store.push(node.geometry);
                }
            })

        };

        var brute = false;

        ThreeModelLoader.loadModelId = function(id) {

            var modelId = modelList[id].model;

            var modelFileData = getModelFileById(modelId);

            if (!modelFileData) {
                console.log("Bad model file request!", modelId);
                if (!brute) {
                    ThreeModelLoader.loadData();
                    brute = true;
                }

                return;
            }


            if (isLoading.indexOf(modelId) !== -1) {
                console.log("Model already loading:", modelId, isLoading);
                return;
            };

            isLoading.push(id);

            switch ( modelFileData.format )	{

                case 'dae':
                    loadCollada(id, modelList[id].pool);
                    break;

                case 'fbx':
                    loadFBX(id, modelList[id].pool);
                    break;

                case 'glb':
                    loadGLB(modelFileData);
                    break;

                default:
                    LoadObj(id, modelList[id].pool);
                    break;
            }

        };



        ThreeModelLoader.loadData = function() {


            var modelListLoaded = function(scr, data) {

                for (var i = 0; i < data.length; i++){
                    modelList[data[i].id] = data[i];
                    //    ThreeModelLoader.loadModelId(data[i].id);
                }
            };

            var modelFileIndexLoaded = function(src, data) {

                modelFileIndex = data;
                new PipelineObject("MODELS", "THREE", modelListLoaded);
                new PipelineObject("MODELS", "THREE_BUILDINGS", modelListLoaded);
                new PipelineObject("MODELS", "THREE_PHYSICS", modelListLoaded)
            };

            new PipelineObject("MODELS", "FILES", modelFileIndexLoaded);

        };


        ThreeModelLoader.loadTerrainData = function(TAPI) {
            ThreeTerrain.loadData(TAPI);
        };

        ThreeModelLoader.createObject3D = function() {
            return new THREE.Object3D();
        };

        var defaultTrf = {
            pos:   [0,   0,  0],
            rot:   [0,   0,  0],
            scale: [1,   1,  1]
        };

        var transformModel = function(trf, model) {
            model.position.x = trf.pos[0];
            model.position.y = trf.pos[1];
            model.position.z = trf.pos[2];
            model.rotation.x = trf.rot[0]*Math.PI;
            model.rotation.y = trf.rot[1]*Math.PI;
            model.rotation.z = trf.rot[2]*Math.PI;
            model.scale.x =    trf.scale[0];
            model.scale.y =    trf.scale[1];
            model.scale.z =    trf.scale[2];
        };

        var setup;

        var attachAsynchModel = function(modelId, rootObject) {

            var attachModel = function(model) {

                var childMaterial = function(child, matId, modelConf) {

                    var applyMaterial = function(src, mat) {
                        if (child.type === 'SkinnedMesh') {

                            //    model.children[i] = child.clone();
                            //    child = model.children[i];
                            //    mat = child.material
                            child.material = mat.clone();
                            child.material.skinning = true;
                            child.material.needsUpdate = true;
                        } else {
                            child.material = mat;
                        }


                        if (modelConf.canvas_textures) {

                            model.userData.dynamicTexture = modelConf.dynamic_texture;

                            if (modelConf.canvas_textures[child.name]) {

                                if (!model.userData.canvasTextures) {
                                    model.userData.canvasTextures = {}
                                }

                                if (!model.userData.canvasTextures[child.name]) {
                                    model.userData.canvasTextures[child.name] = []
                                }

                                var cnvMaps = modelConf.canvas_textures[child.name];

                                for (var i = 0; i < cnvMaps.length; i++) {
                                    var txName = modelConf.canvas_textures[child.name][i];
                                    var tx = child.material[txName];

                                    var canvas = document.createElement("canvas");

                                    canvas.width = tx.image.width;
                                    canvas.height = tx.image.height;

                                    var ctx = canvas.getContext('2d');

                                    var cnvTx = new THREE.Texture(canvas);

                                    //    cnvTx.wrapS = THREE.RepeatWrapping;
                                    //    cnvTx.wrapT = THREE.RepeatWrapping;
                                    //    cnvTx.generateMipmaps = false;

                                    cnvTx.sourceImage = tx.image;

                                    cnvTx.bufferImgId = tx.bufferImgId;
                                    cnvTx.imgUrl = tx.bufferImgId;
                                    model.userData.canvasTextures[child.name].push(cnvTx);
                                    cnvTx.ctx = ctx;

                                    cnvTx.canvas = canvas;
                                    child.material[txName] = cnvTx;
                                    console.log("Apply Canvas TX to model child: ", model);
                                }
                            }
                        }

                        model.userData.loadCount--;

                        if (model.userData.loadCount === 0) {
                            rootObject.add(model);
                        }

                    };

                    new PipelineObject('THREE_MATERIAL', matId, applyMaterial, matId);
                };

                var applyGroupMaterials = function(model, modelId) {


                    model.userData.loadCount = 0;
                    var modelConf = modelList[modelId];

                    var groupMaterials = modelConf.group_materials;

                    for (var i = 0; i < model.children.length; i++) {
                        //    model.children[i] = model.children[i].clone();

                        var child = model.children[i];

                        if (typeof(groupMaterials[child.name]) === 'string') {
                            model.userData.loadCount++;
                            childMaterial(child, groupMaterials[child.name], modelConf)
                        }
                    }

                    //
                };


                if (modelList[modelId].transform) {
                    transformModel(modelList[modelId].transform, model);
                } else {

                    transformModel(defaultTrf, model);
                }


                if (model.mixer) {

                    if (model.animations) {

                        if (model.animations.length) {

                            var action = model.mixer.clipAction( model.animations[ 0 ] );
                            //    action.play();

                            if (activeMixers.indexOf(model.mixer) === -1) {
                                activeMixers.push(model.mixer);
                            } else {
                                console.log("Mixer already active... clean up needed!", model);
                            }

                            console.log("Play Action", action);

                        }
                    }
                }

                var attachMaterial = function(src, data) {
                    model.material = data;
                    rootObject.add(model);
                };

                var skinMaterial = function(src, data) {
                    model.material = data;
                    model.material.skinning = true;
                    model.material.needsUpdate = true;
                    rootObject.add(model);
                };

                if (model.type === 'SkinnedMesh') {
                    console.log("Attach Skin Material", model);
                    new PipelineObject('THREE_MATERIAL', modelList[modelId].material, skinMaterial, modelList[modelId].material);
                    return;
                }

                if (model.type === 'Group' || model.type === 'Object3D' || model.type === 'Scene') {

                    console.log("Attach Group or Scene model", model, modelList, modelId);

                    var groupMaterial = function(src, mat) {

                        for (var i = 0; i < model.children.length; i++) {
                            var child = model.children[i];

                            child.traverse(function(node) {

                                if (node.type === 'SkinnedMesh') {
                                    node.material = mat.clone();
                                    node.material.skinning = true;
                                    node.material.needsUpdate = true;
                                }

                            });

                            if (child.type === 'SkinnedMesh') {

                                /*
                            //    model.children[i] = child.clone();

                                //    mat = child.material

                                child = model.children[i];

                                child.material = mat.clone();
                                child.material.skinning = true;
                                child.material.needsUpdate = true;
                                */
                            } else {
                                child.material = mat;
                            }
                        }
                        console.log("Attach to rootObject", rootObject);
                        rootObject.add(model);
                    };

                    if (modelList[modelId].group_materials) {
                        applyGroupMaterials(model, modelId)
                    } else {
                        new PipelineObject('THREE_MATERIAL', modelList[modelId].material, groupMaterial, modelList[modelId].material);
                    }

                    return;
                }

                if (model.material) {

                    if (model.material.userData.animMat) {
                        rootObject.add(model);
                        return;
                    }
                    //      attachMaterial(null, PipelineAPI.readCachedConfigKey('THREE_MATERIAL', modelList[modelId].material))
                    rootObject.add(model);
                    new PipelineObject('THREE_MATERIAL', modelList[modelId].material, attachMaterial, modelList[modelId].material);

                } else {

                    //    var root = new THREE.Object3D();
                    //    root.add(model)
                    //    setup.addToScene(root);
                    for (var i = 0; i < model.children.length; i++) {
                        setup.addToScene(model.children[i])
                    }
                    rootObject.add(model);
                }


            };

            //    ThreeModelLoader.loadModelId(modelId);

            ThreeModelLoader.fetchPooledMeshModel(modelId, attachModel);
        };



        ThreeModelLoader.loadThreeMeshModel = function(applies, rootObject, ThreeSetup) {

            setup = ThreeSetup;

            attachAsynchModel(applies, rootObject);
            return rootObject;
        };

        var queueFetch = function(id, cb) {
            var mId = id;
            var fCb = cb;

            ThreeModelLoader.loadModelId(mId);

            setTimeout(function() {
                ThreeModelLoader.fetchPooledMeshModel(mId, fCb)
            }, 500)
        };


        ThreeModelLoader.fetchPooledMeshModel = function(model, cb) {

            var id = modelList[model].model;


            if (!modelPool[id]) {
                console.log("Queue Fetch", id, modelPool);
                queueFetch(model, cb);
                return;
            }

            var applyModel = function(src, data) {
                var mesh;

                if (!modelPool[src].length) {
                    console.log("Increase Model Pool", id);

                    if (data.scene) {
                        mesh = data // .scene // .clone() // .children[0] // .scene.clone();

                    } else {
                        mesh = data.clone();
                    }

                    mesh.userData.poolId = src;
                } else {
                    mesh = modelPool[src].pop()
                }


                if (data.animations) {
                    mesh.mixer = new THREE.AnimationMixer( mesh );
                    mesh.animations = data.animations;
                    var action = mesh.mixer.clipAction( mesh.animations[0] );
                    action.play()
                    console.log("Load Animated Model:", mesh);
                }

                if (mesh.pipeObj) {
                    mesh.pipeObj.removePipelineObject();
                }

                mesh.pipeObj = pipeObj;
                cb(mesh)

            };

            var pipeObj = new PipelineObject('THREE_MODEL', id, applyModel, id, true);

        };


        var getPoolEntry = function(object, id, cb) {

            if (!object) {
                console.log("Bad object", id);
            }

            if (object.userData.poolId) {
                cb(object, id);
                return;
            }

            if (typeof(object) === 'undefined') {
                console.log("Bad object", id);
                return;
            }

            if (typeof(object.traverse) !== 'function') {
                console.log("No Traverse function", object);
                return;
            }


            object.traverse( function ( child ) {
                //    object.remove(child);

                if ( child.userData.poolId ) {
                    //    var geom = child.geometry;
                    //    child.geometry = geom;
                    //    geom.uvsNeedUpdate = true;
                    //    console.log("Obj Mesh: ", child);
                    cb(child, id);
                }
            });
        };


        ThreeModelLoader.returnModelToPool = function(model) {

            var meshFound = function(mesh) {

                if (!mesh) console.log("Try return nothing to the pool", model);

                if (mesh.parent) {
                    mesh.parent.remove(mesh);
                }
                if (!mesh.userData.poolId) {
                    console.log("Missing Pool ID on Mesh", mesh);
                    mesh.geometry.dispose();
                    return;
                }

                if (!mesh.pipeObj) {
                    //    console.log("No pipe on mesh", mesh)
                } else {
                    mesh.pipeObj.removePipelineObject();
                }

                modelPool[mesh.userData.poolId].push(mesh);
            };

            if (!model.userData.poolId) {
                //        console.log("Shave scrap objects from mesh before returning it...");
                getPoolEntry(model, null, meshFound)
            } else {
                meshFound(model);
            }
        };

        ThreeModelLoader.disposeHierarchy = function(model) {

            var meshFound = function(mesh) {
                mesh.geometry.dispose();
            };

            if (!model.geometry) {
                getMesh(model, null, meshFound)
            } else {
                meshFound(model);
            }
        };

        var material1 = new THREE.MeshBasicMaterial( { color: 0xff00ff, wireframe: true, fog:false } );
        var material2 = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true, fog:false } );

        var materials = {
            yellow : new THREE.MeshBasicMaterial( { color: 0xffff88, wireframe: true, fog:false } ),
            red    : new THREE.MeshBasicMaterial( { color: 0xff5555, wireframe: true, fog:false } ),
            blue    : new THREE.MeshBasicMaterial({ color: 0x5555ff, wireframe: true, fog:false } )
        };

        ThreeModelLoader.loadThreeDebugBox = function(sx, sy, sz, colorName) {

            var geometry;

            geometry = new THREE.BoxBufferGeometry( sx || 1, sy || 1, sz || 1);

            return new THREE.Mesh( geometry, materials[colorName] || material1 );
        };

        ThreeModelLoader.loadThreeModel = function(sx, sy, sz) {

            var geometry;

            geometry = new THREE.SphereBufferGeometry( sx, 10, 10);

            return new THREE.Mesh( geometry, material2 );
        };

        ThreeModelLoader.loadThreeQuad = function(sx, sy) {

            var geometry;

            geometry = new THREE.PlaneBufferGeometry( sx || 1, sy || 1, 1 ,1);
            material2 = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true } );

            return new THREE.Mesh( geometry, material2 );
        };

        ThreeModelLoader.loadGroundMesh = function(applies, array1d, rootObject, ThreeSetup, partsReady) {
            ThreeTerrain.loadTerrain(applies, array1d, rootObject, ThreeSetup, partsReady);
            return rootObject;
        };

        ThreeModelLoader.removeGroundMesh = function(pos) {
            var terrain = ThreeTerrain.getThreeTerrainByPosition(pos);
            if (!terrain) {
                console.log("No terrain found at position", pos);
                return;
            }
            terrain.model.children[0].geometry.dispose();
            setup.removeModelFromScene(terrain.model);
            setup.removeModelFromScene(terrain.model.children[0]);
            ThreeTerrain.removeTerrainFromIndex(terrain);

        };


        ThreeModelLoader.terrainVegetationAt = function(pos, nmStore) {
            return ThreeTerrain.terrainVegetationIdAt(pos, nmStore);
        };

        ThreeModelLoader.getHeightFromTerrainAt = function(pos, normalStore) {
            return ThreeTerrain.getThreeHeightAt(pos, normalStore);
        };

        ThreeModelLoader.attachInstancedModelTo3DObject = function(modelId, rootObject, ThreeSetup) {

        };

        ThreeModelLoader.applyMaterialToMesh = function(material, model) {
            model.material = material;
        };

        ThreeModelLoader.getPooledModelCount = function() {
            var pool = 0;
            for (var key in modelPool) {
                pool += modelPool[key].length;
            }
            return pool;
        };

        ThreeModelLoader.updateActiveMixers = function(tpf) {

            for (var i = 0; i < activeMixers.length; i++) {
                activeMixers[i].update(tpf);
            }

        };

        return ThreeModelLoader;
    });