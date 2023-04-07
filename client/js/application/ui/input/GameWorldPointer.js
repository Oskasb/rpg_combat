import { TargetIndicator } from "../gui/game/TargetIndicator.js";
import { ThreeSpatialFunctions } from "../../../3d/three/ThreeSpatialFunctions.js";

class GameWorldPointer {
    constructor() {
        this.spatialFunctions = new ThreeSpatialFunctions()
    }

    registerNewWorldPointer = function(pointer) {

    }

    worldPointerReleased = function(pointer) {
        if (pointer.worldSpaceTarget) {
            pointer.worldSpaceIndicator.removeTargetIndicatorFromPiece(pointer.worldSpaceTarget);
            pointer.worldSpaceIndicator.hideIndicatorFx()
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

        for (let i = 0; i < pieces.length; i++) {
            pieces[i].getSpatial().getSpatialPosition(ThreeAPI.tempVec3)
            let distance = this.spatialFunctions.getHoverDistanceToPos(ThreeAPI.tempVec3, pos);
            if (distance < nearestDist) {
                selectedTarget = pieces[i];
            }
        }

        for (let i = 0; i < characters.length; i++) {
            characters[i].gamePiece.getSpatial().getSpatialPosition(ThreeAPI.tempVec3)
            let distance = this.spatialFunctions.getHoverDistanceToPos(ThreeAPI.tempVec3, pos);
            if (distance < nearestDist) {
                selectedTarget = characters[i].gamePiece;
            }
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
                    indicator.indicateTargetSeleected(selectedTarget, 'effect_character_indicator');
                }

            } else {
                indicator.indicateSelectedTargetPiece(0.01, GameAPI.getGameTime(), selectedTarget);
            }

            pointer.worldSpaceTarget = selectedTarget;
        } else {
            if (pointer.worldSpaceTarget) {
                indicator.removeTargetIndicatorFromPiece(pointer.worldSpaceTarget);
            }
            pointer.worldSpaceTarget = null;
        }
    }
}

export { GameWorldPointer }