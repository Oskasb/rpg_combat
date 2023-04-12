class TileIndicator {
    constructor(gridTile) {

        this.gridTile = gridTile;
        this.spin = 0;
        this.scale = 1;
        this.pulsate = 0;
        this.rate = 2;



        this.indicators = [];

        this.colorMap = {};
        this.colorMap['FREE']       = {r:-0.6,   g:-0.3,   b:0.99, a:0.9};
        this.colorMap['BLOCKED']       = {r:1,   g:-0.3,   b:-0.3,   a:0.8};

        let updateIndicator = function(tpf, time) {
            this.indicateTileStatus(tpf, time, this.spin, this.scale, this.pulsate, this.rate)
        }.bind(this)

        this.call = {
            updateIndicator:updateIndicator
        }

    }

    activateTileIndicator() {
        let indicatorFx = 'effect_character_indicator';

        let spriteX = 5;
           let spriteY = 0;
            let spin = 0;
            let scale = 1.7;
            let pulsate = 0.03;
            let rate = 3;

        if (spin) this.spin = spin;
        if (scale) this.scale = scale;
        if (pulsate) this.pulsate = pulsate;
        if (rate) this.rate = rate;

        let effectCb = function(efct) {
            this.indicators.push(efct);
            efct.activateEffectFromConfigId()
            ThreeAPI.tempObj.quaternion.set(0, 0, 0, 1);
       //     ThreeAPI.tempObj.lookAt(0, 1, 0);
       //     efct.setEffectQuaternion(this.gridTile.obj3d.quaternion);
            ThreeAPI.tempVec3.copy(this.gridTile.obj3d.position)
            ThreeAPI.tempVec3.y+=1;
            efct.setEffectPosition(ThreeAPI.tempVec3)
            ThreeAPI.tempObj.lookAt(0, 1, 0);
            efct.setEffectQuaternion(ThreeAPI.tempObj.quaternion);

            if (typeof (spriteX) === 'number' && typeof(spriteY) === 'number') {
                efct.setEffectSpriteXY(spriteX, spriteY);
            }

            GameAPI.registerGameUpdateCallback(this.call.updateIndicator)
        }.bind(this);

        EffectAPI.buildEffectClassByConfigId('additive_stamps_8x8', indicatorFx,  effectCb)
    }

    indicateTileStatus(tpf, time, spinSpeed, scale, pulsate, rate) {

        for (let i = 0; i < this.indicators.length; i++) {
            let efct = this.indicators[i];
            let status = this.gridTile.getTileStatus();
            efct.setEffectColorRGBA(this.colorMap[status]);
            let size = this.gridTile.size;
            if (scale) size*=scale;
            efct.scaleEffectSize(  size + pulsate*(Math.sin(time*rate)));
            ThreeAPI.tempVec3.copy(this.gridTile.obj3d.position);
            ThreeAPI.tempVec3.y+=0.001 // + this.gridTile.thickness;
            efct.setEffectPosition(ThreeAPI.tempVec3)

            if (spinSpeed) {
                ThreeAPI.tempObj.lookAt(0, 1, 0);
                ThreeAPI.tempObj.rotateZ(time*spinSpeed);
                efct.setEffectQuaternion(ThreeAPI.tempObj.quaternion);
            }
        }
    }

    removeTileIndicator() {
        GameAPI.unregisterGameUpdateCallback(this.call.updateIndicator)
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