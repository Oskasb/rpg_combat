"use strict";
import { GameDataPipeline } from '../GameDataPipeline.js';

class ConfigCache {

    constructor() {
        this.gameDataPipeline = new GameDataPipeline();
    }


    configs = {
        urls:{}
    };

    pipelineReady = false;
    readyCallbacks = [];

    categories = {};

    dataConfigs = {};

    images = {};
    imageSubs = {};
    masterReset = function() {};
    progressCallbacks = [];
    requestedUrls = [];
    loadedUrls = [];
    remainingUrls = [];

    cacheReads = 0;



    pipelineReady = function(bool) {
        pipelineReady = bool;
        if (pipelineReady) {
            for (var i = 0; i < readyCallbacks.length; i++) {
                readyCallbacks[i]();
            }
            readyCallbacks.length = 0;
        }
    };

    getReady = function() {
        return pipelineReady;
    };

    getCacheReads = function() {
        return cacheReads;
    };

    resetCacheReads = function() {
        cacheReads = 0;
    };

    addReadyCallback = function(cb) {
        readyCallbacks.push(cb);
    };

    storeJsonAtUrl = function(json, url) {
        gameDataPipeline.storeJson(json, url)
    };


    applyDataPipelineOptions = function(jsonIndexUrl, opts, pipelineErrorCb) {


        var loadFail = function(url, error) {
            console.log("JSON Pipe Fail! ", url, error);
        };

        var indexLoaded = function(url, json) {
            //			console.log("JSON Pipe: ", url, json);

            gameDataPipeline.applyPipelineOptions(opts, pipelineErrorCb, ConfigCache);

            var indexFiledAdded = function(iurl, jsn) {
                //			console.log("JSON File Indexed: ", iurl, jsn);
            };


            for (var i = 0; i < json[0].config_url_index.files.length;i++) {
                ConfigCache.cacheFromUrl(window.jsonConfigUrls+json[0].config_url_index.files[i], indexFiledAdded, loadFail);
            }

        };


        console.log("Request Load: ", jsonIndexUrl);
        this.cacheFromUrl(jsonIndexUrl, indexLoaded, loadFail);

    };

    addProgressCallback = function(callback) {
        this.progressCallbacks.push(callback)
    };

    removeProgressCallback = function(callback) {
        if (this.progressCallbacks.indexOf(callback) !== -1) {
            this.progressCallbacks.splice(this.progressCallbacks.indexOf(callback), 1)
        }
    };

    setMasterResetFunction = function(callback) {
        masterReset = callback;
    };

    storeImageRef = function(id, image) {
        ConfigCache.notifyUrlReadRequest(image.url);
        images[id] = image;
    };

    getImageRef = function(id) {
        return images[id];
    };

    addCategory = function(category) {
        configs[category] = {};
        categories[category] = {
            callbacks:[],
            subscription:{}
        }
    };

    fireCategoryCallbacks = function(key) {

        var fireCallbacks = function(callbacks, id, data) {
            for (var i = 0; i < callbacks.length; i++) {
                cacheReads++;
                callbacks[i](id, data);
            }
        };
        fireCallbacks(categories[key].callbacks, key, configs[key]);
    };

    fireCategoryKeyCallbacks = function(category, key) {
        var fireCallbacks = function(callbacks, id, data) {
            for (var i = 0; i < callbacks.length; i++) {
                cacheReads++;
                callbacks[i](id, data);
            }
        };

        if (categories[category].subscription[key]) {
            fireCallbacks(categories[category].subscription[key], key, configs[category][key]);
        }

    };


    combineArrayData(cache, add) {

        for (var i = 0; i < add.length; i++) {

            if (!add[i].id) {
                console.log("Bad array data, no ID:", i, add)
            } else {
                var currentIndex;
                for (var j = 0; j < cache.length; j++) {
                    if (cache[j].id === add[i].id) {
                        currentIndex = j;
                    }
                }

                if (currentIndex === -1) {
                    cache.push(add[i]);
                } else {
                    cache[currentIndex] = add[i];
                }
            }
        }
    };

    combineArray(source, target, idx) {

        var replace = function(t, s) {

            if (s.id) {
                for (var j = 0; j < t.length; j++) {
                    if (s.id === t[j].id) {
                        t[i] = s;
                        return true;
                    }
                }
                t.push(s);
            } else {
                t[idx] = s;
            }
        };

        for (var i = 0; i < source.length; i++) {
            replace(target, source[i])
        }
    }


    dataCombineToKey = function(key, url, data) {
        if (!configs[key]) {
            ConfigCache.addCategory(key);
        }
        for (var index in data[key]) {

            if (!configs[key][index]) {
                configs[key][index] = data[key][index];
            } else {
                if (configs[key][index] && data[key][index]) {
                    if (configs[key][index].length && typeof(configs[key][index]) !== 'string') {
                        combineArray(data[key][index], configs[key][index], index)
                    } else {
                        configs[key][index] = data[key][index];
                    }

                } else {
                    configs[key][index] = data[key][index];
                }
            }

            ConfigCache.fireCategoryKeyCallbacks(key, index);
        }

        ConfigCache.fireCategoryCallbacks(key);
    };

