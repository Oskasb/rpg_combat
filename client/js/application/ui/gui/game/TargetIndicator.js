import { Object3D } from "../../../../../libs/three/core/Object3D.js";
let tempObj = new Object3D()

class TargetIndicator {
    constructor() {

        this.spin = 0;
        this.scale = 1;
        this.pulsate = 0;
        this.rate = 2;

        this.indicators = [];



        this.colorMap = {};
        this.colorMap['GOOD']       = {r:0,   g:1,   b:0.4, a:0.5};
        this.colorMap['NEUTRAL']    = {r:1,   g:0.6, b:0.0, a:0.5};
        this.colorMap['EVIL']       = {r:1,   g:0,   b:0,   a:0.8};
        this.colorMap['ITEM']       = {r:0,   g:0.4, b:1,   a:0.8};

        let updateIndicator = function(tpf, time, gamePeice) {
            this.indicateSelectedTargetPiece(tpf, time, gamePeice, this.spin, this.scale, this.pulsate, this.rate)
        }.bind(this)

        this.call = {
            updateIndicator:updateIndicator
        }
    }

    indicateGamePiece(gamePiece, indicatorFx, tileX, tileY, spin, scale, pulsate, rate) {

        if (spin) this.spin = spin;
        if (scale) this.scale = scale;
        if (pulsate) this.pulsate = pulsate;
        if (rate) this.rate = rate;

        this.gamePiece = gamePiece;

        let effectCb = function(efct) {
            this.indicators.push(efct);
            efct.activateEffectFromConfigId()
            tempObj.quaternion.set(0, 0, 0, 1);
            tempObj.lookAt(0, 1, 0);
            efct.setEffectQuaternion(tempObj.quaternion);
            gamePiece.getSpatial().getSpatialPosition(ThreeAPI.tempVec3);
            ThreeAPI.tempVec3.y+=0.03;
            efct.setEffectPosition(ThreeAPI.tempVec3)
            tempObj.lookAt(0, 1, 0);
            efct.setEffectQuaternion(tempObj.quaternion);

            if (typeof (tileX) === 'number' && typeof(tileY) === 'number') {
                efct.setEffectSpriteXY(tileX, tileY);
            }

            gamePiece.addPieceUpdateCallback(this.call.updateIndicator)
        }.bind(this);

        EffectAPI.buildEffectClassByConfigId('additive_stamps_8x8', indicatorFx,  effectCb)
    }

    indicateSelectedTargetPiece(tpf, time, gamePiece, spinSpeed, scale, pulsate, rate) {
        for (let i = 0; i < this.indicators.length; i++) {
            let efct = this.indicators[i];
            let faction = gamePiece.getStatusByKey('faction') || 'ITEM'
            efct.setEffectColorRGBA(this.colorMap[faction]);
            let size = gamePiece.getStatusByKey('size') || 0.5;
            if (scale) size*=scale;
            efct.scaleEffectSize(  size + pulsate*(Math.sin(time*rate)));
            gamePiece.getSpatial().getSpatialPosition(ThreeAPI.tempVec3);
            ThreeAPI.tempVec3.y+=0.03;
            efct.setEffectPosition(ThreeAPI.tempVec3)

            if (spinSpeed) {
                tempObj.lookAt(0, 1, 0);
                tempObj.rotateZ(time*spinSpeed);
                efct.setEffectQuaternion(tempObj.quaternion);
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

export {TargetIndicator}