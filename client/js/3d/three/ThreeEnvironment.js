"use strict";


define(['application/PipelineObject',
    '3d/effects/water/WaterFX',
    'PipelineAPI',
    'evt'

], function(
    PipelineObject,
    WaterFX,
    PipelineAPI,
    evt
) {

    var waterFx;
  //  var envStateMap = ENUMS.Map.Environment;
 //   var envBuffer = new SharedArrayBuffer(Float32Array.BYTES_PER_ELEMENT * envStateMap.length);

    var envs = [
        "flat",
        "pre_dawn",
        "dawn",
        "morning",
        "sunny_day",
        "high_noon",
        "evening",
        "night"
    ];


    var currentEnvIndex = undefined;

    var enabled;
    var envList = {};
    var skyList = {};

    var worldSetup = {};
    var world = {};
    var currentEnvId;

    var maxElevation = 10000;

    var currentElevation = 0;
    var elevationFactor = 0;

    var currentEnvConfig;
    var currentSkyConfig;

    var worldCenter = new THREE.Vector3(0, 0, 0);
    var calcVec = new THREE.Vector3();
    var calcVec2 = new THREE.Vector3();

    var theta;
    var phi;

    var transitionTime = 1;
    var transitionProgress = 0;

    var sky;
    var scene;
    var camera;
    var renderer;
    var sunSphere;

    var fogColor = new THREE.Color(1, 1, 1);
    var dynamicFogColor = new THREE.Color(1, 1, 1);
    var ambientColor = new THREE.Color(1, 1, 1);
    var dynamicAmbientColor = new THREE.Color(1, 1, 1);

    var ThreeEnvironment = function() {

    };

    ThreeEnvironment.loadEnvironmentData = function(onLoaded) {

        var worldListLoaded = function(src, data) {

        //    console.log("Load Env World Data:", src, data);

            for (var i = 0; i < data.params.length; i++){
                worldSetup[data.params[i].id] = data.params[i]
            }
            currentEnvId = data.defaultEnvId;
            currentEnvIndex = undefined;
            //    console.log("worldSetup:", currentEnvId, worldSetup);

            onLoaded();
        };

        waterFx = new WaterFX();

        new PipelineObject("ASSETS", "WORLD", worldListLoaded);


    };

    var useTHREESky = 0;
    var ctx;
    var ctxHeight = 64;
    var ctxWidth= 1;

    var initSky = function() {

        //    return;
        //    console.log("Init sky");
        // Add Sky Mesh

        if (useTHREESky) {

            sky = new THREE.Sky();

        } else {

            var canvas = document.createElement("canvas");

            var setupCanvas = function(canvas) {
                canvas.id = 'sky_canvas';
                canvas.width  = ctxWidth;
                canvas.height = ctxHeight;
                canvas.dataReady = true;
                ctx = canvas.getContext('2d');
                return ctx;
            };

            var tx = ThreeAPI.newCanvasTexture(canvas);
            var mat = ThreeAPI.buildCanvasMaterial(tx);
            mat.side = THREE.BackSide;

        //    mat.depthWrite = false;

            var skyGeo = new THREE.SphereBufferGeometry(15000, 36, 6 );
            var skyMesh = new THREE.Mesh( skyGeo, mat);

            var uniforms = {
                luminance: { value: 1 },
                turbidity: { value: 2 },
                rayleigh: { value: 1 },
                mieCoefficient: { value: 0.005 },
                mieDirectionalG: { value: 0.8 },
                sunPosition: { value: new THREE.Vector3() }
            };

            sky = {
                mesh:skyMesh,
                ctx:setupCanvas(canvas),
                tx:tx,
                uniforms:uniforms
            }

            setCanvasColor(sky.ctx, sky.tx)

        }

    //    scene.add( sky.mesh );
        sky.meshClone = sky.mesh.clone();
        // Add Sun Helper

        sunSphere = new THREE.Mesh(
            new THREE.SphereBufferGeometry( 20, 16, 8 ),
            new THREE.MeshBasicMaterial( { color: 0xffffff } )
        );

        sunSphere.position.y = 0;
    //    sunSphere.visible = true;
    //    scene.add( sunSphere );
    };

    var setCanvasColor = function(ctx, tx) {

    //    var config = currentEnvConfig;

    //    var fogColor = config.fog.color;
    //    var ambColor = config.ambient.color;
   //     var sunColor = config.sun.color;

        var evFact = Math.min(camera.position.y*0.00005, 0.099);

        var grd = ctx.createLinearGradient(0,0,0, ctxHeight);

        grd.addColorStop(1-1, ThreeAPI.toRgb(0.0, 0.0, fogColor.b));
        //	grd.addColorStop(0.8+evFact,toRgb([color[0]*(0.5)*(1-evFact)+fog[0]*(0.5)*evFact*evFact, color[1]*0.5*(1-evFact)+fog[1]*(0.5)*evFact*evFact, color[2]*0.5*(1-evFact)+fog[2]*0.5*evFact*evFact]));
        grd.addColorStop(1-(0.577+evFact), ThreeAPI.toRgb(fogColor.r*0.6, fogColor.g*0.6, 1));

        //    grd.addColorStop(0.45,toRgb(ambient));

        grd.addColorStop(0.5, ThreeAPI.toRgb(fogColor.r, fogColor.g, fogColor.b));
        ctx.fillStyle=grd;
        ctx.fillRect(0, 0, ctxWidth, ctxHeight);
        tx.needsUpdate = true;
    };

    var applyColor = function(Obj3d, color) {
        if (Obj3d) {
            if (Obj3d.color) {
                Obj3d.color.r=color[0];
                Obj3d.color.g=color[1];
                Obj3d.color.b=color[2];
            } else {
                Obj3d.color = new THREE.Color(color[0],color[1], color[2]);
            }
        }

    };

    var applyFog = function(Obj3d, density) {
        Obj3d.density = density * 0.3;
        Obj3d.near = 1;
        Obj3d.far = 1/density;
    };

    var applyFromBuffer = function(buffer) {

    };

    var applyEnvironment = function() {

        var config = currentEnvConfig;

        for (var key in config) {

            if (config[key].color) {

                if (key === 'sun') {

                    //    world[key].position.copy(sunSphere.position);
                    //    world[key].lookAt(worldCenter)
                }

                if (key === 'moon') {

                    world[key].position.x = 10 -sunSphere.position.x * 0.2;
                    world[key].position.y = 1000 +sunSphere.position.y * 5;
                    world[key].position.z = 10 -sunSphere.position.z * 0.2;
                    world[key].lookAt(worldCenter)
                }


                if (key === 'fog') {
                    fogColor.setRGB(config[key].color[0],config[key].color[1],config[key].color[2]);
                }

                if (key === 'ambient') {
                    ambientColor.setRGB(config[key].color[0],config[key].color[1],config[key].color[2]);
                }

                applyColor(world[key], config[key].color);
            }

            if (config[key].density) {
                applyFog(world[key], config[key].density * elevationFactor);
            //    renderer.setClearColor(fogColor)
            }
        }
    };

    var config;

    function applySkyConfig() {

        config = currentSkyConfig;

        uniforms = sky.uniforms;
        uniforms.turbidity.value = config.turbidity;
        uniforms.rayleigh.value = config.rayleigh;
        uniforms.luminance.value = config.luminance;
        uniforms.mieCoefficient.value = config.mieCoefficient;
        uniforms.mieDirectionalG.value = config.mieDirectionalG;

        sunSphere.visible = true;

    }

    var sunRedness;
    var sunFactor;

    var updateDynamigFog = function(sunInTheBack) {

        dynamicFogColor.copy(fogColor);

        sunRedness = world.sun.color.r * 0.5;
        sunFactor = (sunRedness - sunInTheBack * (sunRedness-1)) * 0.15;
        dynamicFogColor.lerp(world.sun.color,   sunFactor);
        dynamicFogColor.lerp(ambientColor,      sunFactor);
        world.fog.color.copy(dynamicFogColor)

    };

    var updateDynamigAmbient = function(sunInTheBack) {

        dynamicAmbientColor.copy(ambientColor);
        //    dynamicAmbientColor.lerp(world.fog.color, 0.2 + sunInTheBack * 0.2);
        //    dynamicAmbientColor.lerp(ambientColor, 0.2 - sunInTheBack * 0.2);
        world.ambient.color.copy(dynamicAmbientColor)
    };

    var interpolateEnv = function(current, target, fraction) {

        for (var key in current) {
            if (fraction >= 1) {
                if (current[key].color) {
                    current[key].color[0] = target[key].color[0];
                    current[key].color[1] = target[key].color[1];
                    current[key].color[2] = target[key].color[2];
                }

                if (current[key].density) {
                    current[key].density = target[key].density;
                }
            } else  {
                if (current[key].color) {
                    current[key].color[0] = MATH.interpolateFromTo(current[key].color[0], target[key].color[0],  fraction);
                    current[key].color[1] = MATH.interpolateFromTo(current[key].color[1], target[key].color[1],  fraction);
                    current[key].color[2] = MATH.interpolateFromTo(current[key].color[2], target[key].color[2],  fraction);
                }

                if (current[key].density) {
                    current[key].density = MATH.interpolateFromTo(current[key].density, target[key].density,  fraction) ;
                }
            }
        }

        return current;

    };


    var interpolateSky = function(current, target, fraction) {

        for (var key in current) {
            if (fraction >= 1) {
                current[key] = target[key]
            } else {
                current[key] = MATH.interpolateFromTo(current[key], target[key],  fraction);
            }

        }

        return current;
    };

    var calcTransitionProgress = function(tpf) {
        transitionProgress += tpf;
        return MATH.calcFraction(0, transitionTime, transitionProgress);
    };

    var comEnvIdx;
    var fraction;

    var t = 0;

    var uwFogColor = [0.02, 0.11, 0.3];
    var uwSunColor = [0.1, 0.2, 0.4];
    var uwAmbColor = [0.01, 0.2, 0.6];

    var uniforms;

    var updateUnderwater = function() {

        uniforms = sky.uniforms;
        uniforms.turbidity.value = 13;
        uniforms.rayleigh.value = 2.3;
        uniforms.luminance.value = 1.1;
        uniforms.mieCoefficient.value = 0.1;
        uniforms.mieDirectionalG.value = 0.822;

        theta = Math.PI * ( 0.94 - 0.5 );
        phi = 2 * Math.PI * ( 0.35 - 0.5 );

        sunSphere.position.x = 10000 * Math.cos( phi );
        sunSphere.position.y = 10000 * Math.sin( phi ) * Math.sin( theta );
        sunSphere.position.z = 10000 * Math.sin( phi ) * Math.cos( theta );

        sunSphere.quaternion.set(0, 1, 0, 0);

        sky.uniforms.sunPosition.value.copy( sunSphere.position );


        world.fog.color.set(0.1, 0.2, 0.4);

        //    applyColor(world.fog, uwFogColor);
        applyColor(world.sun, uwSunColor);
        applyColor(world.ambient, uwAmbColor);
        world.fog.density = 0.009;
        transitionProgress = 0;
        //    updateDynamigAmbient(uWambientColor);

        if (sky.ctx) {

            var grd = ctx.createLinearGradient(0,0,0, ctxHeight);

            grd.addColorStop(1, ThreeAPI.toRgb(0.0, 0.0, 0));
            //	grd.addColorStop(0.8+evFact,toRgb([color[0]*(0.5)*(1-evFact)+fog[0]*(0.5)*evFact*evFact, color[1]*0.5*(1-evFact)+fog[1]*(0.5)*evFact*evFact, color[2]*0.5*(1-evFact)+fog[2]*0.5*evFact*evFact]));
            grd.addColorStop(0.61, ThreeAPI.toRgb(0.01, 0.16, 0.22));

            //    grd.addColorStop(0.45,toRgb(ambient));

            grd.addColorStop(0.5, ThreeAPI.toRgb(0.01, 0.25, 0.5));
            grd.addColorStop(0.495, ThreeAPI.toRgb(0.1, 0.3, 0.7));
            grd.addColorStop(0.05, ThreeAPI.toRgb(0.5, 0.7, 1.0));
            ctx.fillStyle=grd;
            ctx.fillRect(0, 0, ctxWidth, ctxHeight);
            sky.tx.needsUpdate = true;
        }


    };

    ThreeEnvironment.tickEnvironment = function(tpf) {
        tickEnvironment(tpf)
    };

    var tickEnvironment = function(tpf) {

        if (!sky) return;
        //    console.log("Tick Env")

        waterFx.tickWaterEffect(tpf);

        fraction = calcTransitionProgress(tpf * 1.0);

        //    t+=evt.args(e).tpf
        //    fraction = fraction;
        currentElevation = camera.position.y;

        if (currentElevation > 0) {
            elevationFactor = MATH.curveCube( MATH.airDensityAtAlt(currentElevation) );
        } else {
            updateUnderwater();
            return;
        }

        //      elevationFactor =  MATH.airDensityAtAlt(currentElevation) ;

        comEnvIdx = 4 // WorkerAPI.getCom(ENUMS.BufferChannels.ENV_INDEX);
        if (currentEnvIndex !== comEnvIdx) {
            currentEnvIndex = comEnvIdx;
            ThreeEnvironment.setEnvConfigId(envs[comEnvIdx], 45);
            return;
        }

        if (fraction > 1.01) {
                    return;
        }

        var useSky = interpolateSky(currentSkyConfig, skyList[currentEnvId], fraction);

        interpolateEnv(currentEnvConfig, envList[currentEnvId], fraction);

        //   if (fraction <= 1) {
        applyEnvironment();
        applySkyConfig();
        //   }

        theta = Math.PI * ( useSky.inclination - 0.5 );
        phi = 2 * Math.PI * ( useSky.azimuth - 0.5 )+t;

        worldCenter.copy(camera.position);
        worldCenter.y = 0;

        sunSphere.position.x = 0.00001 * useSky.distance * Math.cos( phi );
        sunSphere.position.y = 0.00001 * useSky.distance * Math.sin( phi ) * Math.sin( theta );
        sunSphere.position.z = 0.00001 * useSky.distance * Math.sin( phi ) * Math.cos( theta );

        calcVec.set(0, 0, 0);

        //   calcVec.sub(camera.position);
        sunSphere.lookAt(calcVec);
        sky.mesh.position.copy(worldCenter);

        world.sun.position.copy(sunSphere.position);

        sky.uniforms.sunPosition.value.copy( sunSphere.position );

        sunSphere.position.add(worldCenter);

        //   world.sun.position.add(worldCenter);
        world.sun.quaternion.copy(sunSphere.quaternion);

        calcVec.x = 0;
        calcVec.y = 0;
        calcVec.z = 1;

        calcVec2.x = 0;
        calcVec2.y = 0;
        calcVec2.z = 1;

        calcVec.applyQuaternion(sunSphere.quaternion);
        calcVec2.applyQuaternion(camera.quaternion);

        //   calcVec.normalize();
        //   calcVec2.normalize();

        var sunInTheBack = calcVec.dot(calcVec2);

        updateDynamigFog(sunInTheBack);
        updateDynamigAmbient(sunInTheBack);

        if (sky.ctx) {
            setCanvasColor(sky.ctx, sky.tx);
        }

        //   applyFromBuffer(envBuffer);
    };

    ThreeEnvironment.readDynamicValue = function(worldProperty, key) {
        return world[worldProperty][key];
    };

    ThreeEnvironment.getEnvironmentDynamicWorld = function() {
        return world;
    };

    ThreeEnvironment.enableEnvironment = function() {
        if (enabled) return;
        enabled = true;
        scene.add( sky.mesh );
        ThreeAPI.getReflectionScene().add(sky.meshClone);
    //    ThreeAPI.getSetup().addPostrenderCallback(tickEnvironment);
    };

    ThreeEnvironment.getEnvConfigs = function() {
        return envList;
    };

    ThreeEnvironment.getCurrentEnvId = function() {
        return currentEnvId;
    };

    ThreeEnvironment.disableEnvironment = function() {
        if (!enabled) return;
        enabled = false;
        scene.remove( sky.mesh );
        ThreeAPI.getReflectionScene().remove(sky.meshClone);
    //    ThreeAPI.getSetup().removePostrenderCallback(tickEnvironment);
    };

    ThreeEnvironment.setEnvConfigId = function(envConfId, time) {
        transitionTime = time || 5;
        transitionProgress = 0;
        currentEnvId = envConfId;
    };

    ThreeEnvironment.advanceEnv = function(envArgs) {
        var keys = Object.keys(envList);
        var key = keys[envArgs[0] % keys.length];
        ThreeEnvironment.setEnvConfigId(key, envArgs[1]);
        console.log("Advance ENV ", key, envArgs, currentEnvId, envList);
    };

    evt.on(ENUMS.Event.ADVANCE_ENVIRONMENT, ThreeEnvironment.advanceEnv);

    ThreeEnvironment.initEnvironment = function(store, envReady) {


        scene = store.scene;
        renderer = store.renderer;
        camera = store.camera;

        initSky();

        var createEnvWorld = function(worldSetup) {

            for (var key in world) {
                scene.remove(world[key]);
            }

            world = {};

            for (key in worldSetup) {

                if (key === "ambient") {

                    world[key] = new THREE.AmbientLight(0x000000);
                    scene.add(world[key]);

                } else if (key === "fog") {
                    //    scene.fog = {density:0, near:1, far: 100000}; // new THREE.Fog( 100, 10000000);
                //    scene.fog = new THREE.Fog( 100, 10000000);
                //        world[key] = scene.fog;
                    world[key] = {density:0, near:1, far: 100000}
                    //    ThreeAPI.getReflectionScene().add(world[key]);
                } else {
                    world[key] = new THREE.DirectionalLight(0x000000);
                    scene.add(world[key]);
                    //    ThreeAPI.getReflectionScene().add(world[key]);
                }
            }

            var waterReady = function() {
                waterFx.initWaterEffect(world);
                envReady()
            };

            waterFx.initWater(waterReady);
        };


        var environmentListLoaded = function(scr, data) {

            //    console.log("Env List Loaded", data);

            for (var i = 0; i < data.length; i++){

                envList[data[i].id] = {};
                skyList[data[i].id] = {};
                var configs = data[i].configs;

                skyList[data[i].id] = data[i].sky;

                for (var j = 0; j < configs.length; j++) {

                    envList[data[i].id][configs[j].id] = configs[j];
                }
            }

            currentSkyConfig = skyList['current'];
            currentEnvConfig = envList['current'];

            applySkyConfig();
            applyEnvironment();

        };

        createEnvWorld(worldSetup);

        //     environmentListLoaded('', envData);

        new PipelineObject("ASSETS", "ENVIRONMENT", environmentListLoaded);

    };


    return ThreeEnvironment;

});