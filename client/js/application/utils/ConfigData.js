
class ConfigData {
    constructor(root, folder, dataId, dataKey, configKey, onReady) {
        this.root = root;
        this.folder = folder;

        this.dataId = dataId;
        this.dataKey = dataKey;
        this.configKey = configKey;

        this.config = null;
        this.data = {};
        this.updateCount = 0;

        if (dataId) {
            return;
        }
        let postInit = function(data) {
            if (typeof(onReady) === 'function') {
                onReady()
            }
        };
        let onDataCb = function(data) {
            setTimeout(function() { postInit(data), 0 })
        };

        let onConfig = function(src, data) {
            this.config = data;
            onDataCb(data);
        }.bind(this);

        PipelineAPI.cacheCategoryKey(this.root, this.folder, onConfig)
    };

    parseConfig(parseKey, onUpdate) {
        let updateCount = 0;
        let onDataCb = function(data) {
            if (typeof(this.configKey) === 'string') {
                data = this.parseConfigData()[parseKey].data;
                let config = MATH.getFromArrayByKeyValue(data, this.dataKey, this.dataId)[this.configKey];
                onUpdate(config, updateCount)
            } else {
                console.log("parseConfig without configKey set is not right", this);
                if (typeof (onUpdate) === 'function') {
                    onUpdate(data, updateCount);
                }
            }
            updateCount++
        }.bind(this);

        let onConfig = function(src, data) {
            this.config = data;
            onDataCb(data);
        }.bind(this);

        PipelineAPI.cacheCategoryKey(this.root, this.folder, onConfig)

    }

    fetchData = function(dataId) {
        let dataUpdate = function(src, data) {
            for (let key in data) {
                this.data[key] = data[key];
            }
        }.bind(this);

        PipelineAPI.fetchConfigData(this.root, this.folder, dataId, dataUpdate);
    };

    readDataKey = function(dataKey) {
        return this.data[dataKey];
    };

    parseConfigData = function() {
        let config = {};

        let onData = function(data) {
            if (data.id) {
                config[data.id] = data;
            } else {
                console.log("funky data structure in config", data);
            }

        };

        for (let i = 0; i < this.config.length;i++) {
            onData(this.config[i])
        }
        return config;
    };

    readConfigKey = function(dataKey) {
        return this.config[dataKey];
    };

}

export { ConfigData }