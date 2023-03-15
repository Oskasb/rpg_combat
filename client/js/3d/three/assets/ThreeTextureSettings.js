"use strict";

define([
        'PipelineAPI'
    ],
    function(
        PipelineAPI
    ) {

        var ThreeTextureSettings = function(id, config, callback) {

            this.id = id;

            var assetLoaded = function(src, asset) {
            //    console.log(src, asset);
                this.config = asset.config;
                callback(this)
            }.bind(this);

            PipelineAPI.subscribeToCategoryKey('CONFIGS', 'TEXTURE_SETTINGS_'+id, assetLoaded);

        };

        return ThreeTextureSettings;

    });