import { GamePiece } from "./gamepieces/GamePiece.js";
import { GameMain} from "./GameMain.js";

class GameAPI {
    constructor() {
        this.acticePlayerCharacter = null;
    }

    initGameMain() {
        this.gameMain = new GameMain();
        this.gameMain.initGameMain();
    }

    createGamePiece(pieceConfig, callback) {
        return new GamePiece(pieceConfig, callback)
    }

    setActivePlayerCharacter(gamePiece) {
        this.acticePlayerCharacter = gamePiece;
    }

    getActivePlayerCharacter() {
        return this.acticePlayerCharacter;
    }

}

export { GameAPI }