import { PlayerStash } from "./PlayerStash.js";
import { TargetIndicator } from "../../application/ui/gui/game/TargetIndicator.js";
import { Vector3 } from "../../../libs/three/math/Vector3.js";
let tempVec3 = new Vector3()

let cheatInventory = [
    "HELMET_VIKING", "BELT_PLATE",
    "BOOTS_SCALE", "GLOVES_SCALE", "SHIRT_SCALE",
    "LEGS_SCALE", "SHIRT_CHAIN"
]

class PlayerMain {
    constructor() {
        this.heroPageActive = false;
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
                    combatPage = null;
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
                this.handleTargetSelected(event)
            } else {
                this.handleTargetUnselected(event.piece)
            }
        }.bind(this)

        let ressAtHome = function(gamePiece) {
            gamePiece.isDead = false;
            gamePiece.movementPath.cancelMovementPath()
            gamePiece.setStatusValue('hp', gamePiece.getStatusByKey('maxHP'));
            gamePiece.setStatusValue('charState', ENUMS.CharacterState.IDLE_HANDS);
            gamePiece.setStatusValue('targState', ENUMS.CharacterState.IDLE_HANDS);
        }

        let returnHome = function() {
            let gamePiece = GameAPI.getMainCharPiece()
            ressAtHome(gamePiece);

            for (let i = 0; i < gamePiece.companions.length; i++) {
                ressAtHome(gamePiece.companions[i])
            }

            evt.dispatch(ENUMS.Event.REQUEST_SCENARIO, {
                id:"home_scenario",
                dynamic:"home_hovel_dynamic"
            });
        }

        let applyCheatPimp = function(event) {
            this.cheatPimpMainChar(event)
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
            selectTarget:selectTarget,
            returnHome:returnHome,
            applyCheatPimp:applyCheatPimp
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
        evt.on(ENUMS.Event.MAIN_CHAR_RETURN_HOME, callbacks.returnHome);
        evt.on(ENUMS.Event.CHEAT_APPLY_PIMP, callbacks.applyCheatPimp);
    }


    setPlayerCharacter(character) {
        GameAPI.registerGameUpdateCallback(character.gamePiece.getOnUpdateCallback())
        character.gamePiece.setStatusValue('isCharacter', 1);
        if (!this.mainCharPage) {
            let openMainCharPage = function() {
                this.mainCharPage = GuiAPI.activatePage("page_player_main");
            }.bind(this);

            setTimeout(function() {
                openMainCharPage();
            }, 2000)
        }

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
        playerPiece.getSpatial().getSpatialPosition(tempVec3)
        piece.getPieceMovement().moveToTargetAtTime('stash', tempVec3, this.tempVec, time, this.callbacks.addToStash);
    }

    handleHostileAdded(hostileChar) {
        //    hostileChar.activateCharStatusGui()
    }

    handleHostileRemoved(hostileChar) {
        //    hostileChar.deactivateCharStatusGui()
    }

    handleTargetSelected(event) {

        let gamePiece = event.piece;
        let longPress = event.longPress;
        if (gamePiece.isDead) {
            console.log('No selecting the dead')
            return;
        }



            if (gamePiece === this.playerCharacter.gamePiece) {
                let switchCallback = function() {

                }
                if (longPress === 1) {
                if (!gamePiece.getTarget()) {

                    let currentPage = GameAPI.getActiveDynamicScenario().page;
                    if (currentPage.isActive === false) {
                        return;
                    }
                    if (!gamePiece.movementPath.destinationTile || gamePiece.movementPath.destinationTile === gamePiece.movementPath.getTileAtPos(gamePiece.getPos())) {
                        GuiAPI.guiPageSystem.switchFromCurrentActiveToPage(currentPage, 'page_scene_hero', switchCallback);
                    }

                } else {
                    console.log("Player Select self while having a target... nothing happens for now")
                }
                }
                return;
            }


            if (gamePiece.getStatusByKey('following') === this.playerCharacter.gamePiece) {
                if (longPress === 1) {
                    console.log("select follower, switch control here..")
                }
                return;
            }

            if (gamePiece.getStatusByKey('companion')) {
                if (longPress === 1) {
                    gamePiece.setStatusValue('following', this.playerCharacter.gamePiece)
                    this.playerCharacter.gamePiece.addCompanion(gamePiece);
                }
                return;
            }


        if (gamePiece.getStatusByKey('isItem')) {
            let playerPiece = this.playerCharacter.gamePiece;
            if (playerPiece.distanceToReachTarget(gamePiece) < 1) {
                GameAPI.addItemToPlayerInventory(gamePiece, 1);
            } else {

                let onArrive = function(arrive) {
                    console.log("Arrive at Item", arrive);
                    this.handleTargetSelected(gamePiece);
                }.bind(this);
                playerPiece.movementPath.addPathEndCallback(onArrive);
                playerPiece.movementPath.setPathTargetPiece(gamePiece);
            }
            return;
        }

        let oldTarget = this.playerCharacter.gamePiece.getStatusByKey('selectedTarget');
        if (oldTarget) {
            this.handleTargetUnselected();
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
        //   console.log("handleTargetEngaged")
        this.targetIndicator.removeTargetIndicatorFromPiece()
        this.targetIndicator.removeIndicatorFx()
        this.targetIndicator.indicateGamePiece(gamePiece, 'effect_character_indicator', 0, 5, 0, 1.03, 0.06, 5);
    }

    handleTargetDisengaged() {
        //   console.log("handleTargetDisengaged")
        this.targetIndicator.removeTargetIndicatorFromPiece()
        this.targetIndicator.removeIndicatorFx()
    }

    takeStashedPiece(piece) {
        return this.playerStash.takePieceFromStash(piece);
    }



    cheatPimpMainChar(event) {
        let char = GameAPI.getActivePlayerCharacter()
        let equip = function(piece) {
            char.getEquipment().characterEquipItem(piece);
        };
        let itemCallback = function(gamePiece) {
            equip(gamePiece)
        };

        if (cheatInventory.length) {
            let item = MATH.getRandomArrayEntry(cheatInventory)
            MATH.quickSplice(cheatInventory, item)
            GameAPI.createGamePiece({piece:item}, itemCallback);
        } else {
            return;
        }

        console.log("Cheat pimp")


        let status = GameAPI.getMainCharPiece().getStatus()
        let addHp = Math.floor(Math.random()*20)
        let addDmg = 1+Math.floor(Math.random()*1.5);
        let addAttacks = 0.3 + Math.floor(Math.random()*1.2);
        let addLevel = 1;
        status.FAST += addAttacks;
        status.maxHP += addHp;
        status.hp += addHp;
        status.dmg += addDmg;
        status.level += addLevel;










    }

}

export { PlayerMain }