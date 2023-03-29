import { PlayerStash } from "./PlayerStash.js";

class PlayerMain {
    constructor() {
        this.playerStash = new PlayerStash();
        this.playerCharacter = null;
    }

    setPlayerCharacter(character) {
        this.playerCharacter = character;
    }

    getPlayerCharacter() {
        return this.playerCharacter;
    }

    stashItemPiece(piece) {
        this.playerStash.stashItemPiece(piece);
    }

    takeStashedPiece(piece) {
        return this.playerStash.takePieceFromStash(piece);
    }

}

export { PlayerMain }