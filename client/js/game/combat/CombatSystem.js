import * as SpatialUtils from "../../application/utils/SpatialUtils.js";
import { CombatTargetProcessor } from "./CombatTargetProcessor.js";

class CombatSystem {
    constructor(gamePiece) {
        this.gamePiece = gamePiece;
        this.combatTargetProcessor = new CombatTargetProcessor();
        this.knownHostiles = [];
        this.hostilesInRange = [];
        this.currentTarget = null;
        this.selectedTarget = null;
        this.targetEvent = {
            piece:null,
            value:false
        }
    }

    attackCombatTarget(combatTarget) {
        this.currentTarget = combatTarget;

        let stateEvent = {
            state:'COMBAT',
            type:'FAST',
            target:"practice"
        }

    //    this.gamePiece.pieceState.handleStateEvent(stateEvent)

        if (this.gamePiece === GameAPI.getActivePlayerCharacter().gamePiece) {
            this.targetEvent.piece = combatTarget;
            this.targetEvent.value = true;
            evt.dispatch(ENUMS.Event.MAIN_CHAR_ENGAGE_TARGET, this.targetEvent)
        }
    }

    updateCombatTurnTick() {
        this.combatTargetProcessor.updateCombatTarget(this.gamePiece);
        let combatTarget = this.gamePiece.getStatusByKey('combatTarget');
        if (combatTarget) {
            this.attackCombatTarget(combatTarget);
        }
    }

}

export { CombatSystem }