    getBuiltCategoryKeyConfig = function(category, key) {
        var data = dataConfigs[category];
        if (!data) return "No data "+category;
        if (!data[key]) return "No entry for key "+key+" in category "+category;
        return data[key];
    };

    getCategory = function(category) {
        var data = configs[category];
        if (!data) return "No data "+category;
        return data;
    };

    getConfigKey = function(category, key) {
        var data = ConfigCache.getCategory(category)[key];
        if(typeof(data) === 'undefined') return key;
        return data;
    };

    registerCategoryKeySubscriber = function(category, key, callback) {
        if (!categories[category]) {
            ConfigCache.addCategory(category);
        }

        if (!categories[category].subscription[key]) {
            categories[category].subscription[key] = [];
        }

        categories[category].subscription[key].push(callback);

    };


    unsubscribeCategoryKey = function(category, key, callback) {
        if (!categories[category]) {
            console.log("No Category to unsubscribe from", category)
        }

        if (!categories[category].subscription[key]) {
            categories[category].subscription[key] = [];
            console.log("Category nas no key to unsubscribe from", category, key)
        }

        categories[category].subscription[key].splice(categories[category].subscription[key].indexOf(callback), 1);

    };




    registerCategoryUpdatedCallback = function(category, callback) {
        if (!categories[category]) {
            ConfigCache.addCategory(category);
        }
        categories[category].callbacks.push(callback);
        return configs[category];
    };

    subscribeToCategoryKey = function(category, key, callback) {
        var data = ConfigCache.getConfigKey(category, key);
        if (data != key) {
            //    console.log("reject string", data)
            cacheReads++;
            callback(key, data);
        }
        ConfigCache.registerCategoryKeySubscriber(category, key, callback);
    };

    registerImageSub = function(subscriberId, imageId, callback) {
        if (!imageSubs[imageId]) imageSubs[imageId] = {};
        imageSubs[imageId][subscriberId] = callback
    };

    subscribeToImageId = function(subscriberId, imageId, callback) {
        var data = ConfigCache.getImageRef(imageId);

        if (data) {
            if (data.loaded) {
                cacheReads++;
                callback(imageId, data);
            }
        }

        ConfigCache.registerImageSub(subscriberId, imageId, callback);
    };

    imageDataLoaded = function(id) {
        ConfigCache.notifyUrlReceived(ConfigCache.getImageRef(id).url);
        if (!imageSubs[id]) return;
        for (var sub  in imageSubs[id]) {
            imageSubs[id][sub](id, ConfigCache.getImageRef(id))
        }
    };

    notifyLoadStateChange = function() {
        for (var i = 0; i < this.progressCallbacks.length; i++) {
            this.progressCallbacks[i](requestedUrls.length, remainingUrls.length, loadedUrls.length, remainingUrls)
        }
        //	console.log("CacheState, Requested:", requestedUrls.length, "Remaining:",remainingUrls.length, "Loaded:",loadedUrls.length)
    };

    notifyUrlReadRequest = function(url) {
        if (this.requestedUrls.indexOf(url) === -1) {
            this.requestedUrls.push(url);
            this.remainingUrls.push(url);
            this.notifyLoadStateChange();
        }

    };

    notifyUrlReceived = function(url) {
        if (remainingUrls.indexOf(url) !== -1) {
            remainingUrls.splice(remainingUrls.indexOf(url), 1);
        }

        if (loadedUrls.indexOf(url) === -1) {
            loadedUrls.push(url);

        }
        this.notifyLoadStateChange();
    };


    cacheFromUrl = function(url, success, fail) {
        this.notifyUrlReadRequest(url);
        var onLoaded = function(remoteUrl, data) {
            ConfigCache.notifyUrlReceived(remoteUrl);
            configs.urls[remoteUrl] = data;
            for (var i = 0; i < data.length; i++) {
                for (var key in data[i]) {
                    ConfigCache.dataCombineToKey(key, url, data[i]);
                }
            }
            success(remoteUrl, data)
        };
        this.gameDataPipeline.loadConfigFromUrl(url, onLoaded, fail);
    };



    cacheSvgFromUrl = function(url, success, fail) {
        ConfigCache.notifyUrlReadRequest(url);
        var onLoaded = function(remoteUrl, svgData) {
            ConfigCache.notifyUrlReceived(remoteUrl);
            success(remoteUrl, svgData)
        };

        gameDataPipeline.loadSvgFromUrl(url, onLoaded, fail);
    };

    cacheImageFromUrl = function(url, success, fail) {
        ConfigCache.notifyUrlReadRequest(url);
        var onLoaded = function(remoteUrl, svgData) {
            ConfigCache.notifyUrlReceived(remoteUrl);
            success(remoteUrl, svgData)
        };

        gameDataPipeline.loadImageFromUrl(url, onLoaded, fail);
    };


    loadBundleMaster = function(path, goo, masterUrl, assetUpdated, fail, notifyLoaderProgress) {

    };

    combineEntities = function(entityList, combineDone) {

    };

    getCachedConfigs = function() {
        return configs;
    };

    registerPollUrl = function(url) {
        gameDataPipeline.registerUrlForPoll(url);
    };

    removePollUrl = function(url) {
        gameDataPipeline.removeUrlFromPoll(url);
    };

    tickConfigCache = function(tpf) {
        gameDataPipeline.tickDataLoader(tpf);
    };


}

export { ConfigCache }