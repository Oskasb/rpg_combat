"use strict";



define([
        'WorkerAPI',
        'PipelineAPI',
        '3d/SceneController',
        '3d/DynamicMain',
        'application/debug/SetupDebug',
        'ui/GameScreen',
		'evt'
    ],
	function(
        WorkerAPI,
        PipelineAPI,
        SceneController,
        DynamicMain,
        SetupDebug,
        GameScreen,
        evt
    ) {

    var i;
    var frame = 0;
    var lastTpf = 0;
    var sceneController;
    var callbacks = [];
    var workerCallbacks = [];
    var callbackFunctions;
        var setupDebug;
    var dynamicMain;

        var now = MATH.getNowMS();
        var dt = 0;

        var ClientViewer = function() {

            sceneController = new SceneController();
            dynamicMain = new DynamicMain();


            var prerenderTick = function(tpf) {
                dt = MATH.getNowMS() - now;

                evt.fire(ENUMS.Event.TRACK_STAT, MATH.trackEvent(ENUMS.TrackStats.IDLE_R, dt , ENUMS.Units.ms, 2))

                now = MATH.getNowMS();
                this.prerenderTick(tpf)
            }.bind(this);

            var postrenderTick = function(tpf) {
                this.tickPostrender(tpf)
                dt = MATH.getNowMS() - now;

                evt.fire(ENUMS.Event.TRACK_STAT, MATH.trackEvent(ENUMS.TrackStats.RNDR, dt , ENUMS.Units.ms, 2))
            }.bind(this);


            var workerFrameCallback = function(frame) {
                now = MATH.getNowMS();
                setupDebug.updateSetupDebug();

                sceneController.tickEnvironment(lastTpf);

                evt.initEventFrame(frame);
            //    ThreeAPI.updateCamera();


                ThreeAPI.applyDynamicGlobalUniforms();

                ThreeAPI.updateAnimationMixers(lastTpf);
                ThreeAPI.updateSceneMatrixWorld(lastTpf);

                dynamicMain.tickDynamicMain(lastTpf);


                dt = MATH.getNowMS() - now;
                now = MATH.getNowMS();

                evt.fire(ENUMS.Event.TRACK_STAT, MATH.trackEvent(ENUMS.TrackStats.R_DYNAMIC, dt , ENUMS.Units.ms, 2));

                var memory = performance.memory;
                var memoryUsed = ( (memory.usedJSHeapSize / 1048576) / (memory.jsHeapSizeLimit / 1048576 ));
                var mb = Math.round(memory.usedJSHeapSize / 104857.6) / 10;

                evt.fire(ENUMS.Event.TRACK_STAT, MATH.trackEvent(ENUMS.TrackStats.R_HEAP, mb , ENUMS.Units.mb, 1));
                evt.fire(ENUMS.Event.TRACK_STAT, MATH.trackEvent(ENUMS.TrackStats.R_MEM,  Math.round(memoryUsed*1000)/10 , ENUMS.Units['%'], 1));
                evt.fire(ENUMS.Event.TRACK_STAT, MATH.trackEvent(ENUMS.TrackStats.D_CALLS,  ThreeAPI.sampleRenderInfo('render', 'calls') ,      ENUMS.Units.NONE, 0));
                evt.fire(ENUMS.Event.TRACK_STAT, MATH.trackEvent(ENUMS.TrackStats.TRIS,     ThreeAPI.sampleRenderInfo('render', 'triangles')  , ENUMS.Units.NONE, 0));
                evt.fire(ENUMS.Event.TRACK_STAT, MATH.trackEvent(ENUMS.TrackStats.GEOMS,    ThreeAPI.sampleRenderInfo('memory', 'geometries') , ENUMS.Units.NONE, 0));
                evt.fire(ENUMS.Event.TRACK_STAT, MATH.trackEvent(ENUMS.TrackStats.TX_COUNT, ThreeAPI.sampleRenderInfo('memory', 'textures') ,   ENUMS.Units.NONE, 0));

                var shaders = ThreeAPI.sampleRenderInfo('programs', null);

                var count = 0;

                for (var key in shaders) {
                    count++
                }

                evt.fire(ENUMS.Event.TRACK_STAT, MATH.trackEvent(ENUMS.TrackStats.SHADERS,  count , ENUMS.Units.NONE, 0))

            };

            callbackFunctions = {
                workerFrameCallback:workerFrameCallback,
                prerenderTick:prerenderTick,
                postrenderTick:postrenderTick
            }
		};

        ClientViewer.prototype.worldReady = function() {
            ThreeAPI.requestFrameRender();
            WorkerAPI.callWorker(ENUMS.Worker.MAIN_WORKER,[ENUMS.Message.RENDERER_READY, [1, GameScreen.getAspect()]]);
        };

        ClientViewer.prototype.getDynamicMain = function() {
            return dynamicMain;
        };


        ClientViewer.prototype.initScene = function(ready) {
            //    console.log("tick", tpf)

            sceneController.setup3dScene(ready);
            setupDebug = new SetupDebug();
            ThreeAPI.requestFrameRender();
        };



        ClientViewer.prototype.setRenderCallbacksOn = function(on) {

            ThreeAPI.requestFrameRender();
            if (on) {
        //        console.log("++Attach Renderer Callbacks");
                ThreeAPI.getSetup().addPrerenderCallback(callbackFunctions.prerenderTick);
                ThreeAPI.getSetup().addPostrenderCallback(callbackFunctions.postrenderTick);
                workerCallbacks.push(callbackFunctions.workerFrameCallback);
            } else {
        //        console.log("--Detach Renderer Callbacks");
                ThreeAPI.getSetup().removePrerenderCallback(callbackFunctions.prerenderTick);
                ThreeAPI.getSetup().removePostrenderCallback(callbackFunctions.postrenderTick);
                workerCallbacks.splice(workerCallbacks.indexOf(callbackFunctions.workerFrameCallback, 1));
            }

        };

        var generateMessage = [ENUMS.Message.GENERATE_FRAME, [frame, lastTpf]];
        var frameMessage = [ENUMS.Message.NOTIFY_FRAME, [frame, lastTpf]];

        ClientViewer.prototype.prerenderTick = function(tpf) {
        //    console.log("tick", tpf)

            lastTpf = tpf;
            frame++;
        //    ThreeAPI.updateCamera();
            generateMessage[1][0] = frame;
            generateMessage[1][1] = lastTpf;
            WorkerAPI.callWorker(ENUMS.Worker.MAIN_WORKER, generateMessage)

		};

        var notifyFrameMessage = [];

        ClientViewer.prototype.tickPostrender = function(tpf) {

            frameMessage[1][0] = frame;
            frameMessage[1][1] = lastTpf;
            WorkerAPI.callWorker(ENUMS.Worker.MAIN_WORKER, frameMessage)
        //    console.log("tick", frame)
        //    sampleCamera(ThreeAPI.getCamera());

        };

        ClientViewer.prototype.notifyWorkerFrameReady = function(msg) {
            for (i = 0; i < workerCallbacks.length; i++) {
                workerCallbacks[i](msg);
            }

            PipelineAPI.tickPipelineAPI(lastTpf)
            ThreeAPI.requestFrameRender();
        };

        ClientViewer.prototype.workerMessage = function(msg, workerKey) {

        };

		return ClientViewer;

	});