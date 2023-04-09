import { CombatTargetProcessor } from "./CombatTargetProcessor.js";
import {CombatMovementProcessor} from "./CombatMovementProcessor.js";

class CombatSystem {
    constructor(gamePiece) {
        this.gamePiece = gamePiece;
        this.combatTargetProcessor = new CombatTargetProcessor();
        this.combatMovementProcessor = new CombatMovementProcessor(gamePiece)
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
        this.gamePiece.setStatusValue('charState', ENUMS.CharacterState.COMBAT);
        this.gamePiece.setStatusValue('trgAtkTyp', ENUMS.AttackType.FAST);
        if (this.currentTarget !== combatTarget) {
            if (this.gamePiece === GameAPI.getActivePlayerCharacter().gamePiece) {
                this.targetEvent.piece = combatTarget;
                this.targetEvent.value = true;
                evt.dispatch(ENUMS.Event.MAIN_CHAR_ENGAGE_TARGET, this.targetEvent)
            }
        }
        this.currentTarget = combatTarget;
    }

    disengageTarget(disengageTarget) {
        this.gamePiece.setStatusValue('trgAtkTyp', ENUMS.AttackType.NONE);
            if (this.gamePiece === GameAPI.getActivePlayerCharacter().gamePiece) {
                this.targetEvent.piece = disengageTarget;
                this.targetEvent.value = false;
                evt.dispatch(ENUMS.Event.MAIN_CHAR_ENGAGE_TARGET, this.targetEvent)
            }
            this.currentTarget = null;
        }


    engageTarget(engageTarget) {
        this.combatMovementProcessor.updateEngagedTarget(engageTarget);
    }


    updateCombatTurnTick() {
        this.combatTargetProcessor.updateCombatTarget(this.gamePiece);
        this.engageTarget(this.gamePiece.getStatusByKey('engagingTarget'));
        let combatTarget = this.gamePiece.getStatusByKey('combatTarget');
        if (combatTarget !== null) {
            if (this.combatMovementProcessor.measureAttackRange(combatTarget)) {
                this.attackCombatTarget(combatTarget);
            } else {

            }
        } else {
            if (this.currentTarget) {
                this.disengageTarget(this.currentTarget);
            }
        }
    }
}

export { CombatSystem }