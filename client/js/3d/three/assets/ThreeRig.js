"use strict";

define([
        'PipelineAPI'
    ],
    function(
        PipelineAPI
    ) {

        var ThreeRig = function(id, config, callback) {

            var _this = this;

            var assetLoaded = function(src, asset) {
        //        console.log(src, asset);
                _this.joints = asset.config.joints;
                _this.animations = asset.config.animations;
                callback(asset.config);
            };

            PipelineAPI.subscribeToCategoryKey('CONFIGS', 'RIGS_'+id, assetLoaded);

        };

        return ThreeRig;

    });