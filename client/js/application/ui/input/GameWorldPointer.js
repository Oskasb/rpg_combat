import { TargetIndicator } from "../gui/game/TargetIndicator.js";
import { Vector3 } from "../../../../libs/three/math/Vector3.js";
let tempVec3 = new Vector3()
let tempVec3b = new Vector3()

class GameWorldPointer {
    constructor() {
        this.posVec = new THREE.Vector3()
        this.lastSelectedTile = null;
        this.selectionEvent = {
            piece:null,
            value:false
        }
    }


    worldPointerFindPath(pointer) {
        let playerPiece = GameAPI.getActivePlayerCharacter().gamePiece;
        let targetPos = null
        if (pointer.worldSpaceTarget && (pointer.worldSpaceTarget !== playerPiece)) {
            targetPos = pointer.worldSpaceTarget.getPos();
            playerPiece.movementPath.setPathTargetPiece(pointer.worldSpaceTarget)
        } else {
            if (this.lastSelectedTile) {
                targetPos = this.lastSelectedTile.getPos();
                playerPiece.movementPath.determineGridPathToPos(targetPos)
            }
        }

    }

    indicateSelection = function(bool, pointer, selection) {
        if (bool) {
            selection.pieceInfoGui.activatePieceInfoGui()
            let indicator = pointer.worldSpaceIndicator;
            if (!indicator) {
                indicator = new TargetIndicator()
                pointer.worldSpaceIndicator = indicator;
                indicator.indicateGamePiece(selection, 'effect_character_indicator', 1, 3, -1.5,1.2, 0, 4);
            }
            return indicator
        } else {
            pointer.worldSpaceIndicator.removeTargetIndicatorFromPiece(selection);
            pointer.worldSpaceIndicator.hideIndicatorFx();
            selection.pieceInfoGui.deactivatePieceInfoGui()
        }
    }

