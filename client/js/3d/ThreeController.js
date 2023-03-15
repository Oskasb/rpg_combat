//"use strict";


define([
    'PipelineAPI',
    'evt',
    'ui/GameScreen'
], function(
    PipelineAPI,
    evt,
    GameScreen
) {
    var pxRatio;

    var fireResize;

    var divId = 'canvas_window';
    
    var ThreeController = function() {

    };

    ThreeController.setupThreeRenderer = function(ready) {
    //    new ThreeCamera();
    //    console.log("Setup Three Renderer");

        pxRatio = window.devicePixelRatio;

        var antialias = PipelineAPI.readCachedConfigKey('SETUP', 'ANTIALIAS');
    //    antialias = false;
        pxRatio =  PipelineAPI.readCachedConfigKey('SETUP', 'PX_SCALE');

        ThreeAPI.initThreeScene(GameScreen.getElement(), pxRatio, antialias);

        PipelineAPI.setCategoryKeyValue('GAME_DATA', 'CAMERA', ThreeAPI.getCamera());

        setTimeout(function() {

            setTimeout(function() {

                fireResize();
                ready();
            }, 10)

        },20);

        window.addEventListener('resize', notifyRezize);
        monkeypatchCustomEngine();
    };

    var relayCamera = function(camera, comBuffer) {

        comBuffer[ENUMS.BufferChannels.CAM_POS_X]      = camera.position.x;
        comBuffer[ENUMS.BufferChannels.CAM_POS_Y]      = camera.position.y;
        comBuffer[ENUMS.BufferChannels.CAM_POS_Z]      = camera.position.z;

        comBuffer[ENUMS.BufferChannels.CAM_QUAT_X]     = camera.quaternion.x;
        comBuffer[ENUMS.BufferChannels.CAM_QUAT_Y]     = camera.quaternion.y;
        comBuffer[ENUMS.BufferChannels.CAM_QUAT_Z]     = camera.quaternion.z;
        comBuffer[ENUMS.BufferChannels.CAM_QUAT_W]     = camera.quaternion.w;

        comBuffer[ENUMS.BufferChannels.CAM_FOV]        = camera.fov;
        comBuffer[ENUMS.BufferChannels.CAM_NEAR]       = camera.near;
        comBuffer[ENUMS.BufferChannels.CAM_FAR]        = camera.far;
        comBuffer[ENUMS.BufferChannels.CAM_ASPECT]     = camera.aspect;

    };

    var notifyRezize = function() {
        ThreeAPI.updateWindowParameters(GameScreen.getWidth(), GameScreen.getHeight(), GameScreen.getAspect(), pxRatio);
    //    relayCamera(ThreeAPI.getCamera(), PipelineAPI.readCachedConfigKey('SHARED_BUFFERS', ENUMS.Key.WORLD_COM_BUFFER));
    };

    var monkeypatchCustomEngine = function() {

    //    document.getElementById(divId).style.left = '122em';
    //    document.getElementById(divId).style.right = '122em';
    //    document.getElementById(divId).style.top = '0em';
    //    document.getElementById(divId).style.bottom = '0em';
    //    document.getElementById(divId).style.width = 'auto';
    //    document.getElementById(divId).style.height = 'auto';
    //    document.getElementById(divId).style.position = 'fixed';

        var width = window.innerWidth;
        var height = window.innerHeight;
        var landscape = false;
        var timeout;

        var handleResize = function() {

            width = window.innerWidth;
            height = window.innerHeight;

            if (width > height) {
            /*
                document.getElementById(divId).style.left = '122em';
                document.getElementById(divId).style.right = '122em';
                document.getElementById(divId).style.top = '0em';
                document.getElementById(divId).style.bottom = '0em';
*/
                GameScreen.setLandscape(true);
                landscape = true;

            } else {
             /*
                document.getElementById(divId).style.left = '0em';
                document.getElementById(divId).style.right = '0em';
                document.getElementById(divId).style.top = '122em';
                document.getElementById(divId).style.bottom = '122em';
*/
                GameScreen.setLandscape(false);
                landscape = false;

            }

            width = document.getElementById(divId).offsetWidth;
            height = document.getElementById(divId).offsetHeight;

            PipelineAPI.setCategoryData('SETUP', {SCREEN:[width, height], LANDSCAPE:landscape});
            GameScreen.notifyResize();
            setTimeout(function() {
                GameScreen.notifyResize();
                notifyRezize();
            }, 1)
        };

        fireResize = function() {
            handleResize();

            clearTimeout(timeout, 1);
            timeout = setTimeout(function() {
                handleResize();
            }, 50)
        };

        window.addEventListener('resize', fireResize);

        window.addEventListener('load', function() {
            fireResize()
        });

        setTimeout(function() {
            fireResize();
        }, 100);

    };

    return ThreeController;

});