"use strict";

require([
    'ThreeAPI',
    'WorkerAPI',
    'application/load/Setup',
    'application/load/SystemDetector',
    'application/ClientViewer',
    'ui/GameScreen'
], function(
    ThreeAPI,
    WorkerAPI,
    Setup,
    SystemDetector,
    ClientViewer,
    GameScreen
) {

    var clientViewer;

    GameScreen.registerAppContainer(document.body);

    new SystemDetector();

    var init = function(sceneReady) {

        clientViewer = new ClientViewer();

        //    var sceneReady = function() {
        //    Setup.completed()
        //    };

        var mainWorkerCallback = function(worker, key) {
        //    console.log("Worker Setup:", worker, key);

            worker.port.onmessage = function(e) {
                WorkerAPI.processMessage(key, e)
            };

        //    ThreeAPI.initThreeScene(GameScreen.getElement(), 1, false);

            clientViewer.initScene(sceneReady)

    //        worker.port.postMessage([ENUMS.Message.RENDERER_READY, [1, GameScreen.getAspect()]]);
        };

        WorkerAPI.initWorkers(clientViewer);
        WorkerAPI.requestWorker(ENUMS.Worker.MAIN_WORKER, mainWorkerCallback);
    };

//    setTimeout(init, 10);

    var onDataLoadCompleted = function() {
        Setup.completed()
    };

    var sceneReady = function() {
        Setup.init(onDataLoadCompleted);
    };

    init(sceneReady)


});
