import { GameScenario }  from "./gameworld/GameScenario.js";
import { GameCamera } from "../3d/camera/GameCamera.js";
import { ConfigData } from "../application/utils/ConfigData.js";
import { GameWorld } from "./gameworld/GameWorld.js";
import { PlayerMain } from "./Player/PlayerMain.js";
import { CharacterComposer } from "./Player/CharacterComposer.js";

class GameMain {
    constructor() {

        this.turnStatus = {
            totalTime:0,
            turnTime:4,
            turnProgress:0,
            turn:0
        }

        this.activeScenario = null;
        this.callbacks = {};
        this.gameTime = 0;
        this.configData = new ConfigData("WORLD_SYSTEMS", "GAME_SCENARIOS");
        this.navPointConfigData = new ConfigData("WORLD_SYSTEMS", "WORLD_NAV_POINTS");

        let updateNavpoint = function() {
            this.applyNavPoint();
        }.bind(this)

        this.navPointConfigData.addUpdateCallback(updateNavpoint);

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
        let charReady = function(char) {
            console.log("Player Char:", char)
            GameAPI.getPlayerMain().setPlayerCharacter(char);
            GameAPI.setActivePlayerCharacter(char);
            let initPlayerStash = function() {
                let itemCallback = function(gamePiece) {
                    GameAPI.getPlayerMain().playerStash.findPositionInStash(ThreeAPI.tempVec3);
                    gamePiece.getSpatial().setPosVec3(ThreeAPI.tempVec3);
                    GameAPI.getPlayerMain().callbacks.addToStash(gamePiece);
                }.bind(this);
/*
                GameAPI.createGamePiece({piece:"BELT_BRONZE"        }, itemCallback);
                GameAPI.createGamePiece({piece:"HELMET_VIKING"      }, itemCallback);
                GameAPI.createGamePiece({piece:"BELT_PLATE"         }, itemCallback);
                GameAPI.createGamePiece({piece:"LEGS_CHAIN"         }, itemCallback);
                GameAPI.createGamePiece({piece:"BOOTS_SCALE"        }, itemCallback);
                GameAPI.createGamePiece({piece:"GLOVES_SCALE"       }, itemCallback);
                GameAPI.createGamePiece({piece:"SHIRT_SCALE"        }, itemCallback);
                GameAPI.createGamePiece({piece:"LEGS_SCALE"         }, itemCallback);
                GameAPI.createGamePiece({piece:"LEGS_BRONZE"        }, itemCallback);
                GameAPI.createGamePiece({piece:"BREASTPLATE_BRONZE" }, itemCallback);
                GameAPI.createGamePiece({piece:"SHIRT_CHAIN"        }, itemCallback);
*/
                evt.dispatch(ENUMS.Event.REQUEST_SCENARIO, {
                    id:"home_scenario",
                    dynamic:"home_hovel_dynamic"
                });

            }
            initPlayerStash()


        }.bind(this)

        GameAPI.composeCharacter("PLAYER_MAIN", charReady)
        evt.on(ENUMS.Event.REQUEST_SCENARIO, this.callbacks.requestScenario);
        evt.on(ENUMS.Event.FRAME_READY, this.callbacks.updateGameFrame)

    }

    addGameUpdateCallback(callback) {
        if (this.onUpdateCallbacks.indexOf(callback) !== -1) {
            console.log("updateCb already added...")
            return;
        }
        this.onUpdateCallbacks.push(callback);
    }

    removeGameUpdateCallback(callback) {
        return MATH.quickSplice(this.onUpdateCallbacks, callback);
    }


    applyNavPoint() {

        if (!this.dynamicId) return;

        let navPointData = this.navPointConfigData.parseConfigData()['world_dynamic_navpoints'];
        let navConf = navPointData.config;
        let navPoint = navConf[this.dynamicId]['camera'];

        let camCallback = function() {
            if (this.activeScenario) {
                if (this.activeScenario.activateDynamicScenario) {
                    this.activeScenario.activateDynamicScenario()
                }
            }
        }.bind(this);
        navPoint.callback = camCallback;

        evt.dispatch(ENUMS.Event.SET_CAMERA_TARGET, navPoint);
    }

    requestScenario(scenarioEvent) {
        evt.dispatch(ENUMS.Event.MAIN_CHAR_SELECT_TARGET, {piece:null, value:false });
        let scenarioId = scenarioEvent['id']
        let dynamicId = scenarioEvent['dynamic']
        this.dynamicId = dynamicId;
        let data = this.configData.parseConfigData()[scenarioId];
        let config = data.config;
        let staticId = config['scenario_static'];
        this.applyNavPoint();

        let dynamicReady = function(dynScen) {

        }

        let staticReadyCB = function() {
            this.activeScenario.initGameDynamicScenario(dynamicId, dynamicReady)
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

    updateMainGameTurn(tpf, gameTime) {

        this.turnStatus.totalTime = gameTime;
        let turnTime = this.turnStatus.turnTime;
        this.turnStatus.turnProgress -= tpf / turnTime;
        this.turnStatus.timeRemaining = this.turnStatus.turnProgress * turnTime;
        if (this.turnStatus.turnProgress < 0) {
            this.turnStatus.turn++;
            this.turnStatus.turnProgress++;

        }
    }

    updateGameMain(frame) {
        this.gameTime+= frame.tpf;

        this.updateMainGameTurn(frame.tpf, this.gameTime);

            if (this.activeScenario) {
                this.activeScenario.tickGameScenario(frame);
            }

        for (let i = 0; i < this.onUpdateCallbacks.length; i++) {
            this.onUpdateCallbacks[i](frame.tpf, this.gameTime)
        }

    }

}

export {GameMain};