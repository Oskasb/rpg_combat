import { PlayerStash } from "./PlayerStash.js";

class PlayerMain {
    constructor() {
        this.playerStash = new PlayerStash();
        this.playerCharacter = null;

        let takeStashItem = function (event) {
            console.log("Take")
            let item = this.playerStash.takePieceFromStash(event.item_id);
            if (!item) {
                console.log("No item gotten from stash..")
                return;
            }
            GameAPI.addItemToPlayerInventory(item, event.time);

        }.bind(this);

        let callbacks = {
        handleEquip : function (event) {        },
        handleUnequip : function (event) {        },
        handleDropItem : function (event) {        },
        handleStashItem : function (event) {        },
        handleTakeStashItem : takeStashItem,
        handleTakeWorldItem : function (event) {        },

    }

        evt.on(ENUMS.Event.EQUIP_ITEM, callbacks.handleEquip);
        evt.on(ENUMS.Event.UNEQUIP_ITEM, callbacks.handleUnequip);
        evt.on(ENUMS.Event.DROP_ITEM, callbacks.handleDropItem);
        evt.on(ENUMS.Event.STASH_ITEM, callbacks.handleStashItem);
        evt.on(ENUMS.Event.TAKE_STASH_ITEM, callbacks.handleTakeStashItem);
        evt.on(ENUMS.Event.TAKE_WORLD_ITEM, callbacks.handleTakeWorldItem)
    }


    setPlayerCharacter(character) {
        this.playerCharacter = character;
    }

    getPlayerCharacter() {
        return this.playerCharacter;
    }

    stashItemPiece(piece) {
        this.playerStash.addPieceToStash(piece);
    }
    takeStashedPiece(piece) {
        return this.playerStash.takePieceFromStash(piece);
    }
}

export { PlayerMain }