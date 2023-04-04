import { PieceStateProcessor } from "./PieceStateProcessor.js";

class PieceState {
    constructor(gamePiece) {
        this.gamePiece = gamePiece;
        this.pieceStateProcessor = new PieceStateProcessor(gamePiece);
        this.config = {
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
            hasteFactor:1
        }

        this.status = {
            lifetime:0,
            charState:ENUMS.CharacterState.IDLE,
            targState:ENUMS.CharacterState.IDLE,
            atkType:ENUMS.AttackType.NONE,
            trgAtkTyp:ENUMS.AttackType.NONE,
            target:'none',
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
            trTime:0
        }
    }


    handleStateEvent(event) {
        if (this.status.targState === ENUMS.CharacterState[event.state] && this.status.trgAtkTyp === ENUMS.AttackType[event.type]) {
            this.status.targState = ENUMS.CharacterState.IDLE;
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