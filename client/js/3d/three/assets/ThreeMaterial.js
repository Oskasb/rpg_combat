import {PipelineObject} from '../../../application/load/PipelineObject.js';

class ThreeMaterial {
    constructor(id, config, callback) {

        this.id = id;

        this.textureMap = {};

        this.textures = {};

        let matReady = function() {

            for (let key in this.textureMap) {
                this.mat[this.textureMap[key]] = this.textures[this.textureMap[key]].texture;
            }

            callback(this);
        }.bind(this);

        let materialSettingsLoaded = function(src, asset) {

            this.applyMaterialSettings(asset.config.shader, asset.config.properties, matReady);
        }.bind(this);


        let txReady = function() {
            ThreeAPI.loadThreeAsset('MATERIAL_SETTINGS_', config.settings, materialSettingsLoaded);
        }.bind(this);

        this.setupTextureMap(config, txReady);

    };

    getAssetMaterial = function() {
        return this.mat;
    };

    setupTextureMap = function(config, cb) {

        var txLds = 0;

        var loadCheck = function() {
            if (config.textures.length === txLds) {
                cb();
            }
        }.bind(this);

        var textureAssetLoaded = function(src, asset) {
            txLds++;
            this.textures[this.textureMap[asset.id]] = asset;
            loadCheck()
        }.bind(this);

        if (config.textures) {
            for (var i = 0; i < config.textures.length; i++) {
                var id = config.textures[i].id;
                var key = config.textures[i].key;
                this.textureMap[id] = key;
                ThreeAPI.loadThreeAsset('TEXTURES_', config.textures[i].id, textureAssetLoaded);
            }
        }

        loadCheck();
    };

    updateMaterialSettings = function(props) {

        var mat = this.mat;

        for (var key in props.settings) {
            mat[key] = props.settings[key]
        }

        if (props.defines) {

            console.log("Add defines: ", mat.defines);

            mat.defines = mat.defines || {};

            for (var key in props.defines) {
                mat.defines[key] = props.defines[key]

            }
        }

        if (props.blending) {
            mat.blending = THREE[props.blending];
        }

        if (props.customBlending) {
            for (var key in props.customBlending) {
                mat[key] =  THREE[props.customBlending[key]]
            }
        }

        if (props.side) mat.side = THREE[props.side];

        if (props.color) {
            mat.color.r = props.color.r;
            mat.color.g = props.color.g;
            mat.color.b = props.color.b;
        }

        mat.needsUpdate = true;

    };


    applyMaterialSettings = function(shader, props, cb) {

        if (this.mat) {
            this.updateMaterialSettings(props);
            return;
        }

        if (props.program) {
            this.setupCustomShaderMaterial(shader, props, cb);
            return;
        }


        var mat = new THREE[shader](props.settings);

        if (props.blending) {
            mat.blending = THREE[props.blending];
        }

        if (props.color) {
            mat.color.r = props.color.r;
            mat.color.g = props.color.g;
            mat.color.b = props.color.b;
        }

        if (props.side) mat.side = THREE[props.side];
        if (props.combine) mat.combine = THREE[props.combine];
        if (props.depthTest) mat.depthTest = props.depthTest;



        if (props.defines) {

            console.log("Add defines: ", mat.defines);

            mat.defines = mat.defines || {};

            for (var key in props.defines) {
                mat.defines[key] = props.defines[key]

            }
        }

        this.mat = mat;
        cb(this);
    };


    addTextureUniform = function(uniforms, texConf) {
        //        console.log("TEXTURE addTextureUniform:", uniforms, texConf);;

        var key = texConf.key;

        var tx = this.textures[key].texture;

        uniforms[key] = {};


        //    tx.repeat.x = texConf.repeat[0];
        //   tx.repeat.y = texConf.repeat[1];
        uniforms[key].value = tx;
        uniforms[key].type = 't';
        uniforms[key+'repeat'] = {};
        uniforms[key+'repeat'].value = {x:texConf.repeat[0],y:texConf.repeat[1]};

        //   tx.needsUpdate = true;
    };



    setupCustomShaderMaterial = function(shader, props, cb) {

        //    if ( this.id === "material_terrain") console.log("material_terrain", this);
        let updateUniforms = function(uniforms, newuniforms) {

            for (let key in newuniforms) {
                if (!uniforms[key]) {
                    uniforms[key] = {};
                }
                console.log("Add Lib Uniform", key)
                uniforms[key].value = newuniforms[key].value
            }
        };

        if (props.data_texture) var dataTx = this.textures[props.data_texture].texture;

        var applyShaders = function(src, data) {

            if (this.mat) {

                this.mat.vertexShader = data.vertex;
                this.mat.fragmentShader = data.fragment;

                console.log("Update custom material shaders");

                //    this.mat.needsUpdate = true;
                return;

            }

            props.shaders = data;

            var uniforms = {
                systemTime: {value:0},
                alphaTest:  {value:props.settings.alphaTest},
            };

            if ( this.textures['map']) {
                var mapTexture = this.textures['map'].texture;
                uniforms['map'] = {value:mapTexture};
                uniforms['tiles'] = {value:new THREE.Vector2(mapTexture.userData.tiles_x, mapTexture.userData.tiles_y)};
            }

            if (props['texture_uniforms']) {

                for (var i = 0; i < props['texture_uniforms'].length; i++) {
                    this.addTextureUniform(uniforms, props['texture_uniforms'][i])
                }

            }


            if (props.data_texture) {
                uniforms.data_texture =  {value:dataTx};
                uniforms.data_rows    =  {value:dataTx.userData.data_rows}
            }

            if (props.global_uniforms) {

                var globalUniforms = ThreeAPI.getGlobalUniforms();

                for (var key in props.global_uniforms) {
                    if (!globalUniforms[key]) {
                        globalUniforms[key] = props.global_uniforms[key]
                    }
                    uniforms[key] = globalUniforms[key];
                }
            }

            if (props['lib_uniforms']) {
                for (var i = 0; i < props['lib_uniforms'].length; i++) {
                    updateUniforms(uniforms, THREE.UniformsLib[props['lib_uniforms'][i]]);
                }
            }


            var opts = {
                uniforms: uniforms,
                side: THREE.DoubleSide,
                vertexShader: props.shaders.vertex,
                fragmentShader: props.shaders.fragment
            };

            for (var key in props.settings) {
                opts[key] = props.settings[key]
            };



            if (props.blending) {
                opts.blending = THREE[props.blending];
            }


            if (props.customBlending) {
                for (var key in props.customBlending) {
                    opts[key] =  THREE[props.customBlending[key]]
                }
            }



            if (props.side) opts.side = THREE[props.side];


            var mat = new THREE[shader](opts);

            setInterval(function() {
                mat.needsUpdate = true
            }, 500)

            if (props.color) {
                mat.color.r = props.color.r;
                mat.color.g = props.color.g;
                mat.color.b = props.color.b;
            }

            this.mat = mat;

            cb(this);

        }.bind(this);

        this.shaderPipe = new PipelineObject("SHADERS", props.program, applyShaders);

    };


    setAssetConfig = function(assetType, assetId, data) {

    };



}

export { ThreeMaterial }