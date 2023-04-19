import { CharacterComposer } from "./Player/CharacterComposer.js";
import { GameCharacter } from "./character/GameCharacter.js";
import { GamePiece } from "./gamepieces/GamePiece.js";
import { GameMain } from "./GameMain.js";
import { GameWorldPointer } from "../application/ui/input/GameWorldPointer.js";

class GameAPI {
    constructor() {
        this.activePlayerCharacter = null;
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

    getGameCamera() {
        return this.gameMain.gameCamera;
    }

    composeCharacter(gameCharConfigId, callback) {
        this.characterComposer.composeCharacter(gameCharConfigId, callback)
    }
    createGamePiece(pieceConfig, callback) {
        return new GamePiece(pieceConfig, callback)
    }

    addItemToPlayerInventory(itemPiece, transitionTime) {
        this.activePlayerCharacter.pickupItem(itemPiece, transitionTime)
    }

    getWorldItemPieces() {
        return this.gameMain.gameWorld.itemPieces
    }

    addPieceToWorld(piece) {
        this.gameMain.gameWorld.gameWorldRegisterPiece(piece)
    }

    takePieceFromWorld(piece) {
        return this.gameMain.gameWorld.gameWorldReleasePiece(piece)
    }

    inactivateWorldPiece(piece) {
        this.gameMain.gameWorld.gameWorldInactivatePiece(piece)
    }

    getGameTime = function() {
        let time = this.gameMain.gameTime;
        if (typeof (time) === 'undefined') {
            console.log("Time is bad, investigate")
        }
        return time;
    }

    getTurnStatus() {
        return this.gameMain.turnStatus;
    }

    setActivePlayerCharacter(character) {
        this.activePlayerCharacter = character;
    }

    getActivePlayerCharacter() {
        return this.activePlayerCharacter;
    }

    pieceIsMainChar(gamePiece) {
        return gamePiece === this.getMainCharPiece()
    }

    getMainCharPiece = function() {
        return this.activePlayerCharacter.gamePiece
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

    getActiveEncounterGrid() {
        if (this.getActiveDynamicScenario()) {
            return this.getActiveDynamicScenario().encounterGrid;
        }
    }
    handleWorldSpacePointerUpdate(pointer, start, release) {

        if (release) {
            this.gameWorldPointer.worldPointerReleased(pointer);
        } else {
            this.gameWorldPointer.updateWorldPointer(pointer, start);
        }

    }

    deactivateWorldSpacePointer(pointer) {
        this.gameWorldPointer.worldPointerDeactivate(pointer);
    }

    registerGameUpdateCallback(callback) {
        this.gameMain.addGameUpdateCallback(callback);
    }

    unregisterGameUpdateCallback(callback) {
        return this.gameMain.removeGameUpdateCallback(callback);
    }

    registerGameTurnCallback(callback) {
        this.gameMain.addGameTurnCallback(callback);
    }

    unregisterGameTurnCallback(callback) {
        return this.gameMain.removeGameTurnCallback(callback);
    }
}

export { GameAPI }