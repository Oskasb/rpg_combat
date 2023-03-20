
import {PipelineObject} from "./PipelineObject.js";
class LoadSequencer {
    constructor(assetStore, assetMap, assetType, assetId, callback) {

        let assetKey = assetType+assetId;

        if (assetStore[assetKey]) {
            callback(assetStore[assetKey])
        }

        let configLoaded = function(src, data) {
            console.log("Config Present;", src, data);
            //    PipelineAPI.removeCategoryKeySubscriber('CONFIGS', assetKey, configLoaded)
            let acallback = function(asset) {
                console.log('asset loaded:', asset, assetKey, assetStore)
                PipelineAPI.setCategoryKeyValue('ASSET', assetKey, asset);
                if ( assetStore[assetKey]) {
                    console.log("Asset Already stored...", assetKey)
                } else {
                    assetStore[assetKey] = asset;
                }

                callback(assetStore[assetKey])
                //    PipelineAPI.removeCategoryKeySubscriber('ASSET', assetKey, callback)
            };

            if (assetStore[assetKey]) {
                console.log('ALREADY loaded asset:', assetKey, assetStore[assetKey])
                acallback(assetStore[assetKey])
            } else {
                console.log('load asset:', assetKey)
                new assetMap[assetType](assetId, data.config, acallback);
            }

        };

        let cachedConfig = PipelineAPI.readCachedConfigKey('CONFIGS', assetKey);
        if (cachedConfig === assetKey) {
            console.log("Cache not ready: ", cachedConfig);
            //    new PipelineObject('CONFIGS', assetKey, configLoaded)
            PipelineAPI.subscribeToCategoryKey('CONFIGS', assetKey, configLoaded);
        } else {
            configLoaded(assetKey, cachedConfig);
        }

    }

}

export { LoadSequencer }