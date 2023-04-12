class TileIndicator {
    constructor(gridTile) {

        this.gridTile = gridTile;
        this.spin = 0;
        this.scale = 1;
        this.pulsate = 0;
        this.rate = 2;

        this.indicators = [];

        this.colorMap = {};
        this.colorMap['FREE']       = {r:0,   g:1,   b:0.4, a:0.5};
        this.colorMap['BLOCKED']       = {r:1,   g:0,   b:0,   a:0.8};

        let updateIndicator = function(tpf, time) {
            this.indicateTileStatus(tpf, time, this.spin, this.scale, this.pulsate, this.rate)
        }.bind(this)

        this.call = {
            updateIndicator:updateIndicator
        }
    }

    indicateGridTile(indicatorFx, tileX, tileY, spin, scale, pulsate, rate) {

        if (spin) this.spin = spin;
        if (scale) this.scale = scale;
        if (pulsate) this.pulsate = pulsate;
        if (rate) this.rate = rate;

        this.gamePiece = gamePiece;

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

            if (typeof (tileX) === 'number' && typeof(tileY) === 'number') {
                efct.setEffectSpriteXY(tileX, tileY);
            }

            gamePiece.addPieceUpdateCallback(this.call.updateIndicator)
        }.bind(this);

        EffectAPI.buildEffectClassByConfigId('additive_stamps_8x8', indicatorFx,  effectCb)
    }

    indicateTileStatus(tpf, time, gamePiece, spinSpeed, scale, pulsate, rate) {

        for (let i = 0; i < this.indicators.length; i++) {
            let efct = this.indicators[i];
            let status = this.gridTile.getTileStatus();
            efct.setEffectColorRGBA(this.colorMap[status]);
            let size = this.gridTile.size;
            if (scale) size*=scale;
            efct.scaleEffectSize(  size + pulsate*(Math.sin(time*rate)));
            gamePiece.getSpatial().getSpatialPosition(ThreeAPI.tempVec3);
            ThreeAPI.tempVec3.y+=0.05;
            efct.setEffectPosition(ThreeAPI.tempVec3)

            if (spinSpeed) {
                ThreeAPI.tempObj.lookAt(0, 1, 0);
                ThreeAPI.tempObj.rotateZ(time*spinSpeed);
                efct.setEffectQuaternion(ThreeAPI.tempObj.quaternion);
            }


        }

    }

    removeTargetIndicatorFromPiece() {
        if (this.gamePiece) {
            this.gamePiece.removePieceUpdateCallback(this.call.updateIndicator)
        }
        this.gamePiece = null;
    }

    hideIndicatorFx() {
        for (let i = 0; i < this.indicators.length; i++) {
            let efct = this.indicators[i];
            efct.scaleEffectSize(0);
        }
    }

    removeIndicatorFx() {
        this.hideIndicatorFx();
        while (this.indicators.length) {
            let efct = this.indicators.pop();
            efct.recoverEffectOfClass();
        }
    }

}

export {TileIndicator}