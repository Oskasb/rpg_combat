class ThreeImage {
    constructor(id, config, callback) {

        this.loader = new THREE.ImageBitmapLoader();

        this.id = id;
        this.url = config.url;

        let bitmapLoaded = function(bmp) {
            this.bitmap = bmp;
            callback(this)
        }.bind(this);

        this.loader.load( config.url, function ( imageBitmap ) {
            bitmapLoaded(imageBitmap);
        });

    };

}

export { ThreeImage }