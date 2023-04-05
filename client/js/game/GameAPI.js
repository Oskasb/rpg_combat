import { CharacterComposer } from "./Player/CharacterComposer.js";
import { GameCharacter } from "./character/GameCharacter.js";
import { GamePiece } from "./gamepieces/GamePiece.js";
import { GameMain} from "./GameMain.js";

class GameAPI {
    constructor() {
        this.acticePlayerCharacter = null;
        this.characterComposer = new CharacterComposer();
    }

    initGameMain() {
        this.gameMain = new GameMain();
        this.gameMain.initGameMain();
    }

    getPlayerMain() {
        return this.gameMain.playerMain;
    }

    createGameCharacter(name) {
        return new GameCharacter(name);
    };

    composeCharacter(gameCharConfigId, callback) {
        this.characterComposer.composeCharacter(gameCharConfigId, callback)
    }
    createGamePiece(pieceConfig, callback) {
        return new GamePiece(pieceConfig, callback)
    }

    removeGamePiece(piece) {
        piece.disbandGamePiece();
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

    registerGameUpdateCallback(callback) {
        this.gameMain.addGameUpdateCallback(callback);
    }

    unregisterGameUpdateCallback(callback) {
        return this.gameMain.removeGameUpdateCallback(callback);
    }

}

export { GameAPI }