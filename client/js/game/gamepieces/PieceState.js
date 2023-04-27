import { PieceStateProcessor } from "./PieceStateProcessor.js";

class PieceState {
    constructor(gamePiece) {
        this.gamePiece = gamePiece;
        this.pieceStateProcessor = new PieceStateProcessor(gamePiece);
        this.config = {

            xpGain:21,
            turnTime:4,
            sourceFraction:0.15,
            prepFraction:0.25,
            swingFraction:0.30,
            recoverFraction:0.30,
            hasteFactor:1,
            maxActPts:5,
            maxHP: 100
        }

        this.status = {
            name:'no_name',
            gamePiece:gamePiece,
            size:0.5,
            height: 0.5,
            meleeRange:0.5,
            move_speed:5,
            turn_moves:0,
            aggro_range:7,
            levels:[0, 35, 100, 250, 500, 1000, 2000, 4000, 8000, 12000, 20000],
            NONE:0,
            FAST:3,
            lifetime:0,
            level:1,
            xp:0,
            gold:0,
            gems:0,
            inv:0,
            stash:0,
            charState:ENUMS.CharacterState.IDLE_HANDS,
            targState:ENUMS.CharacterState.IDLE_HANDS,
            atkType:ENUMS.AttackType.NONE,
            trgAtkTyp:ENUMS.AttackType.NONE,
            selectedTarget:null,
            engagingTarget:null,
            combatTarget:null,
            disengagingTarget:null,
            turnProgress:0,
            turn:0,
            attacks:0,
            attack:0,
            appliedAttacks:0,
            atkProg:0,
            source:0,
            prep:0,
            swing:0,
            recover:0,
            animKey:'none',
            action:'none',
            trTime:0,
            maxAPs:0,
            actPts:0,
            activeAPs:0,
            hp:100,
            maxHP:100,
            isItem:0,
            isCharacter:0,
            ability_slots_max: 2,
            ability_slots: 1,
            activeAbility: null,
            xp_value:5,
            status_frozen: 0,
            status_burning: 0,
            status_stunned: 0,
            status_hasted: 0,
            status_empowered: 0,
            status_hardened: 0,
            status_vampiric: 0,
            status_hidden: 0,
            status_poisoned: 0
        }

        this.lastState = ENUMS.CharacterState.IDLE_HANDS;

    }


    isCombatRelatedState(state) {
        return  (state === ENUMS.CharacterState.ENGAGING || state === ENUMS.CharacterState.COMBAT || state === ENUMS.CharacterState.DISENGAGING)
    }
    applyCharStateUpdates() {
        let charState = this.status.charState;
        if (this.isCombatRelatedState(charState)) {
            if (!this.isCombatRelatedState(this.lastState)) {
                this.gamePiece.character.activateCharStatusGui()
            }
        } else {
            if (this.isCombatRelatedState(this.lastState)) {
                this.gamePiece.character.deactivateCharStatusGui()
            }
        }
        this.lastState = charState;

    }



    updateGamePiece(tpf, time) {
        let statePre = this.status.charState;
        this.pieceStateProcessor.processGamePieceState(this.status, this.config, tpf, time)
        if (statePre !== this.status.charState) {
            if (this.gamePiece === GameAPI.getMainCharPiece()) {

                let target = this.gamePiece.getTarget();
                if (target) {
                    if (target.isDead) {
                        console.log("The dead cant dance, dont worry here")
                        return;
                    }
                }

                evt.dispatch(ENUMS.Event.SET_PLAYER_STATE, this.status.charState);
            }
        }
    }
    tickPieceState(tpf, time) {
        this.updateGamePiece(tpf, time);
        this.applyCharStateUpdates();
    }

}

export { PieceState }