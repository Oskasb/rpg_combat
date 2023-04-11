import * as ScenarioUtils from "../gameworld/ScenarioUtils.js";
import {ConfigData} from "../../application/utils/ConfigData.js";

class EncounterDynamicScenario {
    constructor(dataId) {
        this.dataId = dataId;
        this.pieces = GameAPI.getWorldItemPieces();
        this.characters = [];
        this.onUpdateCallbacks = []
        this.configData =  new ConfigData("DYNAMIC_SCENARIOS", "GAME_SCENARIOS",  'dynamic_view_init', 'data_key', 'config')
        this.isActive = false;

        this.camParams = {
            time:2,
            pos:[0, 0, 0],
            lookAt:[0, 0, 0],
            offsetPos:[0, 5, -5],
            offsetLookAt:[0, 2, 3]
        }

        let camParams = this.camParams;
        let camCallback = function() {

        }.bind(this);
        camParams.callback = camCallback;

        this.camFollow = function() {
            let playerPos = GameAPI.getActivePlayerCharacter().gamePiece.getPos()
            camParams.pos[0] = playerPos.x + camParams.offsetPos[0];
            camParams.pos[1] = playerPos.y + camParams.offsetPos[1];
            camParams.pos[2] = playerPos.z + camParams.offsetPos[2];
            camParams.lookAt[0] = playerPos.x + camParams.offsetLookAt[0];
            camParams.lookAt[1] = playerPos.y + camParams.offsetLookAt[1];
            camParams.lookAt[2] = playerPos.z + camParams.offsetLookAt[2];
            camParams.time = 0.05;

            evt.dispatch(ENUMS.Event.SET_CAMERA_TARGET, camParams);

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
        this.page = GuiAPI.activatePage(this.config['gui_page']);

        if (this.config['camera']) {
            console.log("Set Camera mode: ", this.config.camera)
            let cConf = this.config.camera;
            this.camParams.offsetPos = cConf['offset_pos'] || this.camParams.offsetPos;
            this.camParams.offsetLookAt = cConf['offset_lookAt'] || this.camParams.offsetLookAt;
            let camFollow = this.camFollow;
            setTimeout(function() {
                GameAPI.getActivePlayerCharacter().gamePiece.addPieceUpdateCallback(camFollow)
            }, 200)
        }
    }


    applyScenarioConfig = function(config, isUpdate) {

        this.config = config;

        if (!isUpdate) GuiAPI.activatePage(null);

        evt.dispatch(ENUMS.Event.ADVANCE_ENVIRONMENT,  {envId:config['environment'], time:50});

        let pieces = this.pieces;





        ScenarioUtils.resetScenarioCharacterPiece(GameAPI.getActivePlayerCharacter().gamePiece);

        if (config['player']) ScenarioUtils.positionPlayer(config['player']);

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
                    GameAPI.registerGameUpdateCallback(gamePiece.getOnUpdateCallback());
                };

                GameAPI.createGamePiece(spawn, pieceInstanceCallback)
            }
        }
    };

    exitScenario() {
        GameAPI.getActivePlayerCharacter().gamePiece.removePieceUpdateCallback(this.camFollow)
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
    };

    tickScenario(tpf, scenarioTime) {

    }

}

export {EncounterDynamicScenario}