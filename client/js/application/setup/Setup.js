
class Setup {

    constructor() {
        this.dataLoader = null;
    }

    initDataPipeline(pipelineAPI, pipelineReadyCB) {

        let ready = {
            JSON_PIPE:false,
            IMAGE_PIPE:false
        };

        let pipeReady = function(msg, pipeName) {
            //    console.log('pipeReady', msg, pipeName)
            ready[pipeName] = true;
            if (ready.JSON_PIPE && ready.IMAGE_PIPE) {
                pipelineReadyCB();
            }
        };

        let pipeMsgCB = function(src, channel, msg) {
            console.log(src, channel, msg)
        };

        pipelineAPI.initConfigCache(pipeReady, pipeMsgCB);

    };

    initConfigCache(pipelineAPI, dataPipelineSetup) {
        let onErrorCallback = function(err) {
            console.log("Data Pipeline Error:", err);
        };

        let onPipelineReadyCallback = function(configCache) {
            console.log("CONFIGS:", configCache.configs)
        };

        pipelineAPI.dataPipelineSetup(dataPipelineSetup.jsonRegUrl, dataPipelineSetup, onPipelineReadyCallback, onErrorCallback);
    }

    initLoader(dataLoader) {
        this.dataLoader = dataLoader;
        this.dataLoader.loadData(onReady);
        new PointerCursor();
    };

    completed() {
        this.dataLoader.notifyCompleted();
    };

}

export { Setup }
