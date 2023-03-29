import { ConfigData } from "../../application/utils/ConfigData.js";

class CharacterEquipment {
    constructor(equipSlotConfigId) {
        console.log(equipSlotConfigId)
        this.slots = new ConfigData("GAME", "EQUIP_SLOTS").parseConfigData()[equipSlotConfigId].data;

        console.log(this.config, equipSlotConfigId);

        this.pieces = [];
    }

    characterEquipItem(gamePiece, slotId) {
        this.pieces.push(gamePiece)
        GameAPI.getActivePlayerCharacter().getCharacterPiece().attachPieceSpatialToJoint(gamePiece.getSpatial(), slotId);
        GameAPI.registerGameUpdateCallback(gamePiece.getOnUpdateCallback());
    };

    takeEquippedItem(gamePiece) {
        let piece = MATH.quickSplice(gamePiece, this.pieces);
        GameAPI.unregisterGameUpdateCallback(piece.getOnUpdateCallback());
    }

}

export { CharacterEquipment }