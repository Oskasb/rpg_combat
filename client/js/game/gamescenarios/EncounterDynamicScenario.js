import * as ScenarioUtils from "../gameworld/ScenarioUtils.js";
import {ConfigData} from "../../application/utils/ConfigData.js";

class EncounterDynamicScenario {
    constructor(dataId) {
        this.dataId = dataId;
        this.pieces = [];
        this.characters = [];
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

        let pieces = this.pieces;

        if (config['player']) ScenarioUtils.positionPlayer(config['player']);

        let characters = this.characters;

        if (config['characters']) {
            for (let i = 0; i < config.characters.length; i++) {

                let char =  config.characters[i];
                let charCB = function(character) {
                    characters.push(character);
                    let charPiece = character.gamePiece;
                    GameAPI.registerGameUpdateCallback(charPiece.getOnUpdateCallback());
                    MATH.vec3FromArray(ThreeAPI.tempVec3, char.pos);
                    MATH.randomVector(ThreeAPI.tempVec3b);
                    ThreeAPI.tempVec3b.y = 0;
                    ThreeAPI.tempVec3b.multiplyScalar(2);
                    ThreeAPI.tempVec3b.add(ThreeAPI.tempVec3);
                    charPiece.getSpatial().setPosVec3( ThreeAPI.tempVec3b)
                    charPiece.getSpatial().setRotXYZ(char.rot[0],char.rot[1], char.rot[2])
                    let moveCB = function (movedCharPiece) {
                        movedCharPiece.getSpatial().setRotXYZ(char.rot[0],char.rot[1], char.rot[2])
                    }

                    charPiece.getPieceMovement().moveToTargetAtTime('walk',ThreeAPI.tempVec3b, ThreeAPI.tempVec3, 2, moveCB)



                }

                GameAPI.composeCharacter(char['character'], charCB)
            }

        }

        if(config.spawn) {

            for (let i = 0; i < config.spawn.length; i++) {
                let spawn = config.spawn[i];
                let pieceInstanceCallback = function(gamePiece) {
                    pieces.push(gamePiece);
                    gamePiece.getSpatial().setPosXYZ(spawn.pos[0],spawn.pos[1], spawn.pos[2])
                    gamePiece.getSpatial().setRotXYZ(spawn.rot[0],spawn.rot[1], spawn.rot[2])
                    GameAPI.registerGameUpdateCallback(gamePiece.getOnUpdateCallback());
                };

                GameAPI.createGamePiece(spawn, pieceInstanceCallback)
            }
        }
    };

    exitScenario() {
        this.isActive = false;
        GuiAPI.guiPageSystem.closeGuiPage(this.page);
        while (this.pieces.length) {
            let piece = this.pieces.pop();
            piece.disbandGamePiece()
        }

        while (this.characters.length) {
            let char = this.characters.pop();
            char.dismissCharacter();
        }
    };

    tickScenario(tpf, scenarioTime) {

    }

}

export {EncounterDynamicScenario}