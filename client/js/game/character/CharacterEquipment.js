import { ConfigData } from "../../application/utils/ConfigData.js";

class CharacterEquipment {
    constructor(gamePiece, equipSlotConfigId) {
        this.gamePiece = gamePiece;
        this.slots = new ConfigData("GAME", "EQUIP_SLOTS").parseConfigData()[equipSlotConfigId].data.slots;
        this.pieces = [];
    }

    getJointIdForItemPiece(gamePiece) {

    }

    characterEquipItem(gamePiece) {
        this.pieces.push(gamePiece)

        let slotId = gamePiece.getEquipSlotId();

        let slot = MATH.getFromArrayByKeyValue(this.slots, 'slot_id', slotId);

        if (slot.joint === 'SKIN') {

            this.model.attachInstancedModel(gamePiece.modelInstance)

        } else {
            this.gamePiece.attachPieceSpatialToJoint(gamePiece.getSpatial(), slot.joint);
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
        gamePiece = MATH.quickSplice(this.pieces ,gamePiece );

        if(gamePiece) {
        //    gamePiece.hideGamePiece();
            let slotId = gamePiece.getEquipSlotId();

            let slot = MATH.getFromArrayByKeyValue(this.slots, 'slot_id', slotId);

            if (slot.joint === 'SKIN') {
                this.gamePiece.modelInstance.detatchInstancedModel(gamePiece.modelInstance)
                gamePiece.hideGamePiece();
            } else {
                let attachment = this.gamePiece.releaseJointActiveAttachment(slot.joint, gamePiece.getSpatial);
                console.log(attachment);
                gamePiece.hideGamePiece();
            //    GameAPI.unregisterGameUpdateCallback(piece.getOnUpdateCallback());
            }


        }
        return gamePiece
    }

}

export { CharacterEquipment }