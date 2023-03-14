"use strict";

define([
        'application/PipelineObject'
    ],
    function(
        PipelineObject
    ) {

    var i;

        var ConfigObject = function(config, key, dataId) {
            this.configId = config;
            this.key = key;
            this.dataId = dataId;
            this.callbacks = [];

            var dataUpdated = function(src, data) {
                this.src = src;
                this.dataLoaded(data);
            }.bind(this);

            this.pipeObj = new PipelineObject(config, key);
            this.pipeObj.subscribe(dataUpdated)
        };

        ConfigObject.prototype.dataLoaded = function(data) {
            this.data = data;
            this.pipeObj.buildConfig()[this.dataId];
            this.config = this.pipeObj.getConfigs();
            this.callCallbacks();
        };

        ConfigObject.prototype.addCallback = function(callback) {
            this.callbacks.push(callback);

            if (this.config) {
                if (Object.keys(this.config).length) {
                    callback(this.config, this.data);
                }
            }

        };

        ConfigObject.prototype.removeCallback = function(callback) {
            this.callbacks.splice(this.callbacks.indexOf(callback, 1));
        };

        ConfigObject.prototype.callCallbacks = function() {
            for (i = 0;i < this.callbacks.length; i++) {
                this.callbacks[i](this.config, this.data);
            }
        };

        ConfigObject.prototype.getConfigByDataKey = function(dataKey) {
            return this.config[dataKey];
        };

        return ConfigObject;

    });