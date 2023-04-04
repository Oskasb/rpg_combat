import { PlayerStash } from "./PlayerStash.js";

class PlayerMain {
    constructor() {
        this.tempVec = new THREE.Vector3();
        this.playerStash = new PlayerStash();
        this.playerCharacter = null;

        let takeStashItem = function (event) {
            let item = this.playerStash.takePieceFromStash(event.item);
            if (!item) {
                console.log("No item gotten from stash..")
                return;
            }
            GameAPI.addItemToPlayerInventory(item, event.time);

        }.bind(this);

        let stashInvItem = function(event) {
            let item = this.playerCharacter.getInventory().takeItemFromInventory(event.item);
            if (!item) {
        //        console.log("No item gotten from inventory..")
                return;
            }
            this.stashItemPiece(item, event.time)
        }.bind(this);

        let equipItem = function (event) {
            let item = this.playerCharacter.getInventory().takeItemFromInventory(event.item);
            if (!item) {
       //         console.log("No item gotten from stash..")
                return;
            }
            this.playerCharacter.getEquipment().characterEquipItem(item)
        }.bind(this);

        let unequipItem = function(event) {
            let item = this.playerCharacter.getEquipment().takeEquippedItem(event.item);
            if (!item) {
        //        console.log("No item gotten from equipment..")
                return;
            }
            GameAPI.addItemToPlayerInventory(item, 0.5);
        }.bind(this);

        let addToStash = function(piece) {
            this.playerStash.addPieceToStash(piece);
            piece.getOnUpdateCallback()(0.01, GameAPI.getGameTime())
            piece.getSpatial().applySpatialUpdateToBuffers()
        }.bind(this);

        let handleStateEvent = function(event) {
            this.getPlayerCharacter().gamePiece.applyStateEvent(event)
        }.bind(this);

        let combatPage = null;
        let setPlayerState = function(charState) {
            if (charState === ENUMS.CharacterState.IDLE) {
                if (combatPage) {
                    combatPage.closeGuiPage();
                }
            } else {
                if (!combatPage) {
                    combatPage = GuiAPI.activatePage('page_activity_combat')
                }
            }
        };

        let callbacks = {
            handleEquip : equipItem,
            handleUnequip : unequipItem,
            handleDropItem : function (event) {        },
            handleStashItem : stashInvItem,
            handleTakeStashItem : takeStashItem,
            handleTakeWorldItem : function (event) {        },
            addToStash:addToStash,
            handleStateEvent:handleStateEvent,
            setPlayerState:setPlayerState

        }

        this.callbacks = callbacks;

        evt.on(ENUMS.Event.EQUIP_ITEM, callbacks.handleEquip);
        evt.on(ENUMS.Event.UNEQUIP_ITEM, callbacks.handleUnequip);
        evt.on(ENUMS.Event.DROP_ITEM, callbacks.handleDropItem);
        evt.on(ENUMS.Event.STASH_ITEM, callbacks.handleStashItem);
        evt.on(ENUMS.Event.TAKE_STASH_ITEM, callbacks.handleTakeStashItem);
        evt.on(ENUMS.Event.TAKE_WORLD_ITEM, callbacks.handleTakeWorldItem);
        evt.on(ENUMS.Event.MAIN_CHAR_STATE_EVENT, callbacks.handleStateEvent);
        evt.on(ENUMS.Event.SET_PLAYER_STATE, callbacks.setPlayerState);

    }


    setPlayerCharacter(character) {
        this.playerCharacter = character;
        let data = {
            MAIN_CHAR_STATUS:character.characterStatus
        }
        PipelineAPI.setCategoryData('CHARACTERS', data)
    }

    getPlayerCharacter() {
        return this.playerCharacter;
    }

    stashItemPiece(piece, time) {
        let playerPiece = this.getPlayerCharacter().gamePiece;
        this.playerStash.findPositionInStash(this.tempVec);
        playerPiece.getSpatial().getSpatialPosition(ThreeAPI.tempVec3)
        piece.getPieceMovement().moveToTargetAtTime('stash', ThreeAPI.tempVec3, this.tempVec, time, this.callbacks.addToStash);
    }

    takeStashedPiece(piece) {
        return this.playerStash.takePieceFromStash(piece);
    }
}

export { PlayerMain }