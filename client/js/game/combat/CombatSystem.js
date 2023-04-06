import * as SpatialUtils from "../../application/utils/SpatialUtils.js";
import {getCharactersInRange} from "../../application/utils/SpatialUtils.js";
class CombatSystem {
    constructor(gamePiece) {
        this.gamePiece = gamePiece;
        this.knownHostiles = [];
        this.hostilesInRange = [];
        this.currentTarget = null;
        this.targetEvent = {
            char:null,
            value:false
        }
    }

    determineTurnCombatTarget() {
        let target = SpatialUtils.getNearestCharacter(this.gamePiece.getSpatial(), this.knownHostiles)
        if (target === this.currentTarget) return;
        this.setCombatTarget(target);
    }

    setCombatTarget(hostileChar) {
        this.currentTarget = hostileChar;
        if (this.gamePiece === GameAPI.getActivePlayerCharacter().gamePiece) {
            this.targetEvent.char = hostileChar;
            this.targetEvent.value = true;
            evt.dispatch(ENUMS.Event.MAIN_CHAR_REGISTER_TARGET, this.targetEvent)
        }
    }

    registerNewKnownHostile = function(hostileChar) {
        if (this.gamePiece === GameAPI.getActivePlayerCharacter().gamePiece) {
            this.targetEvent.char = hostileChar;
            this.targetEvent.value = true;
            evt.dispatch(ENUMS.Event.MAIN_CHAR_REGISTER_HOSTILE,  this.targetEvent)
        }

    }

    unregisterKnownHostile = function(hostileChar) {
        if (this.gamePiece === GameAPI.getActivePlayerCharacter().gamePiece) {
            this.targetEvent.char = hostileChar;
            this.targetEvent.value = false;
            evt.dispatch(ENUMS.Event.MAIN_CHAR_REGISTER_HOSTILE, this.targetEvent)
        }

    }

    updateNearbyHostiles = function() {

        let _this = this;

        for (let i = 0; i < this.hostilesInRange.length; i++) {
            let hostileChar = this.hostilesInRange[i];
            if (this.knownHostiles.indexOf(hostileChar) === -1) {
                this.knownHostiles.push(hostileChar);
                _this.registerNewKnownHostile(hostileChar);
            }
        }

        for (let i = 0; i < this.knownHostiles.length; i++) {
            let hostileChar = this.knownHostiles[i];
            if (this.hostilesInRange.indexOf(hostileChar) === -1) {
                _this.unregisterKnownHostile(MATH.quickSplice(this.knownHostiles, hostileChar));
            }
        }
    }

    determineCombatThreat() {
        let activeChars = GameAPI.getActiveScenarioCharacters();
        if (!activeChars) return;
        MATH.emptyArray(this.hostilesInRange);
        SpatialUtils.getCharactersInRange(this.hostilesInRange, this.gamePiece, activeChars, 15);
        this.updateNearbyHostiles()
    }

    updateCombatTurnTick() {
        let status = this.gamePiece.pieceState.status;

        this.determineCombatThreat();

        if (status.charState === ENUMS.CharacterState.COMBAT || ENUMS.CharacterState.ENGAGING) {
            this.determineTurnCombatTarget();
        }
    }

}

export { CombatSystem }