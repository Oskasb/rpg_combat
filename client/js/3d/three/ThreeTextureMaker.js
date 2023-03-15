"use strict";

define([
        'PipelineAPI',
        '../../application/PipelineObject'],
    function(
        PipelineAPI,
        PipelineObject
    ) {

        var textureImages = {};
        var images = {};
        var textures = {};

        var textureFiles;

        var meta = {
            textures:{},
            images:{}
        };

        var getUrlById = function(id) {

            for (var i = 0; i < textureFiles.length; i++) {
                if (textureFiles[i].id === id) {
                    return textureFiles[i].url
                }
            }
            console.log("No texture file by id:", id, textureFiles);
            return false;
        };

        var getIdByUrl = function(url) {

            for (var i = 0; i < textureFiles.length; i++) {
                if (textureFiles[i].url === url) {
                    return textureFiles[i].id
                }
            }
            console.log("No texture file by id:", id, textureFiles);
            return false;
        };

        var contentUrl = function(url) {
            return 'content'+url.slice(1);
        };

        var saveJsonUrl = function(json, url) {
            var shiftUrl = url.slice(1);
            PipelineAPI.saveJsonFileOnServer(json, shiftUrl)
        };

        var ThreeTextureMaker = function() {

        };

        var createBufferTexture = function(url, txType) {

            textures[txType][url] = true;

            var registerTexture = function(tx) {

                if (typeof(textures[txType][url]) === 'Texture') {

                    textures[txType][url].image = tx.image;
                    textures[txType][url].needsUpdate = true;

                } else {
                    if (txType === 'envMap' || txType === 'data_texture' || txType === 'particle_texture') {
                        tx.combine = THREE.AddOperation;
                        tx.generateMipmaps = false;
                        tx.magFilter = THREE.LinearFilter;
                        tx.minFilter = THREE.LinearFilter;

                        if (txType === 'envMap') {
                            tx.mapping = THREE.SphericalReflectionMapping;
                        }

                        if (txType === 'particle_texture') {
                            tx.wrapS = THREE.RepeatWrapping;
                            tx.wrapT = THREE.RepeatWrapping;

                        }

                    } else {
                        tx.wrapS = THREE.RepeatWrapping;
                        tx.wrapT = THREE.RepeatWrapping;
                    }

                    tx.sourceUrl = url;
                    textures[txType][url] = tx;

                //    PipelineAPI.setCategoryKeyValue('THREE_TEXTURE', txType+'_'+url, tx);

                    PipelineAPI.setCategoryKeyValue('THREE_TEXTURE', getIdByUrl(url), tx);
                }

            };

            var jsonImageLoaded = function(src, data) {
                PipelineAPI.cancelFileUrlPoll(src);
                new THREE.TextureLoader().load(data.url, registerTexture);
            };

            var originalImageUpdated = function(src, data) {

            //    console.log("Buffer Data Updated:  ", url, txType, src, [data]);
                var onLoad = function(tx) {
                    if (PipelineAPI.getPipelineOptions('imagePipe').polling.enabled_) {
                        var imgId = tx.toJSON(meta).image;
                        delete meta.images[imgId].uuid;
                        var json = JSON.stringify(meta.images[imgId]);
                        //      var json = meta.images[imgId].url;
                        console.log("JSON Image:", imgId, [json]);
                        saveJsonUrl(json, url);
                        new PipelineObject('JSON_IMAGE', url, jsonImageLoaded)
                        PipelineAPI.pollFileUrl(src);
                    } else {

                    }
                    registerTexture(tx);
                };

                new THREE.TextureLoader().load(url, onLoad);
            };

            originalImageUpdated(url)

            // new PipelineObject('BUFFER_IMAGE', url, originalImageUpdated);
            return;

            if (PipelineAPI.getPipelineOptions('imagePipe').polling.enabled) {
                new PipelineObject('BUFFER_IMAGE', url, originalImageUpdated)
            } else {
                new PipelineObject('JSON_IMAGE', url, jsonImageLoaded)
            }

        };

        var createTexture = function(textureStore) {

            if (!textures[textureStore.txType]) {
                textures[textureStore.txType] = {};
            } else {

                if (textures[textureStore.txType][textureStore.url]) {
            //        console.log("Tx url already loaded...", [textureStore.txType], [textureStore.url]);
                    return;
                }

                if (textures[textureStore.txType].src === textureStore.url) {
            //        console.log("Texture already loaded", textureStore, textureStore.url, textures);
                    return;
                }
            }

            createBufferTexture(textureStore.url, textureStore.txType);
        };

        var loadImage = function(textureStore) {

            var jsonImage = function(src, json) {
                PipelineAPI.setCategoryKeyValue('JSON_IMAGE', textureStore.url, json);
            };

            var ok = function(src, data) {
                images[textureStore.url] = data;
        //        console.log("TextureCached", src, textureStore);
                textureStore.bufferData = data;
                PipelineAPI.setCategoryKeyValue('BUFFER_IMAGE', textureStore.url, data);
            //    PipelineAPI.subscribeToConfigUrl(contentUrl(textureStore.url), jsonImage, fail);
            };

            var fail = function(src, data) {
                console.log("Texture Failed", src, data);
            };

            if (!images[textureStore.url]) {
                images[textureStore.url] = {};

                PipelineAPI.cacheImageFromUrl(textureStore.url, ok, fail)

                /*
                if (PipelineAPI.getPipelineOptions('imagePipe').polling.enabled) {
            //        console.log("PipelineState:",PipelineAPI.readCachedConfigKey('STATUS', 'PIPELINE'))
                    PipelineAPI.cacheImageFromUrl(textureStore.url, ok, fail)
                } else {
                    console.log("Load TX Production Mode")
                    PipelineAPI.subscribeToConfigUrl(contentUrl(textureStore.url), jsonImage, fail);
                }
                */
            }

            createTexture(textureStore);
        };



        ThreeTextureMaker.loadTextures = function() {

            var textureListLoaded = function(scr, data) {
                for (var i = 0; i < data.length; i++){

                    for (var j = 0; j < data[i].textures.length; j++) {
                        for (var key in data[i].textures[j]) {
                            var url = getUrlById(data[i].textures[j][key]);
                            var textureStore = {txType:key, url:url, bufferData:null};
                            textureImages[url] = textureStore;
                            loadImage(textureStore);
                        }
                    }
                }
                //    console.log("Texture List", textureImages);
            };

            var loadParticleTexture = function(src, data) {

                for (var i = 0; i < data.length; i++){
                    var url = getUrlById(data[i].particle_texture);
                    var textureStore = {txType:'particle_texture', url:url, bufferData:null};
                    textureImages[url] = textureStore;
                    loadImage(textureStore);
                }
            };


            var loadTextures = function() {
                new PipelineObject("MATERIALS", "THREE", textureListLoaded);
                new PipelineObject("PARTICLE_MATERIALS", "THREE", loadParticleTexture);
            };


            var init = 0;
            var registerTextureFiles = function(src, data) {
                textureFiles = data;
                if (!init) {
                    loadTextures();
                    init = 1
                }
            };

            new PipelineObject("TEXTURES", "FILES", registerTextureFiles);

        };



        ThreeTextureMaker.createImageTexture = function(srcUrl) {

            var texture = new THREE.Texture(srcUrl);

            return texture;
        };

        ThreeTextureMaker.createCanvasTexture = function(canvas) {

            var texture = new THREE.Texture(canvas);

            return texture;
        };




        return ThreeTextureMaker;
    });