
import {PipelineObject} from "./PipelineObject.js";
class LoadSequencer {
    constructor(assetStore, assetMap, assetType, assetId, loadRequests) {

        let assetKey = assetType+assetId;

        let callLoadRequests = function(aStore, aKey) {
            while (loadRequests[aKey].length) {
           //     console.log('callLoadRequests:', loadRequests[aKey], aKey, aStore[aKey])
                loadRequests[aKey].pop()(aStore[aKey])
            }
        };

        if (assetStore[assetKey]) {

            callLoadRequests(assetStore, assetKey)
        }

        let configLoaded = function(src, data) {
       //     console.log("Config Present;", src, data);
            //    PipelineAPI.removeCategoryKeySubscriber('CONFIGS', assetKey, configLoaded)
            let acallback = function(asset) {
            //    console.log('asset loaded:', asset, assetKey, assetStore)
                if ( assetStore[assetKey]) {
            //        console.log("Asset Already stored...", assetKey)
                } else {
                    assetStore[assetKey] = asset;
                    PipelineAPI.setCategoryKeyValue('ASSET', assetKey, asset);
                }

                callLoadRequests(assetStore, assetKey)
                //    PipelineAPI.removeCategoryKeySubscriber('ASSET', assetKey, callback)
            };

            if (assetStore[assetKey]) {
           //     console.log('ALREADY loaded asset:', assetKey, assetStore[assetKey])
                acallback(assetStore[assetKey])
            } else {
        //        console.log('load asset:', assetKey)
                new assetMap[assetType](assetId, data.config, acallback);


            }

        };

        let cachedConfig = PipelineAPI.readCachedConfigKey('CONFIGS', assetKey);
    //    console.log("Load Sequence Load; ", assetId);
        if (cachedConfig === assetKey) {
      //      console.log("Cache not ready: ", cachedConfig);
            //    new PipelineObject('CONFIGS', assetKey, configLoaded)
            PipelineAPI.subscribeToCategoryKey('CONFIGS', assetKey, configLoaded);
        } else {
            configLoaded(assetKey, cachedConfig);
        }

    }

}

export { LoadSequencer }