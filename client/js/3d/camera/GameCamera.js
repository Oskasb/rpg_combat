class GameCamera {
    constructor() {
        let fraction = 1;
        let cameraPos = new THREE.Vector3();
        let cameraLookAt = new THREE.Vector3();
        let targetLookAt = new THREE.Vector3();
        let targetPos = new THREE.Vector3();
        let transitionStartTime = 0;
        let transitionEndTime = 0;
        let currentTime = 0;
        let transitionEndCallbacks = [];


        let applyFrameToCameraMotion = function() {
            if (fraction > 1) return;
            fraction = MATH.calcFraction(transitionStartTime, transitionEndTime, currentTime);
            let factor = 1;
            if (fraction < 1) {
                factor = MATH.curveCube(fraction);
            } else {
                factor = 1;
                MATH.callAll(transitionEndCallbacks);
                transitionEndCallbacks = [];
            }

            cameraPos.copy(ThreeAPI.getCamera().position);
            ThreeAPI.copyCameraLookAt(cameraLookAt);

            let pos = cameraPos;
            let tPos = targetPos;
            pos.x = MATH.interpolateFromTo(pos.x, tPos.x, factor);
            pos.y = MATH.interpolateFromTo(pos.y, tPos.y, factor);
            pos.z = MATH.interpolateFromTo(pos.z, tPos.z, factor);

            let cLook = cameraLookAt;
            let tLook = targetLookAt;
            cLook.x = MATH.interpolateFromTo(cLook.x, tLook.x, factor);
            cLook.y = MATH.interpolateFromTo(cLook.y, tLook.y, factor);
            cLook.z = MATH.interpolateFromTo(cLook.z, tLook.z, factor);

            ThreeAPI.setCameraPos(pos.x, pos.y, pos.z);
            ThreeAPI.cameraLookAt(cLook.x, cLook.y, cLook.z);

        };

        let setCameraTargetPosInTime = function(eventData) {
            fraction = 0;
            transitionStartTime = currentTime;
            transitionEndTime = currentTime + eventData.time;
            cameraPos.copy(ThreeAPI.getCamera().position);
            ThreeAPI.copyCameraLookAt(cameraLookAt);
            MATH.vec3FromArray(targetLookAt, eventData.lookAt)
            MATH.vec3FromArray(targetPos, eventData.pos)
            if (typeof(eventData.callback) === 'function') {
                console.log("set cam callback")
                transitionEndCallbacks.push(eventData.callback)
            }
        };


        let applyFrame = function(frame) {
                currentTime = frame.elapsedTime;
                applyFrameToCameraMotion()
            };


        evt.on(ENUMS.Event.FRAME_READY, applyFrame);
        evt.on(ENUMS.Event.SET_CAMERA_TARGET, setCameraTargetPosInTime)
    }






}

export { GameCamera }