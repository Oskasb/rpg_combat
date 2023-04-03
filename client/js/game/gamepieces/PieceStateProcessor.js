class PieceStateProcessor {
    constructor(gamePiece) {
        this.gamePiece = gamePiece;
    }

    processNewTurn(status, config) {
        status.turn++;
        status.turnProgress++;
        status.charState = status.targState;
        status.atkType = status.trgAtkTyp;
        if (status.charState === ENUMS.CharacterState.COMBAT) {
            status.attack = 1;
        } else {
            status.attack = 0;
        }

    }


    countAttack(status, config) {
        status.attack++
    }

    processSwingProgress(status, config) {

        status.prep = MATH.clamp (status.atkProg / config.prepFraction, 0, 1);
        status.swing = MATH.clamp ((status.atkProg-config.prepFraction) / (config.swingFraction), 0, 1);
        status.recover = MATH.clamp ((status.atkProg-(config.swingFraction+config.prepFraction)) / (config.recoverFraction ), 0, 1);

    }
    processAttack(status, config) {
        status.atkProg = (status.attacks - status.turnProgress * status.attacks) - (status.attack-1);
        if (status.atkProg > 1) {
            this.countAttack(status, config);
        }
        this.processSwingProgress(status, config)

    }

    processAttacks(status, config) {
        status.attacks = config.attacks[ENUMS.getKey('AttackType', status.atkType)]
        if (status.attacks) {
            this.processAttack(status, config);
        }
    }

    updatePieceTurn(status, config, tpf) {
        status.turnProgress -= tpf * config.hasteFactor / config.turnTime;
        if (status.turnProgress < 0) {
            this.processNewTurn(status, config)
        }
        this.processPieceState(status);
        if (status.charState === ENUMS.CharacterState.COMBAT) {
            this.processAttacks(status, config);
        }

    }
    processPieceState(status) {
        if (status.targState === status.charState) return;
        if (status.targState === ENUMS.CharacterState.COMBAT) {
            if (status.charState === ENUMS.CharacterState.IDLE) {
                status.charState = ENUMS.CharacterState.ENGAGING;
            }
        }
        if (status.targState === ENUMS.CharacterState.IDLE) {
            if (status.charState === ENUMS.CharacterState.COMBAT) {
                status.charState = ENUMS.CharacterState.DISENGAGING;
            }
        }
    }
    processGamePieceState(status, config, tpf, time) {
        status.lifetime += tpf;
        this.updatePieceTurn(status, config, tpf)
    }

}

export { PieceStateProcessor }