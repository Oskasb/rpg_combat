import { GamePiece } from "./gamepieces/GamePiece.js";
import { GameMain} from "./GameMain.js";

class GameAPI {
    constructor() {

    }

    initGameMain() {
        this.gameMain = new GameMain();
        this.gameMain.initGameMain();
        evt.on(ENUMS.Event.FRAME_READY, this.gameMain.callbacks.updateGameFrame)
    }

    createGamePiece(pieceConfig, callback) {
        return new GamePiece(pieceConfig, callback)
    }

}

export { GameAPI }