
class ConfigData {
    constructor(configId, configKey) {
        this.configId = configId;
        this.configKey = configKey;
        this.config = null;
        this.data = {};

        let onConfig = function(src, data) {
            this.config = data;
        }.bind(this);

        PipelineAPI.subscribeToCategoryKey(this.configId, this.configKey, onConfig)
    };

    fetchData = function(dataId) {
        let dataUpdate = function(src, data) {
            for (let key in data) {
                this.data[key] = data[key];
            }
        }.bind(this);

        PipelineAPI.fetchConfigData(this.configId, this.configKey, dataId, dataUpdate);
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