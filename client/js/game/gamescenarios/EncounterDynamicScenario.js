import * as ScenarioUtils from "../gameworld/ScenarioUtils.js";
import {ConfigData} from "../../application/utils/ConfigData.js";
import { EncounterGrid } from "./EncounterGrid.js";

class EncounterDynamicScenario {
    constructor(dataId) {
        this.dataId = dataId;
        this.pieces = GameAPI.getWorldItemPieces();
        this.characters = [];
        this.onUpdateCallbacks = []
        this.configData =  new ConfigData("DYNAMIC_SCENARIOS", "GAME_SCENARIOS",  'dynamic_view_init', 'data_key', 'config')
        this.isActive = false;

        this.encounterGrid = new EncounterGrid();




        let camParams = {}
        GameAPI.getGameCamera().getDefaultCamParams(camParams)

        let applyCamParams = function(camConf) {
            GameAPI.getGameCamera().buildCameraParams(camConf, camParams)
        }

        let updateCamera = function() {
            GameAPI.getGameCamera().updatePlayerCamera(camParams)
        };

        this.call = {
            applyCamParams:applyCamParams,
            updateCamera:updateCamera
        }

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
    let config = this.config;

        let pageReady = function(page) {
    //        console.log("PAGE READY", page);
            if (config.INFO) {
                evt.dispatch(ENUMS.Event.SCENARIO_HEADER,  {value:config.INFO['header']});
                evt.dispatch(ENUMS.Event.SCENARIO_TEXT,    {value:config.INFO['text_box']});
            }
        }

        this.page = GuiAPI.activatePage(this.config['gui_page'], pageReady);

        if (config['camera']) {
   //         console.log("Set Camera mode: ", config.camera)
            let camParams = this.buildCameraParams();
            this.call.applyCamParams(camParams);
            let camFollow = this.call.updateCamera;
            setTimeout(function() {
                GameAPI.getActivePlayerCharacter().gamePiece.addPieceUpdateCallback(camFollow)
            }, 200)
        }
    }

    buildCameraParams = function() {

        let cConf = this.config.camera;
        let camParams = {}
        camParams.offsetPos = cConf['offset_pos'];
        camParams.offsetLookAt = cConf['offset_lookAt'];
        return camParams

    }

    applyScenarioConfig = function(config, isUpdate) {

        this.config = config;
        if (config['grid']) {
            this.encounterGrid.initEncounterGrid(config.grid);
        }
        PipelineAPI.setCategoryData('ACTIVE_SCENARIO', config)

        let pageReady = function(page) {

        }

        if (!isUpdate) GuiAPI.activatePage(null, pageReady);

        evt.dispatch(ENUMS.Event.ADVANCE_ENVIRONMENT,  {envId:config['environment'], time:50});

        let pieces = this.pieces;



        ScenarioUtils.resetScenarioCharacterPiece(GameAPI.getActivePlayerCharacter().gamePiece);

        if (this.encounterGrid.gridTiles.length) {
            let tPos = this.encounterGrid.getPlayerStartTile().obj3d.position;
            let sPos = this.encounterGrid.getPlayerEntranceTile().obj3d.position;
            if (config['player']) ScenarioUtils.positionPlayer(config['player'], tPos, sPos);
        } else {
            if (config['player']) ScenarioUtils.positionPlayer(config['player']);
        }


        let characters = this.characters;

        let walkCharToStart = function(charConf, character) {
            let charPiece = character.gamePiece;
            ScenarioUtils.resetScenarioCharacterPiece(charPiece);
            MATH.vec3FromArray(ThreeAPI.tempVec3, charConf.pos);
            charPiece.getSpatial().setPosVec3(ThreeAPI.tempVec3);
            MATH.randomVector(ThreeAPI.tempVec3b);
            ThreeAPI.tempVec3b.y = 0;
            ThreeAPI.tempVec3b.multiplyScalar(4);
            ThreeAPI.tempVec3b.add(ThreeAPI.tempVec3);
            let moveCB = function (movedCharPiece) {
                movedCharPiece.getSpatial().setRotXYZ(charConf.rot[0],charConf.rot[1], charConf.rot[2])
            }
            charPiece.getPieceMovement().setTargetPosition(ThreeAPI.tempVec3);
            let tPos = charPiece.getPieceMovement().getTargetPosition();
            charPiece.getPieceMovement().moveToTargetAtTime('walk',ThreeAPI.tempVec3b, tPos, 2, moveCB)
        }

        if (config['characters']) {
            for (let i = 0; i < config.characters.length; i++) {

                let char =  config.characters[i];
                let charCB = function(character) {
                    characters.push(character);
                    let gamePiece = character.gamePiece;
                    GameAPI.addPieceToWorld(gamePiece);
                    ScenarioUtils.resetScenarioCharacterPiece(gamePiece);
                    gamePiece.setStatusValue('isCharacter', 1)
                    setTimeout(function() {
                        walkCharToStart(char, character)
                    }, 10*(MATH.sillyRandom(i)+0.5))

                }

                GameAPI.composeCharacter(char['character'], charCB)
            }

        }

        if(config.spawn) {

            for (let i = 0; i < config.spawn.length; i++) {
                let spawn = config.spawn[i];
                let pieceInstanceCallback = function(gamePiece) {
                    gamePiece.setStatusValue('isItem', 1)
                    pieces.push(gamePiece);
                    gamePiece.getSpatial().setPosXYZ(spawn.pos[0],spawn.pos[1], spawn.pos[2])
                    gamePiece.getSpatial().setRotXYZ(spawn.rot[0],spawn.rot[1], spawn.rot[2])
                    GameAPI.addPieceToWorld(gamePiece);
                };

                GameAPI.createGamePiece(spawn, pieceInstanceCallback)
            }
        }
    };

    getEncounterGrid() {
        return this.encounterGrid;
    }

    exitScenario() {
        GameAPI.getActivePlayerCharacter().gamePiece.removePieceUpdateCallback(this.call.updateCamera)
        evt.dispatch(ENUMS.Event.MAIN_CHAR_SELECT_TARGET, {piece:null, value:false });
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
        this.encounterGrid.removeEncounterGrid();
    };

    tickScenario(tpf, scenarioTime) {

    }

}

export {EncounterDynamicScenario}