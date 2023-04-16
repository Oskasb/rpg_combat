class GameCamera {
    constructor() {
        let tpf;
        let fraction = 1;
        let cameraPos = new THREE.Vector3();
        let cameraLookAt = new THREE.Vector3();
        let targetLookAt = new THREE.Vector3();
        let targetPos = new THREE.Vector3();
        let transitionStartTime = 0;
        let transitionEndTime = 1;
        let currentTime = 0;
        let transitionEndCallbacks = [];


        let applyFrameToCameraMotion = function() {
            if (fraction > 1) return;
            fraction = MATH.calcFraction(transitionStartTime, transitionEndTime, currentTime);
            let factor = 1;
            if (fraction < 0.95) {
                factor =  MATH.curveSigmoid(fraction*0.5);
            } else {
                fraction = 1;
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
         //       console.log("set cam callback")
                if (transitionEndCallbacks.indexOf(eventData.callback) === -1) {
                    transitionEndCallbacks.push(eventData.callback)
                }
            }
        };


        let applyFrame = function(frame) {
                currentTime = frame.elapsedTime;
                tpf = frame.tpf;
                applyFrameToCameraMotion()
            };


        evt.on(ENUMS.Event.FRAME_READY, applyFrame);
        evt.on(ENUMS.Event.SET_CAMERA_TARGET, setCameraTargetPosInTime)

        this.call = {
            setCameraTargetPosInTime:setCameraTargetPosInTime
        }
    }

    getDefaultCamParams = function(store) {
        store.camCallback = function() {

        };

            store.mode = null;
            store.pos = [0, 0, 0];
            store.lookAt = [0, 0, 0];
            store.offsetPos = [0, 0, 0];
            store.offsetLookAt = [0, 0, 0]
    }

    updatePlayerCamera = function(camParams) {
        let playerPos = GameAPI.getActivePlayerCharacter().gamePiece.getPos()
        camParams.pos[0] = playerPos.x + camParams.offsetPos[0];
        camParams.pos[1] = playerPos.y + camParams.offsetPos[1];
        camParams.pos[2] = playerPos.z + camParams.offsetPos[2];
        camParams.lookAt[0] = playerPos.x + camParams.offsetLookAt[0];
        camParams.lookAt[1] = playerPos.y + camParams.offsetLookAt[1];
        camParams.lookAt[2] = playerPos.z + camParams.offsetLookAt[2];
        this.call.setCameraTargetPosInTime(camParams);
    }

    buildCameraParams = function(camConf, camParams) {
        camParams.offsetPos[0] = camConf.offsetPos[0];
        camParams.offsetPos[1] = camConf.offsetPos[1];
        camParams.offsetPos[2] = camConf.offsetPos[2];
        camParams.offsetLookAt[0] = camConf.offsetLookAt[0];
        camParams.offsetLookAt[1] = camConf.offsetLookAt[1];
        camParams.offsetLookAt[2] = camConf.offsetLookAt[2];
        camParams.time = 0.05;
        if (camConf['mode'] === "portrait_main_char") {
            console.log("Make cam go to char here for nice")
        }
    }


}

export { GameCamera }