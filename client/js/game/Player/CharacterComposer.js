import {ConfigData} from "../../application/utils/ConfigData.js";

class CharacterComposer {
    constructor() {}

    composeCharacter(gameCharId, callback) {
        let _this = this;

        let charConfig = new ConfigData("GAME", "CHARACTERS").parseConfigData()[gameCharId].data;

        let actorId = charConfig['actor'];
        let equippedItems = charConfig['equipment'];


        let actorConfig = new ConfigData("GAME", "ACTORS").parseConfigData()[actorId].data;

        let pieceId = actorConfig['game_piece'];
        let name = charConfig['name'];
        let faction = charConfig['faction'];
        let equipSlotConfigId = actorConfig['equip_slots'];

        let playerReady = function(char) {
            _this.initCharacterEquipment(char, equippedItems);
            _this.initCharacterInventory()
            callback(char)

        };

        this.initCharacterPiece({piece:pieceId, name:name, faction:faction}, equipSlotConfigId, playerReady);
    }

    initCharacterPiece(pieceConf, equipSlotConfigId, charReady) {
        let charCb = function (gamePiece) {
        //    console.log("Player Piece: ", gamePiece);
            let char = GameAPI.createGameCharacter(pieceConf);
            char.setCharacterPiece(gamePiece, equipSlotConfigId);
            GameAPI.registerGameUpdateCallback(gamePiece.getOnUpdateCallback());

            charReady(char);
        }.bind(this);
        GameAPI.createGamePiece(pieceConf, charCb)
    }

    initCharacterInventory() {

    }

    initCharacterEquipment(char, equippedItems) {
        let equip = function(piece) {
            char.getEquipment().characterEquipItem(piece);
        };
        let itemCallback = function(gamePiece) {
            equip(gamePiece)
        };

        for (let i = 0; i < equippedItems.length; i++) {
            GameAPI.createGamePiece({piece:equippedItems[i]}, itemCallback);
        }

    }


}

export { CharacterComposer }