import { ConfigData } from "../../application/utils/ConfigData.js";

class PieceComposer {
    constructor(gamePiece, config, callback) {
        this.composeGamePiece(gamePiece, config, callback)
    }

    composeGamePiece(gamePiece, config, callback) {



        let pieceData = new ConfigData("GAME", "PIECES")
        pieceData.fetchData(config.piece); // .f
        let assetId = pieceData.data["model_asset"];

        if (pieceData.data['slot']) {
            gamePiece.setEquipSlotId(pieceData.data['slot'])
        }

        let skeletonData = new ConfigData("GAME", "SKELETON_RIGS");

        let skellRig = pieceData.data['skeleton_rig']
        if (skellRig) {
            skeletonData.fetchData(skellRig);
            let rigData = new ConfigData("ASSETS", "RIGS");
            rigData.fetchData(rigData.data['rig_fighter']);
            gamePiece.rigData = rigData.data;
            console.log("Rig Piece:", assetId, pieceData.data, skeletonData.data);
        } else {
            console.log("not rigged piece:", assetId, config)
        }

        let modelInstanceCB = function(assetInstance) {
            console.log(assetInstance);
            gamePiece.setModelInstance(assetInstance);

            if (config.pos) {
                gamePiece.getSpatial().setPosXYZ(
                    config.pos[0],
                    config.pos[1],
                    config.pos[2]
                )
            }

            if (config.rot) {
                gamePiece.getSpatial().rotateXYZ(
                    config.rot[0],
                    config.rot[1],
                    config.rot[2]
                )
            }

            if (assetInstance.originalModel.animMap) {
                let scaleVec = ThreeAPI.tempVec3;
                scaleVec.set(1, 1, 1);
                gamePiece.pieceAnimator.setupAnimations(assetInstance.originalModel, scaleVec);
                gamePiece.animStateMap = gamePiece.pieceAnimator.initPieceAnimator(gamePiece, skeletonData.data);
                gamePiece.pieceAnimator.activatePieceAnimation('IDLE', 1, 1, 1)
                gamePiece.pieceAttachments = gamePiece.pieceAttacher.initPieceAttacher(gamePiece, skeletonData.data);
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