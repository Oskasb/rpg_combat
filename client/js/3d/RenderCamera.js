"use strict";

define([
    'evt'

], function(
    evt
) {

    var RenderCamera = function() {

        this.setupListener();
    };

    RenderCamera.prototype.setupListener = function() {

        var camera;
        var updateCamera = function(args) {

            camera = ThreeAPI.getCamera();

            evt.getArgVec3(args, 0, camera.position);
            evt.getArgQuat(args, 6, camera.quaternion);

            camera.fov    =  args[15] ;
            camera.near   =  args[17] ;
            camera.far    =  args[19] ;
            camera.aspect =  args[21]

        };

        evt.on(ENUMS.Event.UPDATE_CAMERA, updateCamera)
    };


    return RenderCamera;

});