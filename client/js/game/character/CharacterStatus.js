class CharacterStatus {
    constructor() {

        let updateStatue= function(tpf, time) {
            this.updateCharacterStatus(tpf, time)
        }.bind(this)

        this.callbacks = {
            updateStatus:updateStatue
        }
    }
    inheritGamePieceStatus() {
        let status = this.gamePiece.pieceState.status;
        for (let key in status) {
            this[key] = status[key];
        }
    }
    updateCharacterStatus = function() {
        this.inheritGamePieceStatus()
    }
    activateCharacterStatus(gamePiece) {
        this.gamePiece = gamePiece;
        GameAPI.registerGameUpdateCallback(this.callbacks.updateStatus);
    }

    deactivateCharacterStatus() {
        GameAPI.unregisterGameUpdateCallback(this.callbacks.updateStatus);
    }

}

export { CharacterStatus }