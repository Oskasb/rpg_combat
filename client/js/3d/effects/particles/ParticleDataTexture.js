"use strict";


define([
    'application/PipelineObject'

], function(
    PipelineObject
) {

    var ParticleDataTexture = function(txId, dataReady) {

        var dataTextureReady = function(src, tx) {
        //    console.log("Data Texture Loaded:", tx);
            this.dataTexture = tx;
            dataReady(tx);
        }.bind(this);

        new PipelineObject("THREE_TEXTURE", txId, dataTextureReady);

    };
    
    return ParticleDataTexture;

});