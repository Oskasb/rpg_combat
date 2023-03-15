"use strict";

define([
        'application/ExpandingPool',
        '3d/three/assets/InstancedModel'
    ],
    function(
        ExpandingPool,
        InstancedModel
    ) {

    var datakey = 'MODELS_';

        var ThreeAsset = function(assetId, assetReadyCallback) {
            this.id = assetId;

            var instantiateAsset = function(assetId, callback) {
                var modelInstance = new InstancedModel(this);
                modelInstance.assetId = assetId;
                modelInstance.initModelInstance(callback);
            }.bind(this);

            this.expandingPool = new ExpandingPool(this.id, instantiateAsset);
            this.initAssetConfigs(assetId, assetReadyCallback);
        };

        ThreeAsset.prototype.initAssetConfigs = function(assetId, cb) {

            var assetLoaded = function(src, asset) {
                this.finaliseAsset(asset, cb)
            }.bind(this);

            ThreeAPI.loadThreeAsset(datakey, assetId, assetLoaded);

        };

        ThreeAsset.prototype.finaliseAsset = function(model, cb) {

            this.model = model;
            cb(this);
        };

        ThreeAsset.prototype.instantiateAsset = function(callback) {
            this.expandingPool.getFromExpandingPool(callback);
            //    var modelInstance = new InstancedModel(this);
            //      modelInstance.initModelInstance(callback);
        };

        ThreeAsset.prototype.disableAssetInstance = function(modelInstance) {
            modelInstance.detatchAllAttachmnets();

            if (modelInstance.assetId !== this.id) {
                console.log("wrong ID returned", modelInstance, this);
                return;
            }

            this.expandingPool.returnToExpandingPool(modelInstance);

        };

        return ThreeAsset;

    });