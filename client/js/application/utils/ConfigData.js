class ConfigData {
    constructor(configId, configKey) {
        this.configId = configId;
        this.configKey = configKey;
        this.data = {};
    };

    fetchData = function(dataId) {
        console.log(dataId)
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

}

export { ConfigData }