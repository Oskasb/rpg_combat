import { PieceStateProcessor } from "./PieceStateProcessor.js";

class PieceState {
    constructor(gamePiece) {
        this.gamePiece = gamePiece;
        this.pieceStateProcessor = new PieceStateProcessor(gamePiece);
        this.config = {
            levels:[0, 100, 250, 500, 1000, 2000, 4000, 8000,12000, 20000],
            xpGain:21,
            turnTime:4,
            attacks:{
                NONE:0,
                FAST:3,
                HEAVY:2
            },
            sourceFraction:0.25,
            prepFraction:0.25,
            swingFraction:0.25,
            recoverFraction:0.25,
            hasteFactor:1,
            maxActPts:5,
            maxHP: 100
        }

        this.status = {
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
            turnProgress:0,
            turn:0,
            attacks:0,
            attack:0,
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
            hp:100,
            maxHP:100,
            isItem:0,
            isCharacter:0
        }

    }




    handleStateEvent(event) {
        if (this.status.targState === ENUMS.CharacterState[event.state] && this.status.trgAtkTyp === ENUMS.AttackType[event.type]) {
            this.status.targState = ENUMS.CharacterState.IDLE_HANDS;
            this.status.trgAtkTyp = ENUMS.AttackType.NONE;
            this.status.target = "none";
        } else {
            this.status.targState = ENUMS.CharacterState[event.state];
            this.status.trgAtkTyp = ENUMS.AttackType[event.type];
            this.status.target = event.target;
        }
    }
    updateGamePiece(tpf, time) {
        let statePre = this.status.charState;
        this.pieceStateProcessor.processGamePieceState(this.status, this.config, tpf, time)
        if (statePre !== this.status.charState) {
            if (this.gamePiece === GameAPI.getActivePlayerCharacter().gamePiece) {
                evt.dispatch(ENUMS.Event.SET_PLAYER_STATE, this.status.charState);
            }
        }
    }
    tickPieceState(tpf, time) {
        this.updateGamePiece(tpf, time);
    }

}

export { PieceState }