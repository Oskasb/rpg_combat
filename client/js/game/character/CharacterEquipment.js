import { ConfigData } from "../../application/utils/ConfigData.js";

class CharacterEquipment {
    constructor(modelInstance, equipSlotConfigId) {

        this.slots = new ConfigData("GAME", "EQUIP_SLOTS").parseConfigData()[equipSlotConfigId].data.slots;
        this.model = modelInstance;

        this.pieces = [];
    }

    characterEquipItem(gamePiece) {
        this.pieces.push(gamePiece)

        let slotId = gamePiece.getEquipSlotId();

        let slot = MATH.getFromArrayByKeyValue(this.slots, 'slot_id', slotId);

        if (slot.joint === 'SKIN') {

            this.model.attachInstancedModel(gamePiece.modelInstance)

        } else {
            GameAPI.getActivePlayerCharacter().getCharacterPiece().attachPieceSpatialToJoint(gamePiece.getSpatial(), slot.joint);
            GameAPI.registerGameUpdateCallback(gamePiece.getOnUpdateCallback());
        }

    };

    takeEquippedItem(gamePiece) {
        let piece = MATH.quickSplice(this.pieces ,gamePiece );
        GameAPI.unregisterGameUpdateCallback(piece.getOnUpdateCallback());
    }

}

export { CharacterEquipment }