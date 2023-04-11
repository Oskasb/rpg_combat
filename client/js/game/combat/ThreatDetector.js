import * as SpatialUtils from "../../application/utils/SpatialUtils.js";
import { CombatTargetProcessor } from "./CombatTargetProcessor.js";

class ThreatDetector {
    constructor(gamePiece) {
        this.gamePiece = gamePiece;
        this.knownHostiles = [];
        this.hostilesInRange = [];
        this.threatEvent = {
            piece:null,
            value:false
        }
    }

    appropriatelyTreatKnownHostile = function(hostileChar) {
        if (this.gamePiece === GameAPI.getActivePlayerCharacter().gamePiece) {
            this.threatEvent.piece = hostileChar;
            this.threatEvent.value = true;
            evt.dispatch(ENUMS.Event.MAIN_CHAR_REGISTER_HOSTILE,  this.threatEvent)
        }

    //    console.log("NEW HOSTILE", hostileChar)

        if (this.gamePiece.getStatusByKey('faction') === 'GOOD') {
            if (hostileChar.gamePiece.getStatusByKey('faction') === 'EVIL') {
                let aggroRange = hostileChar.gamePiece.getStatusByKey('aggro_range')
                let distance = MATH.distanceBetween(hostileChar.gamePiece.getPos(), this.gamePiece.getPos())
                if (distance < aggroRange) {
                    hostileChar.gamePiece.setStatusValue('selectedTarget', this.gamePiece);
                    if (!this.gamePiece.getStatusByKey('selectedTarget')) {
                        this.gamePiece.setStatusValue('selectedTarget', hostileChar.gamePiece);
                    }
                }

            }
        }

    }

    unregisterKnownHostile = function(hostileChar) {
        if (this.gamePiece === GameAPI.getActivePlayerCharacter().gamePiece) {
            this.threatEvent.piece = hostileChar;
            this.threatEvent.value = false;
            evt.dispatch(ENUMS.Event.MAIN_CHAR_REGISTER_HOSTILE, this.threatEvent)
        }

    }

    updateNearbyHostiles = function() {

        let _this = this;

        for (let i = 0; i < this.hostilesInRange.length; i++) {
            let hostileChar = this.hostilesInRange[i];
            if (this.knownHostiles.indexOf(hostileChar) === -1) {
                this.knownHostiles.push(hostileChar);
            }
            _this.appropriatelyTreatKnownHostile(hostileChar);
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
        SpatialUtils.getCharactersInRange(this.hostilesInRange, this.gamePiece, activeChars, 49);
        this.updateNearbyHostiles()
    }

    updateScenarioThreat() {
        this.determineCombatThreat();
    }

}

export { ThreatDetector }