    worldPointerReleased = function(pointer) {
        if (GuiAPI.calls.getInMenu() === true) {
            return;
        }
        let playerPiece = GameAPI.getActivePlayerCharacter().gamePiece;
        //    console.log("Release Movement Pointer")
        playerPiece.movementPath.clearTilePathStatus( playerPiece.movementPath.pathTiles);

        if (pointer.worldSpaceTarget && (pointer.worldSpaceTarget !== playerPiece)) {
            this.indicateSelection(false, pointer, pointer.worldSpaceTarget)
            this.selectionEvent.piece = pointer.worldSpaceTarget;
            this.selectionEvent.value = true;
            evt.dispatch(ENUMS.Event.MAIN_CHAR_SELECT_TARGET,  this.selectionEvent);
        } else if (pointer.isMovementInput) {
            if (this.lastSelectedTile) {
            //    this.lastSelectedTile.setTileStatus('OCCUPIED');

            }
        } else {
            this.selectionEvent.piece = null;
            this.selectionEvent.value = false;
            evt.dispatch(ENUMS.Event.MAIN_CHAR_SELECT_TARGET,  this.selectionEvent);
        }

        if (pointer.worldSpaceTarget === playerPiece) {
            this.indicateSelection(false, pointer, pointer.worldSpaceTarget)
            this.selectionEvent.piece = pointer.worldSpaceTarget;
            this.selectionEvent.value = true;
            evt.dispatch(ENUMS.Event.MAIN_CHAR_SELECT_TARGET,  this.selectionEvent);
        }
        pointer.worldSpaceTarget = null;
        pointer.isMovementInput = false;
    }
    updateWorldPointer = function(pointer, isFirstPressFrame) {
        let playerPiece = GameAPI.getActivePlayerCharacter().gamePiece
        playerPiece.movementPath.cancelMovementPath( playerPiece.movementPath.pathTiles);
        if (GuiAPI.calls.getInMenu() === true) {
            return;
        }
        let indicator =  pointer.worldSpaceIndicator
        let pos = this.posVec.copy(pointer.pos);
        //   GameScreen.fitView(pos);

        pos.x *= 1 / GameScreen.getAspect()                  // X is Left axis
        pos.y *= 1 // Y is UP screen axis
        let dynamicScenario = GameAPI.getActiveDynamicScenario();
        let characters = dynamicScenario.characters;
        let pieces = dynamicScenario.pieces;

        let nearestDist = 99999;
        let screenSelection = null;

        let maxSelectRange = 0.10;
        let screenDistance = function(piecePos, select) {
            ThreeAPI.toScreenPosition(piecePos, tempVec3b)
            tempVec3b.sub(pos)
            let distance = tempVec3b.length();
            if (distance < maxSelectRange) {
                if (distance < nearestDist) {
                    screenSelection = select;
                    nearestDist = distance;
                }
            }
        }

        for (let i = 0; i < pieces.length; i++) {
            let gamePiece = pieces[i];
            if (gamePiece.isDead) {

            } else {
                gamePiece.getSpatial().getSpatialPosition(tempVec3)
                screenDistance(tempVec3,  gamePiece);
            }
        }


        tempVec3.copy(playerPiece.getPos());
        screenDistance(tempVec3, playerPiece)

        for (let i = 0; i < characters.length; i++) {
            let gamePiece = characters[i].gamePiece
            if (gamePiece.isDead) {

            } else {
                gamePiece.getSpatial().getSpatialPosition(tempVec3)
                ThreeAPI.toScreenPosition(tempVec3, tempVec3b)
                screenDistance(tempVec3, gamePiece);
            }
        }


        let worldSelection = screenSelection;
        let updateWorldPointer = function() {
            if (GuiAPI.calls.getInMenu() === true) {
                return;
            }
            if (worldSelection) {

                if (pointer.worldSpaceTarget !== worldSelection) {
           //         console.log("Change selected Target")

                    if (pointer.worldSpaceTarget) {
                        this.indicateSelection(false, pointer, pointer.worldSpaceTarget)
                    }

                    this.indicateSelection(true, pointer, worldSelection)


                } else {
                    indicator.call.updateIndicator(0.01, GameAPI.getGameTime(), worldSelection, 1.2, 0.8);
                }

                pointer.worldSpaceTarget = worldSelection;
                let rangeCheck = GameAPI.getActivePlayerCharacter().gamePiece.distanceToReachTarget(worldSelection)
                if (rangeCheck > 0) {
                    this.worldPointerFindPath(pointer)
                }

            } else {
                if (pointer.worldSpaceTarget) {
                    indicator.removeTargetIndicatorFromPiece(pointer.worldSpaceTarget);
                    pointer.worldSpaceTarget.pieceInfoGui.deactivatePieceInfoGui()
                    pointer.worldSpaceIndicator.hideIndicatorFx()
                    if (!this.selectionEvent) {
                        console.log("Some multi-touch issue here")
                    } else {
                        if (pointer.isMovementInput) {

                        } else {
                            this.selectionEvent.piece = pointer.worldSpaceTarget;
                            this.selectionEvent.value = false;

                            evt.dispatch(ENUMS.Event.MAIN_CHAR_SELECT_TARGET, this.selectionEvent);
                        }

                    }


                }
                pointer.worldSpaceTarget = null;
            }
        }.bind(this);

        let updateMovementPointer = function() {
            if (GuiAPI.calls.getInMenu() === true) {
                return;
            }
            let encounterGrid = GameAPI.getActiveEncounterGrid()
            let tiles = encounterGrid.gridTiles
            screenSelection = null;
            if (tiles.length) {
                for (let i = 0; i < tiles.length; i++) {
                    for (let j = 0; j < tiles[i].length; j++) {
                        let tile = tiles[i][j]
                        let pos = tile.obj3d.position;
                        screenDistance(pos, tile);
                    }
                }
            }

            let selectedTile = screenSelection;

            if (selectedTile && (pointer.getPointerHasDragState() > 0)) {
                if (this.lastSelectedTile !== selectedTile) {
                    if (this.lastSelectedTile) {
                        this.lastSelectedTile.indicateTileStatus(false)
                    }
                    this.lastSelectedTile = selectedTile
                    selectedTile.indicateTileStatus(false);
                    selectedTile.setTileStatus('MOVE_TO');
                    selectedTile.indicateTileStatus(true)
                }
                this.worldPointerFindPath(pointer);
            }

        }.bind(this);

        if (screenSelection === playerPiece && isFirstPressFrame) {
            pointer.isMovementInput = true;
            //    console.log(pointer)
        }

        if (pointer.isMovementInput) {
            updateMovementPointer();
        }
        updateWorldPointer()

    }
}

export { GameWorldPointer }