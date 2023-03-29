import { GameScenario }  from "./gameworld/GameScenario.js";
import { GameCamera } from "../3d/camera/GameCamera.js";
import { ConfigData } from "../application/utils/ConfigData.js";
import { GameWorld } from "./gameworld/GameWorld.js";
import { PlayerMain } from "./Player/PlayerMain.js";
import { SetupPlayer } from "./Player/SetupPlayer.js";

class GameMain {
    constructor() {
        this.activeScenario;
        this.callbacks = {};
        this.gameTime = 0;
        this.configData = new ConfigData("WORLD", "GAME_SCENARIOS");
        this.navPointConfigData = new ConfigData("WORLD", "WORLD_NAV_POINTS");
        this.gameCamera = new GameCamera();
        this.gameWorld = new GameWorld();
        this.playerMain = new PlayerMain();
        this.onUpdateCallbacks = [];
    }

    setupCallbacks = function () {
        let callbacks = this.callbacks;
        let _this = this;

        callbacks.updateGameFrame = function (frame) {
            _this.updateGameMain(frame)
        };
        callbacks.requestScenario = function (event) {
            _this.requestScenario(event)
        }

    };

    initGameMain() {
        this.setupCallbacks();

        new SetupPlayer()


        evt.on(ENUMS.Event.REQUEST_SCENARIO, this.callbacks.requestScenario);
        evt.on(ENUMS.Event.FRAME_READY, this.callbacks.updateGameFrame)

    }

    addGameUpdateCallback(callback) {
        this.onUpdateCallbacks.push(callback);
    }

    removeGameUpdateCallback(callback) {
        return MATH.quickSplice(this.onUpdateCallbacks, callback);
    }



    requestScenario(scenarioEvent) {
        let scenarioId = scenarioEvent['id']
        let dynamicId = scenarioEvent['dynamic']
        let data = this.configData.parseConfigData()[scenarioId];
        let config = data.config;
        let staticId = config['scenario_static'];

        let navPointData = this.navPointConfigData.parseConfigData()['world_dynamic_navpoints'];
        let navConf = navPointData.config;
        let navPoint = navConf[dynamicId];

        let camCallback = function() {
            if (this.activeScenario) {
                this.activeScenario.activateDynamicScenario()
            }
        }.bind(this);
        navPoint.callback = camCallback;

        evt.dispatch(ENUMS.Event.SET_CAMERA_TARGET, navPoint);



        console.log("Scenario Requested: ", scenarioId, dynamicId);

        let staticReadyCB = function() {
            this.activeScenario.initGameDynamicScenario(dynamicId)
        }.bind(this)

            if (this.activeScenario) {
                if (this.activeScenario.scenarioId === scenarioId) {

                    staticReadyCB();
                    return;
                }
            }
            this.closeGameScenario();
        this.initGameScenario(scenarioId, staticId, staticReadyCB)

    }

    initGameScenario(scenarioId, staticId, staticReadyCB) {
        if (this.activeScenario) {
            if (this.activeScenario.scenarioId !== scenarioId) {
                console.log("Game Scenario already active... cancelling change")
                return;
            } else {
                this.closeGameScenario();
            }
        }

        let scenario = new GameScenario(scenarioId);
        this.activeScenario = scenario;
        scenario.initGameStaticScenario(staticId, staticReadyCB);
    }

    closeGameScenario() {
        if (!this.activeScenario) {
        //    console.log("No Game Scenario active... cancelling")
        } else {
            let scenario = this.activeScenario;
            this.activeScenario = null;
            scenario.exitGameScenario();
        }


    }

    updateGameMain(frame) {
        this.gameTime+= frame.tpf;

            if (this.activeScenario) {
                this.activeScenario.tickGameScenario(frame);
            }

        for (let i = 0; i < this.onUpdateCallbacks.length; i++) {
            this.onUpdateCallbacks[i](frame.tpf, this.gameTime)
        }

    }

}

export {GameMain};