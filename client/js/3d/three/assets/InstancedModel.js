"use strict";

define([
        '3d/three/assets/InstanceAnimator',
        '3d/three/assets/InstanceDynamicJoint',
        'evt'
    ],
    function(
        InstanceAnimator,
        InstanceDynamicJoint,
        evt
    ) {

        var InstancedModel = function(originalAsset) {
            this.originalAsset = originalAsset;
            this.originalModel = originalAsset.model;

            var onUpdateEvent = function(event) {
                this.handleUpdateEvent(event)
            }.bind(this);

            this.callbacks = {
                onUpdateEvent :onUpdateEvent
            };

            this.active = ENUMS.InstanceState.INITIATING;

            this.boneMap = {};
            this.attachments = [];
        };

        InstancedModel.prototype.getAssetId = function() {
            return this.originalAsset.id;
        };

        InstancedModel.prototype.setPointer = function(ptr) {
            this.clearEventListener();
            this.ptr = ptr;
            this.setupEventListener();
        };

        InstancedModel.prototype.getPointer = function() {
            return this.ptr;
        };

        InstancedModel.prototype.getSpatial = function() {
            return this.spatial;
        };

        InstancedModel.prototype.handleUpdateEvent = function(event) {
            evt.parser.parseEntityEvent(this, event);
        };

        InstancedModel.prototype.requestAttachment = function(attachInstance) {
            this.attachInstancedModel(attachInstance);
        };

        InstancedModel.prototype.getDynamicJoint = function(jointEnum) {
            var boneName = this.originalModel.jointMap[ENUMS.getKey('Joints', jointEnum)];
            this.boneMap[boneName].setJointEnum(jointEnum)
            return this.boneMap[boneName];
        };

        InstancedModel.prototype.requestAttachToJoint = function(attachInstance, dynJoint) {
            attachInstance.getSpatial().attachToDynamicJoint(dynJoint);
        };


        InstancedModel.prototype.setupEventListener = function() {
            evt.on(this.ptr, this.callbacks.onUpdateEvent)
        };

        InstancedModel.prototype.clearEventListener = function() {
            evt.removeListener(this.ptr, this.callbacks.onUpdateEvent)
        };

        InstancedModel.prototype.initModelInstance = function(callback) {

            var cloned = function(spatial) {
                this.spatial = spatial;
                this.obj3d = spatial.obj3d;
                this.applyModelMaterial(this.obj3d , this.originalModel.getModelMaterial());


                if (this.originalModel.hasAnimations) {
                    if (this.obj3d.animator) {
                        this.animator = this.obj3d.animator
                    } else {
                        this.animator = new InstanceAnimator(this);
                        this.obj3d.animator = this.animator;
                    }
                }

                callback(this)
            }.bind(this);

            this.originalModel.getModelClone(cloned)
        };

        InstancedModel.prototype.applyModelMaterial = function(clone, material) {

            var _this = this;

            clone.traverse(function(node) {
                if (node.type === 'Mesh') {
                    node.material = material;
                }
                if (node.type === 'SkinnedMesh') {
                    _this.skinNode = node;
                    node.material = material;
                    material.skinning = true;
                }
            });
            this.mapBones();
        };

        InstancedModel.prototype.setActive = function(ENUM) {
            this.active = ENUM;
            if (this.active !== ENUMS.InstanceState.DECOMISSION ) {
                this.activateInstancedModel();

                this.decomissioned = false;

            } else {
                if (this.decomissioned) {
                    console.log("Already decomissioned", this);
                    return;
                }
                this.decomissioned = true;
                this.decommissionInstancedModel();
            }
        };


        InstancedModel.prototype.getObj3d = function() {
            return this.obj3d;
        };

        InstancedModel.prototype.mapBones = function() {

            var mapSkinBones = function(parent) {
                var parentSkel = parent.skeleton;

                for (var i = 0; i < parentSkel.bones.length; i++) {
                    var boneName = parentSkel.bones[i].name;
                    _this.boneMap[boneName] = new InstanceDynamicJoint(parentSkel.bones[i], _this);
                }

            };

            var _this = this;

            if (this.skinNode) {
                mapSkinBones(_this.skinNode);

                for (var key in this.originalModel.jointMap) {
                    if (key !== 'SKIN') {
                        let boneName = this.originalModel.jointMap[key];
                        let dynJoint = this.boneMap[boneName];
                        dynJoint.setJointEnum(ENUMS.Joints[key])
                    }
                }

            }
        };


        InstancedModel.prototype.attachInstancedModel = function(instancedModel) {

            var getBoneByName = function(bones, name) {
                for (var i = 0; i < bones.length; i++) {
                    if (bones[i].name === name) {
                        return bones[i];
                    }
                }
                console.log("No bone by name:", name);
            };

            var replaceChildBones = function(parent, child) {
                var parentSkel = parent.skeleton;
                var childSkel = child.skeleton;

                for (var i = 0; i < childSkel.bones.length; i++) {
                    var boneName = childSkel.bones[i].name;
                    var useBone = getBoneByName(parentSkel.bones, boneName);
        //            console.log("USE BONEe:", useBone);
                    childSkel.bones[i] = useBone;
                }
            };

            var _this = this;
            instancedModel.obj3d.traverse(function(node) {
                if (node.type === 'Mesh') {
                    console.log("Not SkinnedMesh", _this.skinNode);
                }
                if (node.type === 'SkinnedMesh') {

                    if (_this.skinNode) {

                        replaceChildBones(_this.skinNode, node);

                    }
                }
            });

            this.obj3d.add(instancedModel.obj3d);
            this.attachments.push(instancedModel)

        };

        InstancedModel.prototype.detatchInstancedModel = function(instancedModel) {
            this.obj3d.remove(instancedModel.obj3d);
        //    instancedModel.decommissionInstancedModel()
        };

        InstancedModel.prototype.detatchAllAttachmnets = function() {
            while (this.attachments.length) {
                this.detatchInstancedModel(this.attachments.pop())
            }
        };

        InstancedModel.prototype.getAnimationMap = function() {
            return this.originalModel.animMap;
        };

        var unifVec = {x:0, y:0, z:0}

        InstancedModel.prototype.updateSpatialWorldMatrix = function() {

        //    this.getSpatial().updateSpatialMatrix();


            for (var key in this.originalModel.jointMap) {

                if (key === 'FOOT_L' || key === 'FOOT_R') {

                }

                if (key !== 'SKIN') {

                    let boneName = this.originalModel.jointMap[key];

                    let dynJoint = this.boneMap[boneName];

                    if (!dynJoint) {
                        console.log("No dynJoint", key)
                    } else {
                        //        console.log(key)
                        dynJoint.updateSpatialFrame()
                    }

            //
                }
            }



            let moveDist = this.getSpatial().getFrameMovement();
            if (moveDist.lengthSq()) {
                let pos =  this.getSpatial().getSpatialPosition();
                unifVec.x = pos.x;
                unifVec.y = pos.y;
                unifVec.z = pos.z;
                ThreeAPI.registerDynamicGlobalUniform('character',unifVec)
                moveDist.set(0, 0, 0);
            }

        };



        InstancedModel.prototype.updateAnimationState = function(animationKey, weight, timeScale, fade, channel, loop, clamp, sync) {
            this.animator.updateAnimationAction(animationKey, weight, timeScale, fade, channel, loop, clamp, sync);
        };

        InstancedModel.prototype.activateInstancedModel = function() {
            this.isDecomiisisoned = false;
            ThreeAPI.addToScene(this.obj3d);
            if (this.animator) {
                this.animator.activateAnimator();
            }
        };

        InstancedModel.prototype.decommissionInstancedModel = function() {

            WorkerAPI.getDynamicMain().removeFromIsntanceIndex(this);

            if (this.isDecomiisisoned) {
                console.log("Already Decomissioned");
            }
            this.isDecomiisisoned = true;


            this.clearEventListener();
            if (this.animator) {
                this.animator.deActivateAnimator();
            }
            this.originalModel.recoverModelClone(this.getSpatial());
            this.originalAsset.disableAssetInstance(this);
        };

        return InstancedModel;

    });