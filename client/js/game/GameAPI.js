import { GamePiece } from "./gamepieces/GamePiece.js";

class GameAPI {
    constructor() {

    }

    createGamePiece(pieceConfig, callback) {
        return new GamePiece(pieceConfig, callback)
    }

};

export { GameAPI }