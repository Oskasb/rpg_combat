import { GameScenario }  from "./gameworld/GameScenario.js";
import { GameCamera } from "../3d/camera/GameCamera.js";
import { ConfigData } from "../application/utils/ConfigData.js";

class GameMain {
    constructor() {
        this.activeScenario;
        this.callbacks = {};
        this.playerPieces = [];
        this.gameTime = 0;
        this.configData = new ConfigData("WORLD", "GAME_SCENARIOS");
        this.gameCamera = new GameCamera();

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
        evt.on(ENUMS.Event.REQUEST_SCENARIO, this.callbacks.requestScenario);
        evt.on(ENUMS.Event.FRAME_READY, this.callbacks.updateGameFrame)


        this.initPlayerPiece('PIECE_FIGHTER');
    }


    initPlayerPiece(pieceName) {
        let charCb = function (gamePiece) {
            console.log("Player Piece: ", gamePiece);
            GameAPI.setActivePlayerCharacter(gamePiece);
            this.playerPieces.push(gamePiece);
        }.bind(this);

        GameAPI.createGamePiece(pieceName, charCb)
    }

    requestScenario(scenarioEvent) {
        let camCallback = function() {
            this.activeScenario.activateDynamicScenario()
        }.bind(this);
        scenarioEvent.callback = camCallback;

        evt.dispatch(ENUMS.Event.SET_CAMERA_TARGET, scenarioEvent);
        let scenarioId = scenarioEvent['id']
        let dynamicId = scenarioEvent['dynamic']
        let data = this.configData.parseConfigData()[scenarioId];
        console.log(data)
        let config = data.config;
        let staticId = config['scenario_static'];

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

        for (let i = 0; i < this.playerPieces.length; i++) {
            this.playerPieces[i].tickGamePiece(frame.tpf, this.gameTime)
        }
    }

}

export {GameMain};