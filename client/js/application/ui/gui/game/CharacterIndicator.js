class CharacterIndicator {
    constructor() {

        this.indicators = [];

        this.colorMap = {};
        this.colorMap['GOOD']       = {r:0,   g:1,   b:0.4, a:0.5};
        this.colorMap['NEUTRAL']    = {r:1,   g:0.6, b:0.0, a:0.5};
        this.colorMap['EVIL']       = {r:1,   g:0,   b:0,   a:0.8};

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
            ThreeAPI.tempObj.lookAt(0, 1, 0);
            efct.setEffectQuaternion(ThreeAPI.tempObj.quaternion);

            gamePiece.addPieceUpdateCallback(this.call.updateIndicator)
        }.bind(this);

        EffectAPI.buildEffectClassByConfigId('additive_stamps_6x6', 'effect_character_indicator',  effectCb)
    }

    indicateCharacterPiece(tpf, time, gamePiece) {

        for (let i = 0; i < this.indicators.length; i++) {
            let efct = this.indicators[i];
            efct.setEffectColorRGBA(this.colorMap[gamePiece.getStatusByKey('faction')]);
            efct.scaleEffectSize( gamePiece.getStatusByKey('size'));
            gamePiece.getSpatial().getSpatialPosition(ThreeAPI.tempVec3);
            ThreeAPI.tempVec3.y+=0.05;
            efct.setEffectPosition(ThreeAPI.tempVec3)

        }

    }

    removeIndicatorFromPiece(gamePiece) {
        gamePiece.removePieceUpdateCallback(this.call.updateIndicator)
        while (this.indicators.length) {
            let efct = this.indicators.pop();
            efct.recoverEffectOfClass();
        }
    }


}

export {CharacterIndicator}