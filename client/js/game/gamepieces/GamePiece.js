
class GamePiece {
    constructor(config, callback) {
        this.config = config;

        let instanceCb = function(assetInstance) {
            this.instance = assetInstance;
            callback(this)
        }.bind(this);

        client.dynamicMain.requestAssetInstance(config.assetId, instanceCb)
    }

    getPieceSpatial() {
        return this.instance.getSpatial();
    }

    tickGamePiece(tpf, scenarioTime) {

        let spatial = this.getPieceSpatial();
        let tempVec = ThreeAPI.tempVec3;
        tempVec.copy(spatial.getSpatialPosition());
        tempVec.x += Math.sin(scenarioTime*0.7)*0.01;
        tempVec.y = 2;
        tempVec.z += Math.cos(scenarioTime*0.7)*0.01;

        spatial.setPosXYZ(
            tempVec.x,
            tempVec.y,
            tempVec.z
        )
    }


}

export { GamePiece }