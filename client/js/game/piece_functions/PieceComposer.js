import { ConfigData } from "../../application/utils/ConfigData.js";

class PieceComposer {
    constructor(gamePiece, configName, callback) {
        this.composeGamePiece(gamePiece, configName, callback)
    }

    composeGamePiece(gamePiece, configName, callback) {

        let pieceData = new ConfigData("GAME", "PIECES")
        pieceData.fetchData(configName); // .f

        let rigData = new ConfigData("GAME", "SKELETON_RIGS")
        rigData.fetchData(pieceData.data['skeleton_rig']);

        console.log(pieceData.data, rigData.data);

        let assetId = pieceData.data["model_asset"];


        let modelInstanceCB = function(assetInstance) {
            console.log(assetInstance);
            gamePiece.setModelInstance(assetInstance);



            if (assetInstance.originalModel.animMap) {
                let scaleVec = ThreeAPI.tempVec3;
                scaleVec.set(1, 1, 1);
                gamePiece.pieceAnimator.setupAnimations(assetInstance.originalModel, scaleVec);
                gamePiece.animStateMap = gamePiece.pieceAnimator.initPieceAnimator(gamePiece, rigData.data);
                gamePiece.pieceAnimator.activatePieceAnimation('IDLE', 1, 1, 1)
                gamePiece.pieceAttachments = gamePiece.pieceAttacher.initPieceAttacher(gamePiece, rigData.data);
            }

            callback(gamePiece);
        };

        let assetLoaded = function(asset) {
            client.dynamicMain.requestAssetInstance(asset.id, modelInstanceCB)
        };

        client.dynamicMain.requestAsset(assetId, assetLoaded)


    }


}

export { PieceComposer }