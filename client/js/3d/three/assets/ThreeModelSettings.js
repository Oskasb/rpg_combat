"use strict";

define([
        'PipelineAPI'
    ],
    function(
        PipelineAPI
    ) {

        var ThreeModelSettings = function(id, config, callback) {

        //    console.log("new ThreeModelSettings", id, config, callback)

            var assetLoaded = function(src, asset) {
        //        console.log(src, asset);
                this.settings = asset.config;
                callback(this);
            }.bind(this);

            PipelineAPI.subscribeToCategoryKey('CONFIGS', 'MODEL_SETTINGS_'+id, assetLoaded);

        };

        return ThreeModelSettings;

    });