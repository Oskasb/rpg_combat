class CharacterIndicator {
    constructor() {

        this.indicators = [];

        let updateIndicator = function(tpf, time, gamePeice) {
            this.indicateCharacterPiece(tpf, time, gamePeice)
        }.bind(this)

        this.call = {
            updateIndicator:updateIndicator
        }
    }

    initCharacterIndicator(gamePiece) {

        let effectCb = function(efct) {
            this.indicators.push(efct);
            efct.activateEffectFromConfigId()
            ThreeAPI.tempObj.quaternion.set(0, 0, 0, 1);
            ThreeAPI.tempObj.lookAt(0, 1, 0);
            efct.setEffectQuaternion(ThreeAPI.tempObj.quaternion);
            gamePiece.getSpatial().getSpatialPosition(ThreeAPI.tempVec3);
            ThreeAPI.tempVec3.y+=0.1;
            efct.setEffectPosition(ThreeAPI.tempVec3)
            gamePiece.addPieceUpdateCallback(this.call.updateIndicator)
        }.bind(this);

        EffectAPI.buildEffectClassByConfigId('additive_stamps_6x6', 'effect_character_indicator',  effectCb)
    }

    indicateCharacterPiece(tpf, time, gamePiece) {

        for (let i = 0; i < this.indicators.length; i++) {
            let efct = this.indicators[i];
            ThreeAPI.tempObj.quaternion.set(0, 1, 0, 0);
            ThreeAPI.tempObj.lookAt(0, 1, 0.0);
            efct.setEffectQuaternion(ThreeAPI.tempObj.quaternion);
            gamePiece.getSpatial().getSpatialPosition(ThreeAPI.tempVec3);
            ThreeAPI.tempVec3.y+=0.05;
            efct.setEffectPosition(ThreeAPI.tempVec3)
        }

    }

    removeIndicatorFromPiece(gamePiece) {
        gamePiece.removePieceUpdateCallback(this.call.updateIndicator)
    }


}

export {CharacterIndicator}