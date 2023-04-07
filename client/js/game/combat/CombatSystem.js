import * as SpatialUtils from "../../application/utils/SpatialUtils.js";

class CombatSystem {
    constructor(gamePiece) {
        this.gamePiece = gamePiece;
        this.knownHostiles = [];
        this.hostilesInRange = [];
        this.currentTarget = null;
        this.selectedTarget = null;
        this.targetEvent = {
            piece:null,
            value:false
        }
    }

    determineTurnCombatTarget() {
        let selectedTargetPiece = this.gamePiece.getStatusByKey('selectedTarget');
        if (selectedTargetPiece) {
            this.selectedTarget = selectedTargetPiece
            if (selectedTargetPiece === this.currentTarget) return;
            this.setCombatTarget(selectedTargetPiece);
        }
    }

    applyTargetSelection(status, selectedTarget) {
        if (!selectedTarget) {
        //    status.charState = ENUMS.CharacterState.DISENGAGING;
        } else if (selectedTarget !== this.selectedTarget) {
            let faction = selectedTarget.getStatusByKey('faction')
            if (faction === 'NEUTRAL' || "EVIL") {
                status.charState = ENUMS.CharacterState.ENGAGING
            }
        }
    }

    setCombatTarget(selectedTargetPiece) {
        this.currentTarget = selectedTargetPiece;
        this.gamePiece.setStatusValue('charState', ENUMS.CharacterState.COMBAT);
        this.gamePiece.setStatusValue('combatTarget', selectedTargetPiece);

        let stateEvent = {
            state:'COMBAT',
            type:'FAST',
            target:selectedTargetPiece
        }

        this.gamePiece.pieceState.handleStateEvent(stateEvent)

        if (this.gamePiece === GameAPI.getActivePlayerCharacter().gamePiece) {
            this.targetEvent.piece = selectedTargetPiece;
            this.targetEvent.value = true;
            evt.dispatch(ENUMS.Event.MAIN_CHAR_ENGAGE_TARGET, this.targetEvent)
        }
    }

    registerNewKnownHostile = function(hostileChar) {
        if (this.gamePiece === GameAPI.getActivePlayerCharacter().gamePiece) {
            this.targetEvent.piece = hostileChar;
            this.targetEvent.value = true;
            evt.dispatch(ENUMS.Event.MAIN_CHAR_REGISTER_HOSTILE,  this.targetEvent)
        }

    }

    unregisterKnownHostile = function(hostileChar) {
        if (this.gamePiece === GameAPI.getActivePlayerCharacter().gamePiece) {
            this.targetEvent.piece = hostileChar;
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

        let combatTarget = this.gamePiece.getStatusByKey('combatTarget');

        if (combatTarget) {

        } else {
            let selectedTargetPiece = this.gamePiece.getStatusByKey('selectedTarget');
            this.applyTargetSelection(status, selectedTargetPiece);

            if (status.charState === ENUMS.CharacterState.COMBAT || ENUMS.CharacterState.ENGAGING) {
                this.determineTurnCombatTarget();
            }
        }
    }

}

export { CombatSystem }