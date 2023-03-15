"use strict";

define([
        'application/ExpandingPool',
        '3d/three/instancer/InstanceAPI',
        '3d/three/assets/InstanceSpatial'
    ],
    function(
        ExpandingPool,
        InstanceAPI,
        InstanceSpatial
    ) {

    var models = 0;

        var ThreeModel = function(id, config, callback) {

            models++;
            this.modelNr = models;

            this.config = config;

            this.id = id;

            this.jointMap = {};
            this.joints = {};
            this.jointKeys = [];

            this.animMap = {};
            this.animations = {};
            this.animationKeys = [];

            this.hasAnimations = false;

            var materialLoaded = function(src, asset) {
            //    console.log(src, asset);
                this.material = asset;

                if (this.geometryInstancingSettings()) {
                    this.setupGeometryInstancing()
                }

                callback(this);
            }.bind(this);

            var modelSettingsLoaded = function(src, asset) {
             //   console.log(src, asset);
                this.settings = asset.settings;
                ThreeAPI.loadThreeAsset('MATERIALS_', config.material, materialLoaded);
            }.bind(this);

            var modelFilesLoaded = function(src, asset) {
                 ThreeAPI.loadThreeAsset('MODEL_SETTINGS_', config.settings, modelSettingsLoaded);
            }.bind(this);

            this.loadModelFiles(config, modelFilesLoaded)

        };

        ThreeModel.prototype.geometryInstancingSettings = function() {
        //    console.log(this.settings.instancing)
            return this.settings.instancing;
        };

        ThreeModel.prototype.setupGeometryInstancing = function() {

            var instancingSettings = this.geometryInstancingSettings();
            this.instanceBuffers = InstanceAPI.registerGeometry(this.id, this.model, instancingSettings, this.material.getAssetMaterial());

            var instantiateAsset = function(id, callback) {

                var instanceCb = function(geomIns) {
                    var spatial = new InstanceSpatial(geomIns.obj3d);
                    spatial.setGeometryInstance(geomIns);
                    callback(spatial);
                };

                InstanceAPI.instantiateGeometry(this.id, instanceCb);
            }.bind(this);

            this.expandingPool = new ExpandingPool(this.id, instantiateAsset);
        };

        ThreeModel.prototype.getAnimationClip = function(animationClipKey) {
            var animScene = this.animations[animationClipKey].scene;
            return animScene.animations[0]
        };

        ThreeModel.prototype.loadModelFiles = function(config, callback) {

            var rqs = 0;
            var rds = 0;

            var loadCheck = function() {
                if (rqs === rds) {
                    callback()
                }
            };

            var animLoaded = function(src, asset) {
                rds++;
                this.animations[this.animMap[asset.id]] = asset;
                loadCheck()
            }.bind(this);

            var fileLoaded = function(src, asset) {
                rds++;
                this.model = asset;
                loadCheck()
            }.bind(this);


            var loadRig = function(src, rig) {

                if (rig.joints) {
                    for (var i = 0; i < rig.joints.length; i++) {
                        var bone_name = rig.joints[i]['bone_name'];
                        var key = rig.joints[i].key;
                        this.jointMap[key] = bone_name;
                        if (typeof(ENUMS.Joints[key]) !== 'number') {
                            console.log("No joint ENUM mapped for key: ", key)
                        }
                        this.jointKeys.push(ENUMS.Joints[key]);
                    }
                }

                if (rig.animations) {
                    this.hasAnimations = true;
                    for (var i = 0; i < rig.animations.length; i++) {
                        var id = rig.animations[i].id;
                        var key = rig.animations[i].key;
                        this.animMap[id] = key;
                        if (typeof(ENUMS.Animations[key]) !== 'number') {
                            console.log("No animation ENUM mapped for key: ", key)
                        }
                        this.animationKeys.push(ENUMS.Animations[key]);

                        rqs++;
                        ThreeAPI.loadThreeAsset('FILES_GLB_', id, animLoaded);
                    }
                }
                rds++;
            }.bind(this);

            if (config['rig']) {
                rqs++;
                ThreeAPI.loadThreeAsset('RIGS_', config['rig'], loadRig);
            }

            ThreeAPI.loadThreeAsset('FILES_GLB_', config.model, fileLoaded);
            rqs++;
            loadCheck();

        };

        ThreeModel.prototype.recoverModelClone = function(spatial) {

            if (this.geometryInstancingSettings()) {
                spatial.setPosXYZ(20+this.modelNr*5, 5+this.expandingPool.poolEntryCount()*0.3, 30);
                spatial.setScaleXYZ(0.2, 0.2, 0.2);

                if (this.expandingPool.pool.indexOf(spatial) !== -1) {
                    console.log("Bad pool recovery", this.id, spatial, this);
                    return;
                }

            //    this.expandingPool.returnToExpandingPool(spatial);
            } else {
            //    this.model.returnCloneToPool(spatial);
                ThreeAPI.hideModel(spatial.obj3d);
            }

        };

        ThreeModel.prototype.getModelMaterial = function() {
            return this.material.getAssetMaterial();
        };

        ThreeModel.prototype.getModelClone = function(callback) {

            if (this.geometryInstancingSettings()) {
                this.expandingPool.getFromExpandingPool(callback);
            } else {
                this.model.getCloneFromPool(callback);
            }

        };

        return ThreeModel;

    });