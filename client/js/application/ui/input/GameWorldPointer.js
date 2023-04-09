import { TargetIndicator } from "../gui/game/TargetIndicator.js";
import { ThreeSpatialFunctions } from "../../../3d/three/ThreeSpatialFunctions.js";

class GameWorldPointer {
    constructor() {
        this.spatialFunctions = new ThreeSpatialFunctions()
        this.selectionEvent = {
            piece:null,
            value:false
        }
    }

    registerNewWorldPointer = function(pointer) {

    }

    worldPointerReleased = function(pointer) {
        if (pointer.worldSpaceTarget) {
            pointer.worldSpaceIndicator.removeTargetIndicatorFromPiece(pointer.worldSpaceTarget);
            pointer.worldSpaceIndicator.hideIndicatorFx();
            this.selectionEvent.piece = pointer.worldSpaceTarget;
            this.selectionEvent.value = true;
            evt.dispatch(ENUMS.Event.MAIN_CHAR_SELECT_TARGET,  this.selectionEvent);
        } else {
            this.selectionEvent.piece = null;
            this.selectionEvent.value = false;
            evt.dispatch(ENUMS.Event.MAIN_CHAR_SELECT_TARGET,  this.selectionEvent);
        }
    }
    updateWorldPointer = function(pointer) {
        let indicator =  pointer.worldSpaceIndicator
        let pos = pointer.pos;
        let dynamicScenario = GameAPI.getActiveDynamicScenario();
        let characters = dynamicScenario.characters;
        let pieces = dynamicScenario.pieces;

        let nearestDist = 99999;
        let selectedTarget = null;

        let maxSelectRange = 0.15;
        let screenDistance = function(piecePos, piece) {
            ThreeAPI.toScreenPosition(piecePos, ThreeAPI.tempVec3b)
            ThreeAPI.tempVec3b.sub(pos)
            let distance = ThreeAPI.tempVec3b.length();
            if (distance < maxSelectRange) {
                if (distance < nearestDist) {
                    selectedTarget = piece;
                    nearestDist = distance;
                }
            }
        }

        for (let i = 0; i < pieces.length; i++) {
            pieces[i].getSpatial().getSpatialPosition(ThreeAPI.tempVec3)
            screenDistance(ThreeAPI.tempVec3,  pieces[i]);

        }

        for (let i = 0; i < characters.length; i++) {
            characters[i].gamePiece.getSpatial().getSpatialPosition(ThreeAPI.tempVec3)
            ThreeAPI.toScreenPosition(ThreeAPI.tempVec3, ThreeAPI.tempVec3b)
            screenDistance(ThreeAPI.tempVec3, characters[i].gamePiece);
        }

        if (selectedTarget) {
            if (pointer.worldSpaceTarget !== selectedTarget) {
                console.log("Change selected Target")
                if (pointer.worldSpaceTarget) {
                    indicator.removeTargetIndicatorFromPiece(pointer.worldSpaceTarget);
                }
                if (!pointer.worldSpaceIndicator) {
                    indicator = new TargetIndicator()
                    pointer.worldSpaceIndicator = indicator;
                    indicator.indicateGamePiece(selectedTarget, 'effect_character_indicator', 1, 3, -1.5,1.2, 0, 4);
                }

            } else {
                indicator.call.updateIndicator(0.01, GameAPI.getGameTime(), selectedTarget, 1.2, 0.8);
            }

            pointer.worldSpaceTarget = selectedTarget;
        } else {
            if (pointer.worldSpaceTarget) {
                indicator.removeTargetIndicatorFromPiece(pointer.worldSpaceTarget);
                pointer.worldSpaceIndicator.hideIndicatorFx()
                this.selectionEvent.piece = pointer.worldSpaceTarget;
                this.selectionEvent.value = false;
                evt.dispatch(ENUMS.Event.MAIN_CHAR_SELECT_TARGET, this.selectionEvent);

            }
            pointer.worldSpaceTarget = null;
        }
    }
}

export { GameWorldPointer }