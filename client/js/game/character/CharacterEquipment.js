import { ConfigData } from "../../application/utils/ConfigData.js";

class CharacterEquipment {
    constructor(modelInstance, equipSlotConfigId) {

        this.slots = new ConfigData("GAME", "EQUIP_SLOTS").parseConfigData()[equipSlotConfigId].data.slots;
        this.model = modelInstance;

        this.pieces = [];
    }

    getJointIdForItemPiece(gamePiece) {
        let slotId = gamePiece.getEquipSlotId();
        return MATH.getFromArrayByKeyValue(this.slots, 'slot_id', slotId).slot;
    }

    characterEquipItem(gamePiece) {
        this.pieces.push(gamePiece)

        let joint = this.getItemByItemId(gamePiece)

        if (joint === 'SKIN') {

            this.model.attachInstancedModel(gamePiece.modelInstance)

        } else {
            GameAPI.getActivePlayerCharacter().getCharacterPiece().attachPieceSpatialToJoint(gamePiece.getSpatial(), joint);
            GameAPI.registerGameUpdateCallback(gamePiece.getOnUpdateCallback());
        }

    };

    getItemByItemId(itemId) {
        if (!this.pieces.length) return;
        if (itemId === 'random') {
            return this.pieces[Math.floor(Math.random()*this.pieces.length)]
        } else {
            console.log("Figure this out...")
        }

    }

    takeEquippedItem(gamePiece) {
        if (typeof (gamePiece) === 'string') {
            gamePiece = this.getItemByItemId(gamePiece);
        }
        if(gamePiece) {
        //    gamePiece.showGamePiece();
            let piece = MATH.quickSplice(this.pieces ,gamePiece );
            GameAPI.unregisterGameUpdateCallback(piece.getOnUpdateCallback());
        }
        return gamePiece
    }

}

export { CharacterEquipment }