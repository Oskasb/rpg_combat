"use strict";

define([
        'PipelineAPI'
    ],
    function(
        PipelineAPI
    ) {

        var ThreeMaterialSettings = function(id, config, callback) {

            var assetLoaded = function(src, asset) {
            //    console.log(src, asset);
                this.config = asset.config;
                callback(this)
            }.bind(this);

            PipelineAPI.subscribeToCategoryKey('CONFIGS', 'MATERIAL_SETTINGS_'+id, assetLoaded);

        };

        return ThreeMaterialSettings;

    });