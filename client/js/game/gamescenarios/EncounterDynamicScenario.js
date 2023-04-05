import * as ScenarioUtils from "../gameworld/ScenarioUtils.js";
import {ConfigData} from "../../application/utils/ConfigData.js";


class EncounterDynamicScenario {
    constructor(dataId) {
        this.dataId = dataId;
        this.pieces = [];
        this.onUpdateCallbacks = []
        this.configData =  new ConfigData("DYNAMIC_SCENARIOS", "GAME_SCENARIOS",  'dynamic_view_init', 'data_key', 'config')
        this.isActive = false;
    }

    initEncounterDynamicScenario(onReady) {
        this.isActive = true;
        let onConfig = function(config, updateCount) {
            if (!this.isActive) return;
        //    console.log("Update Count: ", updateCount, config)
            if (updateCount) {
                GuiAPI.printDebugText("REFLOW DYNAMIC SCENARIO")
                this.exitScenario();
            } else {
                setTimeout(function() {
                    onReady(this);
                }, 0);
            }
            this.applyScenarioConfig(config, updateCount);
        }.bind(this)

        this.configData.parseConfig(this.dataId, onConfig)

    }

    activateEncDynScenario() {
        this.page = GuiAPI.activatePage(this.config['gui_page']);

    }

    applyScenarioConfig = function(config, isUpdate) {

        this.config = config;

        if (!isUpdate) GuiAPI.activatePage(null);

        evt.dispatch(ENUMS.Event.ADVANCE_ENVIRONMENT,  {envId:config['environment'], time:50});

    //    let pos = this.config.camera.pos;
    //    let lookAt = this.config.camera.lookAt;

        let pieces = this.pieces;

        if (config['player']) ScenarioUtils.positionPlayer(config['player']);

        if(config.spawn) {

            for (let i = 0; i < config.spawn.length; i++) {
                let spawn = config.spawn[i];
                let pieceInstanceCallback = function(gamePiece) {
                    pieces.push(gamePiece);
                    gamePiece.getSpatial().setPosXYZ(spawn.pos[0],spawn.pos[1], spawn.pos[2])
                    gamePiece.getSpatial().setRotXYZ(spawn.rot[0],spawn.rot[1], spawn.rot[2])
                    GameAPI.addPieceToWorld(gamePiece);
                    GameAPI.registerGameUpdateCallback(gamePiece.getOnUpdateCallback());
                };

                GameAPI.createGamePiece(spawn, pieceInstanceCallback)
            }
        }

    };

    updateScenarioPieces(tpf, scenarioTime) {

    };

    exitScenario() {
        this.isActive = false;
        GuiAPI.guiPageSystem.closeGuiPage(this.page);
        while (this.pieces.length) {
            GameAPI.takePieceFromWorld(this.pieces.pop())
        }
    };

    tickScenario(tpf, scenarioTime) {

        if (!this.config) {
            return;
        }

        this.updateScenarioPieces(tpf, scenarioTime);



    //    ThreeAPI.setCameraPos(pos[0] + Math.sin(scenarioTime*0.3)*0.5, pos[1], pos[2]+ Math.cos(scenarioTime*0.15)*0.5);
    //    ThreeAPI.cameraLookAt(lookAt[0] + Math.sin(scenarioTime*0.2)*0.5, lookAt[1], lookAt[2]+ Math.cos(scenarioTime*0.1)*0.5)

    }

}

export {EncounterDynamicScenario}