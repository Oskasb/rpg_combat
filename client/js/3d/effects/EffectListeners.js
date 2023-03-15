"use strict";

define([
        'EffectsAPI',
        'application/PipelineObject',
        'evt'

    ],
    function(
        EffectsAPI,
        PipelineObject,
        evt
    ) {

        var posVec;
        var velVec;
        var effectList;
        var fxPipe;

        var EffectsListeners = function() {

        };

        var setupEffect = function(args) {
        //        console.log("Setup FX:", args);
            posVec.copy(args.pos)
            velVec.copy(args.vel);
        };


        EffectsListeners.setupListeners = function() {

            var effectData = function(src, data) {
                effectList = fxPipe.buildConfig();
            };

            fxPipe = new PipelineObject('PARTICLE_EFFECTS', 'THREE', effectData);
        //    fxPipe.subscribe(effectData());
            //    effectList = fxPipe.buildConfig('effects');


            posVec = new THREE.Vector3();
            velVec = new THREE.Vector3();

            var playGameEffect = function(e) {
                setupEffect(evt.args(e));

                if (!effectList[evt.args(e).effect]) {
                        console.log("No FX", evt.args(e).effect)
                } else {
                    EffectsAPI.requestParticleEffect(evt.args(e).effect, posVec, velVec);
                }
            };

        };


        EffectsListeners.setEffectCallbacks = function(callbacks) {
            ThreeAPI.setEffectCallbacks(callbacks);
        };


        return EffectsListeners;

    });