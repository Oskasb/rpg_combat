class TargetIndicator {
    constructor() {

        this.indicators = [];

        this.colorMap = {};
        this.colorMap['GOOD']       = {r:0,   g:1,   b:0.4, a:0.5};
        this.colorMap['NEUTRAL']    = {r:1,   g:0.6, b:0.0, a:0.5};
        this.colorMap['EVIL']       = {r:1,   g:0,   b:0,   a:0.8};
        this.colorMap['ITEM']       = {r:0,   g:0.4, b:1,   a:0.8};

        let updateIndicator = function(tpf, time, gamePeice) {
            this.indicateSelectedTargetPiece(tpf, time, gamePeice)
        }.bind(this)

        this.call = {
            updateIndicator:updateIndicator
        }
    }

    indicateTargetSeleected(gamePiece, indicatorFx) {

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

        EffectAPI.buildEffectClassByConfigId('additive_stamps_6x6', indicatorFx,  effectCb)
    }

    indicateSelectedTargetPiece(tpf, time, gamePiece) {

        for (let i = 0; i < this.indicators.length; i++) {
            let efct = this.indicators[i];
            let faction = gamePiece.getStatusByKey('faction') || 'ITEM'
            efct.setEffectColorRGBA(this.colorMap[faction]);
            let size = gamePiece.getStatusByKey('size') || 0.5;
            efct.scaleEffectSize(  size+ Math.sin(time*2) * 0.05 - 0.05);
            gamePiece.getSpatial().getSpatialPosition(ThreeAPI.tempVec3);
            ThreeAPI.tempVec3.y+=0.05;
            efct.setEffectPosition(ThreeAPI.tempVec3)

        }

    }

    removeTargetIndicatorFromPiece(gamePiece) {
        gamePiece.removePieceUpdateCallback(this.call.updateIndicator)
    }

    hideIndicatorFx = function() {
        for (let i = 0; i < this.indicators.length; i++) {
            let efct = this.indicators[i];
            efct.scaleEffectSize(0);
        }
    }

    removeIndicatorFx = function() {
        while (this.indicators.length) {
            let efct = this.indicators.pop();
            efct.recoverEffectOfClass();
        }
    }

}

export {TargetIndicator}