class ThreeTextureSettings {
    constructor(id, config, callback) {

        this.id = id;

        let assetLoaded = function(src, asset) {
            //    console.log(src, asset);
            this.config = asset.config;
            callback(this)
        }.bind(this);

        PipelineAPI.subscribeToCategoryKey('CONFIGS', 'TEXTURE_SETTINGS_'+id, assetLoaded);

    };

}

export { ThreeTextureSettings }