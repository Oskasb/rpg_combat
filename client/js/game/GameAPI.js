import { CharacterComposer } from "./Player/CharacterComposer.js";
import { GameCharacter } from "./character/GameCharacter.js";
import { GamePiece } from "./gamepieces/GamePiece.js";
import { GameMain } from "./GameMain.js";
import { GameWorldPointer } from "../application/ui/input/GameWorldPointer.js";

class GameAPI {
    constructor() {
        this.acticePlayerCharacter = null;
        this.characterComposer = new CharacterComposer();
        this.gameWorldPointer = new GameWorldPointer();
    }

    initGameMain() {
        this.gameMain = new GameMain();
        this.gameMain.initGameMain();
    }

    getPlayerMain() {
        return this.gameMain.playerMain;
    }

    createGameCharacter(config) {
        return new GameCharacter(config);
    };



    composeCharacter(gameCharConfigId, callback) {
        this.characterComposer.composeCharacter(gameCharConfigId, callback)
    }
    createGamePiece(pieceConfig, callback) {
        return new GamePiece(pieceConfig, callback)
    }

    addItemToPlayerInventory(itemPiece, transitionTime) {
        this.acticePlayerCharacter.pickupItem(itemPiece, transitionTime)
    }

    addPieceToWorld(piece) {
        this.gameMain.gameWorld.gameWorldRegisterPiece(piece)
    }

    takePieceFromWorld(piece) {
        return this.gameMain.gameWorld.gameWorldReleasePiece(piece)
    }

    getGameTime = function() {
        return this.gameMain.gameTime;
    }

    setActivePlayerCharacter(character) {
        this.acticePlayerCharacter = character;
    }

    getActivePlayerCharacter() {
        return this.acticePlayerCharacter;
    }

    getActiveDynamicScenario() {
        let activeScenario = this.gameMain.activeScenario;
        let loadedScenarios = activeScenario.dynamicScenario
        if (loadedScenarios) {
            if (loadedScenarios.loadedDynamicScenarios.length) {
                return loadedScenarios.loadedDynamicScenarios[0];
            }
        }
    }
    getActiveScenarioCharacters() {
        let activeScen = this.getActiveDynamicScenario()
        if (activeScen)
        return activeScen.characters;
    };

    handleWorldSpacePointerUpdate(pointer, start, release) {

        if (start) {
            this.gameWorldPointer.registerNewWorldPointer(pointer);
        } else if (release) {
            this.gameWorldPointer.worldPointerReleased(pointer);
        } else {
            this.gameWorldPointer.updateWorldPointer(pointer);
        }

    }

    registerGameUpdateCallback(callback) {
        this.gameMain.addGameUpdateCallback(callback);
    }

    unregisterGameUpdateCallback(callback) {
        return this.gameMain.removeGameUpdateCallback(callback);
    }

}

export { GameAPI }