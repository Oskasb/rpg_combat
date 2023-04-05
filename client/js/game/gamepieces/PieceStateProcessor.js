class PieceStateProcessor {
    constructor(gamePiece) {
        this.gamePiece = gamePiece;
    }

    processNewTurn(status, config) {
        status.maxAPs = config.maxActPts;
        status.actPts = MATH.clamp(status.actPts+1, 0, status.maxAPs);
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


    activateActionType(status, actionType) {
        let action = this.gamePiece.pieceActionSystem.activateActionOfType(actionType);
        status.action = action.name;
    }

    applyActionProgress(status, config) {
        let action = this.gamePiece.pieceActionSystem.activeAction;
        status.animKey = this.gamePiece.pieceActionSystem.applyPieceActionProgress(action, status.source, status.prep,status.swing, status.recover, status.trTime);
    }
    countAttack(status) {
        status.attack++
        this.activateActionType(status, 'COMBAT');
    }

    processSwingProgress(status, config) {
        let testFrac = config.sourceFraction;

        status.source = MATH.clamp (status.atkProg / config.sourceFraction, 0, 1);
        status.prep = MATH.clamp ((status.atkProg-config.sourceFraction) / config.prepFraction, 0, 1);
        status.swing = MATH.clamp ((status.atkProg-(config.sourceFraction+config.prepFraction)) / config.swingFraction, 0, 1);
        status.recover = MATH.clamp ((status.atkProg-(config.sourceFraction+config.swingFraction+config.prepFraction)) / config.recoverFraction , 0, 1);

        if (status.source < 1) {
            status.trTime = (config.sourceFraction * config.turnTime) / status.attacks
        } else if (status.prep < 1) {
            status.trTime = (config.prepFraction * config.turnTime) / status.attacks
        } else if (status.swing < 1) {
            status.trTime = (config.swingFraction * config.turnTime) / status.attacks
        } else {
            status.trTime = (config.recoverFraction * config.turnTime) / status.attacks
        }

        this.applyActionProgress(status, config);

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
        this.processPieceState(status, config);
        if (status.charState === ENUMS.CharacterState.COMBAT) {
            this.processAttacks(status, config);
        }
    }

    applyCombatStatusTransition(status, config) {
        let actionKey = ENUMS.getKey('CharacterState', status.charState);
        this.activateActionType(status, actionKey)
        status.prep = 0.5;
        status.trTime = status.turnProgress * config.turnTime * 0.5 + 0.1;
        this.applyActionProgress(status, config);
    }

    processPieceState(status, config) {
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

        this.applyCombatStatusTransition(status, config)
    }
    processGamePieceState(status, config, tpf, time) {
        status.lifetime += tpf;
        this.updatePieceTurn(status, config, tpf)
    }

}

export { PieceStateProcessor }