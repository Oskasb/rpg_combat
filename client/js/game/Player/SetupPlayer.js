import {ConfigData} from "../../application/utils/ConfigData.js";

class SetupPlayer {
    constructor()
    {

        let _this = this;

        let charConfig = new ConfigData("GAME", "CHARACTERS").parseConfigData()['CHARACTER_FIGHTER'].data;

        let pieceId = charConfig['game_piece'];
        let equipSlotConfigId = charConfig['equip_slots'];


        let playerReady = function() {
            _this.initPlayerEquipment(equipSlotConfigId);
            _this.initPlayerStash();
            _this.initPlayerInventory()

            client.evt.dispatch(ENUMS.Event.REQUEST_SCENARIO, {
                id:"home_scenario",
                dynamic:"home_hovel_dynamic",
                "time":1,
                "pos": [2, 5, -8],
                "lookAt": [0, 3, 0]
            });

        };

        this.initPlayerPiece({piece:pieceId, pos: [0, 0, 0] }, equipSlotConfigId, playerReady);

    }

    initPlayerPiece(pieceConf, equipSlotConfigId, playerReady) {
        let charCb = function (gamePiece) {
        //    console.log("Player Piece: ", gamePiece);
            let mainChar = GameAPI.createGameCharacter('James')
            mainChar.setCharacterPiece(gamePiece, equipSlotConfigId);
            GameAPI.getPlayerMain().setPlayerCharacter(mainChar);
            GameAPI.setActivePlayerCharacter(mainChar);
            GameAPI.registerGameUpdateCallback(gamePiece.getOnUpdateCallback());
            playerReady();
        }.bind(this);
        GameAPI.createGamePiece(pieceConf, charCb)
    }

    initPlayerStash() {
        let itemCallback = function(gamePiece) {
            GameAPI.getPlayerMain().playerStash.findPositionInStash(gamePiece.getSpatial().getSpatialPosition());
            GameAPI.getPlayerMain().callbacks.addToStash(gamePiece);
        }.bind(this);


        GameAPI.createGamePiece({piece:"BELT_BRONZE"}, itemCallback);
        GameAPI.createGamePiece({piece:"HELMET_VIKING"}, itemCallback);
        GameAPI.createGamePiece({piece:"BELT_PLATE"}, itemCallback);
        GameAPI.createGamePiece({piece:"LEGS_CHAIN"}, itemCallback);
        GameAPI.createGamePiece({piece:"BOOTS_SCALE"}, itemCallback);
        GameAPI.createGamePiece({piece:"GLOVES_SCALE"}, itemCallback);
        GameAPI.createGamePiece({piece:"SHIRT_SCALE"}, itemCallback);
        GameAPI.createGamePiece({piece:"LEGS_SCALE"}, itemCallback);
        GameAPI.createGamePiece({piece:"LEGS_BRONZE"}, itemCallback);
        GameAPI.createGamePiece({piece:"BREASTPLATE_BRONZE"}, itemCallback);
        GameAPI.createGamePiece({piece:"SHIRT_CHAIN"}, itemCallback);
    }

    initPlayerInventory() {

    }

    initPlayerEquipment() {
        let equip = function(piece) {
            GameAPI.getActivePlayerCharacter().getEquipment().characterEquipItem(piece);
        };
        let itemCallback = function(gamePiece) {
            equip(gamePiece)
        };

        GameAPI.createGamePiece({piece:"HELMET_BRONZE"}, itemCallback);
        GameAPI.createGamePiece({piece:"NINJASWORD"}, itemCallback);
        GameAPI.createGamePiece({piece:"BELT_BRONZE"}, itemCallback);
        GameAPI.createGamePiece({piece:"LEGS_BRONZE"}, itemCallback);
    }


}

export { SetupPlayer }