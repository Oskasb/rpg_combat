import { PlayerStash } from "./PlayerStash.js";

class PlayerMain {
    constructor() {
        this.tempVec = new THREE.Vector3();
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

        let stashInvItem = function(event) {
            let item = this.playerCharacter.getInventory().takeItemFromInventory(event.item_id);
            if (!item) {
                console.log("No item gotten from inventory..")
                return;
            }
            this.stashItemPiece(item, event.time)
        }.bind(this);



        let addToStash = function(piece) {
            this.playerStash.addPieceToStash(piece);
        }.bind(this);

        let callbacks = {
            handleEquip : function (event) {        },
            handleUnequip : function (event) {        },
            handleDropItem : function (event) {        },
            handleStashItem : stashInvItem,
            handleTakeStashItem : takeStashItem,
            handleTakeWorldItem : function (event) {        },
            addToStash:addToStash

        }

        this.callbacks = callbacks;

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

    stashItemPiece(piece, time) {
        let playerPiece = this.getPlayerCharacter().gamePiece;
        this.playerStash.findPositionInStash(this.tempVec);

        piece.getPieceMovement().moveToTargetAtTime('stash', playerPiece.getSpatial().getSpatialPosition(), this.tempVec, time, this.callbacks.addToStash);
    }

    takeStashedPiece(piece) {
        return this.playerStash.takePieceFromStash(piece);
    }
}

export { PlayerMain }