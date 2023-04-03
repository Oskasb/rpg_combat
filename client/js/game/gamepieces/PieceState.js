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
                HEAVY:1
            },
            prepFraction:0.3,
            swingFraction:0.2,
            recoverFraction:0.5,
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
            prep:0,
            swing:0,
            recover:0
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
        this.pieceStateProcessor.processGamePieceState(this.status, this.config, tpf, time)
    }
    tickPieceState(tpf, time) {
        this.updateGamePiece(tpf, time);
    }

}

export { PieceState }