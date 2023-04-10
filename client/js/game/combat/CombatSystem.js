import { CombatTargetProcessor } from "./CombatTargetProcessor.js";
import { CombatMovementProcessor } from "./CombatMovementProcessor.js";
import { CombatOpponentStatusProcessor } from "./CombatOpponentStatusProcessor.js";

class CombatSystem {
    constructor(gamePiece) {
        this.gamePiece = gamePiece;
        this.combatTargetProcessor = new CombatTargetProcessor();
        this.combatMovementProcessor = new CombatMovementProcessor(gamePiece);
        this.combatOpponentStatusProcessor = new CombatOpponentStatusProcessor(gamePiece);
        this.knownHostiles = [];
        this.hostilesInRange = [];
        this.currentTarget = null;
        this.selectedTarget = null;
        this.targetEvent = {
            piece:null,
            value:false
        }
    }

    opponentStatusUpdate(opponentPiece, statusKey, statusValue) {
        this.combatOpponentStatusProcessor.handleOpponentStatusUpdate(opponentPiece, statusKey, statusValue);
    };

    attackCombatTarget(combatTarget) {
   //     console.log("ATTACK TARGET: ", this.gamePiece.getStatusByKey('charState'))

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
        this.gamePiece.setStatusValue('trgAtkTyp', ENUMS.AttackType.FAST);
    }

    testForMeleeRange = function(engageTarget) {
        if (!engageTarget) return false;
        return this.combatMovementProcessor.measureAttackRange(engageTarget)
    }

    updateCombatTurnTick() {
        let combatTarget = this.gamePiece.getStatusByKey('combatTarget');
        if (combatTarget !== null) {
            if (this.testForMeleeRange(combatTarget)) {
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