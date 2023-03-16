"use strict";

define([
        'PipelineAPI',
        '3d/three/assets/ThreeModel',
        '3d/three/assets/ThreeRig',
        '3d/three/assets/ThreeMaterial',
        '3d/three/assets/ThreeTexture',
        '3d/three/assets/ThreeModelSettings',
        '3d/three/assets/ThreeModelFile',
        '3d/three/assets/ThreeMaterialSettings',
        '3d/three/assets/ThreeTextureSettings',
        '3d/three/assets/ThreeImage'
    ],
    function(
        PipelineAPI,
        ThreeModel,
        ThreeRig,
        ThreeMaterial,
        ThreeTexture,
        ThreeModelSettings,
        ThreeModelFile,
        ThreeMaterialSettings,
        ThreeTextureSettings,
        ThreeImage
    ) {

        var assetMap = {
            MODELS_:            ThreeModel,
            RIGS_:              ThreeRig,
            MATERIALS_:         ThreeMaterial,
            TEXTURES_:          ThreeTexture,
            MODEL_SETTINGS_:    ThreeModelSettings,
            MATERIAL_SETTINGS_: ThreeMaterialSettings,
            TEXTURE_SETTINGS_:  ThreeTextureSettings,
            FILES_GLB_:         ThreeModelFile,
            FILES_IMAGES_:      ThreeImage
        };

        var assets = {};

        var AssetLoader = function() {

        };

        AssetLoader.prototype.initAssetConfigs = function() {

            var loadList = function(src, data) {
                this.loadAssetConfigs(data);
            }.bind(this);

            PipelineAPI.subscribeToCategoryKey('ASSETS', 'LOAD', loadList);
        };

        AssetLoader.prototype.loadAssetConfigs = function(assets) {

            var assetData = function(src, data) {

                for (var i = 0; i < data.length; i++) {
                    this.setAssetConfig(src, data[i].id, data[i]);
                }

            }.bind(this);

            for (var i = 0; i < assets.length; i++) {
                PipelineAPI.subscribeToCategoryKey('ASSETS', assets[i], assetData);
            }

        };

        AssetLoader.prototype.setAssetConfig = function(assetType, assetId, data) {
            PipelineAPI.setCategoryKeyValue('CONFIGS', assetType+'_'+assetId, data);
        };


        var setupAsset = function(assetType, assetId) {

            var assetKey = assetType+assetId;

            if (assets[assetKey]) {
                return;
            }

            var configLoaded = function(src, data) {

                var callback = function(asset) {
                    PipelineAPI.setCategoryKeyValue('ASSET', assetKey, asset);
                //    PipelineAPI.removeCategoryKeySubscriber('ASSET', assetKey, callback)
                };

                if (assets[assetKey]) {

                } else {
                    assets[assetKey] = new assetMap[assetType](assetId, data.config, callback);
                }

            };

            var cachedConfig = PipelineAPI.readCachedConfigKey('CONFIGS', assetKey);
            if (cachedConfig === assetKey) {
                PipelineAPI.subscribeToCategoryKey('CONFIGS', assetKey, configLoaded);
            } else {
                configLoaded(assetKey, cachedConfig);
            }

        };


        var loadAsset = function(assetType, assetId, callback) {
            var assetKey = assetType+assetId;
            var cachedAsset = PipelineAPI.readCachedConfigKey('ASSET', assetKey);
            if (cachedAsset === assetKey) {
                PipelineAPI.subscribeToCategoryKey('ASSET', assetKey, callback);
                setupAsset(assetType, assetId);
            } else {
            //    PipelineAPI.removeCategoryKeySubscriber('ASSET', assetKey, callback)
                callback(assetKey, cachedAsset);
            }
        };

        AssetLoader.prototype.loadAsset = function(assetType, assetId, callback) {
            loadAsset(assetType, assetId, callback)
        };

        return AssetLoader;

    });