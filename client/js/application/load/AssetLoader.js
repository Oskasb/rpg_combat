import {ThreeModel} from '../../3d/three/assets/ThreeModel.js';
import {ThreeRig} from '../../3d/three/assets/ThreeRig.js';
import {ThreeMaterial} from '../../3d/three/assets/ThreeMaterial.js';
import {ThreeTexture} from '../../3d/three/assets/ThreeTexture.js';
import {ThreeModelSettings} from '../../3d/three/assets/ThreeModelSettings.js';
import {ThreeModelFile} from '../../3d/three/assets/ThreeModelFile.js';
import {ThreeMaterialSettings} from '../../3d/three/assets/ThreeMaterialSettings.js';
import {ThreeTextureSettings} from '../../3d/three/assets/ThreeTextureSettings.js';
import {ThreeImage} from '../../3d/three/assets/ThreeImage.js';

class AssetLoader {
    constructor() {

        this.assetMap = {
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

        this.assets = {};

        };

        initAssetConfigs = function() {

            let loadList = function(src, data) {
                this.loadAssetConfigs(data);
            }.bind(this);

            PipelineAPI.subscribeToCategoryKey('ASSETS', 'LOAD', loadList);
        };

        loadAssetConfigs = function(assets) {

            let assetData = function(src, data) {

                for (let i = 0; i < data.length; i++) {
                    this.setAssetConfig(src, data[i].id, data[i]);
                }

            }.bind(this);

            for (let i = 0; i < assets.length; i++) {
                PipelineAPI.subscribeToCategoryKey('ASSETS', assets[i], assetData);
            }

        };

        setAssetConfig = function(assetType, assetId, data) {
            PipelineAPI.setCategoryKeyValue('CONFIGS', assetType+'_'+assetId, data);
        };



        loadAsset = function(assetType, assetId, callback) {

            let assetMap = this.assetMap;
            let assets = this.assets;

            let setupAsset = function(assetType, assetId) {

                let assetKey = assetType+assetId;

                if (assets[assetKey]) {
                    return;
                }

                let configLoaded = function(src, data) {

                    let callback = function(asset) {
                        PipelineAPI.setCategoryKeyValue('ASSET', assetKey, asset);
                        //    PipelineAPI.removeCategoryKeySubscriber('ASSET', assetKey, callback)
                    };

                    if (assets[assetKey]) {

                    } else {
                        assets[assetKey] = new assetMap[assetType](assetId, data.config, callback);
                    }

                };

                let cachedConfig = PipelineAPI.readCachedConfigKey('CONFIGS', assetKey);
                if (cachedConfig === assetKey) {
                    PipelineAPI.subscribeToCategoryKey('CONFIGS', assetKey, configLoaded);
                } else {
                    configLoaded(assetKey, cachedConfig);
                }

            };


            let initLoadAsset = function(assetType, assetId, callback) {
                let assetKey = assetType+assetId;
                let cachedAsset = PipelineAPI.readCachedConfigKey('ASSET', assetKey);
                if (cachedAsset === assetKey) {
                    PipelineAPI.subscribeToCategoryKey('ASSET', assetKey, callback);
                    setupAsset(assetType, assetId);
                } else {
                    //    PipelineAPI.removeCategoryKeySubscriber('ASSET', assetKey, callback)
                    callback(assetKey, cachedAsset);
                }
            };


            initLoadAsset(assetType, assetId, callback)
        };
    }

export { AssetLoader };