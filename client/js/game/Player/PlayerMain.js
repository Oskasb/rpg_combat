import { PlayerStash } from "./PlayerStash.js";
import { TargetIndicator } from "../../application/ui/gui/game/TargetIndicator.js";

class PlayerMain {
    constructor() {
        this.tempVec = new THREE.Vector3();
        this.playerStash = new PlayerStash();
        this.playerCharacter = null;
        this.selectionIndicator = new TargetIndicator();
        this.targetIndicator = new TargetIndicator();

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
            console.log("handleStateEvent leads nowhere...", event )

        }.bind(this);

        let combatPage = null;
        let setPlayerState = function(charState) {
            if (charState === ENUMS.CharacterState.IDLE_HANDS) {
                if (combatPage) {
                    combatPage.closeGuiPage();
                }
            } else {
                if (!combatPage) {
                    combatPage = GuiAPI.activatePage('page_activity_combat')
                }
            }
        };

        let registerHostile = function(event) {
            if (event.value === true) {
                this.handleHostileAdded(event.piece)
            } else {
                this.handleHostileRemoved(event.piece)
            }

        }.bind(this);

        let registerTargetEngaged = function(event) {
            if (event.value === true) {
                this.handleTargetEngaged(event.piece)
            } else {
                this.handleTargetDisengaged(event.piece)
            }
        }.bind(this);

        let selectTarget = function(event) {
            if (event.value === true) {
                this.handleTargetSelected(event.piece)
            } else {
                this.handleTargetUnselected(event.piece)
            }
        }.bind(this)

        let callbacks = {
            handleEquip : equipItem,
            handleUnequip : unequipItem,
            handleDropItem : function (event) {        },
            handleStashItem : stashInvItem,
            handleTakeStashItem : takeStashItem,
            addToStash:addToStash,
            handleStateEvent:handleStateEvent,
            setPlayerState:setPlayerState,
            registerHostile:registerHostile,
            registerTargetEngaged:registerTargetEngaged,
            selectTarget:selectTarget
        }

        this.callbacks = callbacks;

        evt.on(ENUMS.Event.EQUIP_ITEM, callbacks.handleEquip);
        evt.on(ENUMS.Event.UNEQUIP_ITEM, callbacks.handleUnequip);
        evt.on(ENUMS.Event.DROP_ITEM, callbacks.handleDropItem);
        evt.on(ENUMS.Event.STASH_ITEM, callbacks.handleStashItem);
        evt.on(ENUMS.Event.TAKE_STASH_ITEM, callbacks.handleTakeStashItem);
        evt.on(ENUMS.Event.MAIN_CHAR_STATE_EVENT, callbacks.handleStateEvent);
        evt.on(ENUMS.Event.SET_PLAYER_STATE, callbacks.setPlayerState);
        evt.on(ENUMS.Event.MAIN_CHAR_REGISTER_HOSTILE, callbacks.registerHostile);
        evt.on(ENUMS.Event.MAIN_CHAR_SELECT_TARGET, callbacks.selectTarget);
        evt.on(ENUMS.Event.MAIN_CHAR_ENGAGE_TARGET, callbacks.registerTargetEngaged);

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

    handleHostileAdded(hostileChar) {
        hostileChar.activateCharStatusGui()
    }

    handleHostileRemoved(hostileChar) {
        hostileChar.deactivateCharStatusGui()
    }

    handleTargetSelected(gamePiece) {

        if (gamePiece.getStatusByKey('isItem')) {
            let distance = MATH.distanceBetween(gamePiece.getPos(), this.playerCharacter.gamePiece.getPos())
            if (distance < 3) {
                GameAPI.addItemToPlayerInventory(GameAPI.takePieceFromWorld(gamePiece), 1);
            }
            return;
        }

        let oldTarget = this.playerCharacter.gamePiece.getStatusByKey('selectedTarget');
        if (oldTarget) {
            this.handleTargetUnselected(oldTarget);
        }

        this.playerCharacter.gamePiece.setStatusValue('selectedTarget', gamePiece);
        this.selectionIndicator.indicateGamePiece(gamePiece, 'effect_character_indicator', 1, 6, -0.5, 1.1, 0);
    }

    handleTargetUnselected() {
        this.playerCharacter.gamePiece.setStatusValue('selectedTarget', null);
        this.selectionIndicator.removeTargetIndicatorFromPiece()
        this.selectionIndicator.removeIndicatorFx()
    }

    handleTargetEngaged(gamePiece) {
        console.log("handleTargetEngaged")
        this.targetIndicator.removeTargetIndicatorFromPiece()
        this.targetIndicator.removeIndicatorFx()
        this.targetIndicator.indicateGamePiece(gamePiece, 'effect_character_indicator', 0, 5, 0, 1.03, 0.06, 5);
    }

    handleTargetDisengaged() {
        console.log("handleTargetDisengaged")
        this.targetIndicator.removeTargetIndicatorFromPiece()
        this.targetIndicator.removeIndicatorFx()
    }

    takeStashedPiece(piece) {
        return this.playerStash.takePieceFromStash(piece);
    }
}

export { PlayerMain }