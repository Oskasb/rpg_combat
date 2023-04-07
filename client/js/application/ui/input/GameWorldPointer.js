import { TargetIndicator } from "../gui/game/TargetIndicator.js";
import { ThreeSpatialFunctions } from "../../../3d/three/ThreeSpatialFunctions.js";

class GameWorldPointer {
    constructor() {
        this.worldIndocators = [];
        this.spatialFunctions = new ThreeSpatialFunctions()
    }

    registerNewWorldPointer = function(pointer) {
        let indicator = this.worldIndocators.pop();
        if (!indicator) indicator = new TargetIndicator()
        pointer.worldSpaceIndicator = indicator;
    }

    worldPointerReleased = function(pointer) {
        let indicator =  pointer.worldSpaceIndicator
        this.worldIndocators.push(pointer.worldSpaceIndicator);
        pointer.worldSpaceIndicator = null;
        indicator.removeIndicatorFx()
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
            let spatial = pieces[i].getSpatial()
            let distance = this.spatialFunctions.getHoverDistanceToPos(spatial.obj3d.position, pos);
            if (distance < nearestDist) {
                selectedTarget = pieces[i];
            }
        }

        for (let i = 0; i < characters.length; i++) {
            let spatial = characters[i].gamePiece.getSpatial()
            let distance = this.spatialFunctions.getHoverDistanceToPos(spatial.obj3d.position, pos);
            if (distance < nearestDist) {
                selectedTarget = characters[i].gamePiece;
            }
        }

        if (selectedTarget) {
            if (pointer.worldSpaceTarget !== selectedTarget) {
                if (pointer.worldSpaceTarget) {
                    indicator.removeTargetIndicatorFromPiece(pointer.worldSpaceTarget);
                }
                indicator.indicateTargetSeleected(selectedTarget, 'effect_character_indicator');
            } else {
                if (pointer.worldSpaceTarget) {
                    indicator.removeTargetIndicatorFromPiece(pointer.worldSpaceTarget);
                }
            }
        }
    }
}

export { GameWorldPointer }