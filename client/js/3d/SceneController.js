"use strict";


define([
    '3d/ThreeController',
    'EffectsAPI',
    '3d/effects/EffectListeners',
    '3d/CanvasMain',
    '3d/RenderCamera'

], function(
    ThreeController,
    EffectsAPI,
    EffectsListeners,
    CanvasMain,
    RenderCamera
) {



    var SceneController = function() {
        this.canvasMain = new CanvasMain();
    };

    SceneController.prototype.setup3dScene = function(ready) {
        this.renderCamera = new RenderCamera()
        ThreeController.setupThreeRenderer(ready);
    };

    SceneController.prototype.setupEffectPlayers = function(onReady) {
        // main thread init
        EffectsListeners.setupListeners();
        EffectsAPI.initEffects(onReady)
    };

    SceneController.prototype.tickEffectsAPI = function(systemTime) {
        EffectsAPI.tickEffectSimulation(systemTime);
    };

    SceneController.prototype.tickCanvasScene = function(tpf) {
        this.canvasMain.updateCanvasMain(tpf)
    };


    SceneController.prototype.tickEnvironment = function(tpf) {
        ThreeAPI.getEnvironment().tickEnvironment(tpf);
    };

    return SceneController;

});