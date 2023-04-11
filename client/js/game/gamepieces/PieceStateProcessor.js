class PieceStateProcessor {
    constructor(gamePiece) {
        this.gamePiece = gamePiece;
    }

    processEngagingTarget(status) {
        if ((status.targState === ENUMS.CharacterState.COMBAT) || (status.charState === ENUMS.CharacterState.ENGAGING) ) {
            return;
        } else {
            console.log("targ state ENGAGING")
            status.charState = ENUMS.CharacterState.ENGAGING;
        }
    }

    processCombatTarget(status) {
        if  (status.charState === ENUMS.CharacterState.ENGAGING) {
            if (status.targState !== ENUMS.CharacterState.COMBAT) {
                console.log("targ state COMBAT")
                status.targState = ENUMS.CharacterState.COMBAT;
            }
        }
    }

    processDisengagingTarget(status) {
        if ((status.charState === ENUMS.CharacterState.COMBAT) || (status.charState === ENUMS.CharacterState.ENGAGING)) {
            if (status.charState !== ENUMS.CharacterState.DISENGAGING) {
                status.charState = ENUMS.CharacterState.DISENGAGING;
                status.targState = ENUMS.CharacterState.IDLE_HANDS;
                console.log("targ state DISENGAGING")
            }
        }

    }

    processNoTarget(status) {
            if (status.charState !== ENUMS.CharacterState.IDLE_HANDS) {
                status.charState = ENUMS.CharacterState.IDLE_HANDS;
                status.targState = ENUMS.CharacterState.IDLE_HANDS;
    //            console.log("targ state IDLE_HANDS")
            }
    }

    processTargetSelection(status, config) {
        let engagingTarget = status.engagingTarget;
        let combatTarget = status.combatTarget;
        let disengagingTarget = status.disengagingTarget;

        if (combatTarget !== null) {
            if (this.gamePiece.combatSystem.testForMeleeRange(this.gamePiece.getStatusByKey('engagingTarget'))) {
                this.processCombatTarget(status);
            }
        }

        if (engagingTarget !== null) {
            this.processEngagingTarget(status);
        }

        if (disengagingTarget !== null) {
            this.processDisengagingTarget(status);
        }

        if ( (engagingTarget === null) && (combatTarget === null) &&  (disengagingTarget === null)) {
            this.processNoTarget(status);
        }

    }

    processNewTurn(status, config) {


        status.xp += config.xpGain;
        evt.dispatch(ENUMS.Event.MAIN_CHAR_STATUS_EVENT,
            {
                targetKey:'xp_progress',
                min:0,
                max:config.levels[status.level],
                current:status.xp
            })
        if (config.levels[status.level] < status.xp) {
            status.xp -= config.levels[status.level]
            status.level++;
        }

        status.turnTime = config.turnTime;
        status.maxAPs = config.maxActPts;
        status.appliedAttacks = 0;
        status.actPts = MATH.clamp(status.actPts+1, 0, status.maxAPs);
        status.turn = GameAPI.gameMain.turnStatus.turn;
        status.turnProgress = GameAPI.gameMain.turnStatus.turnProgress;

        status.charState = status.targState;

        this.gamePiece.combatSystem.combatTargetProcessor.updateCombatTarget(this.gamePiece);
        this.gamePiece.combatSystem.engageTarget(this.gamePiece.getStatusByKey('engagingTarget'));

        status.charState = status.targState;


        if (status.charState === ENUMS.CharacterState.COMBAT) {
            status.atkType = status.trgAtkTyp;
            status.attack = 1;
        } else {
            status.attack = 0;
            status.atkType = ENUMS.AttackType.NONE;
        }

        this.gamePiece.threatDetector.updateScenarioThreat();
        this.gamePiece.combatSystem.updateCombatTurnTick()

    }


    activateActionType(status, actionType) {
//        console.log("Activate Action: ", actionType)
        let action = this.gamePiece.pieceActionSystem.activateActionOfType(actionType);
        status.action = action.name;
    }

    applyActionProgress(status, config) {
        let action = this.gamePiece.pieceActionSystem.activeAction;
        if (!action) {
            this.activateActionType(status, ENUMS.getKey('CharacterState', status.charState))
            console.log("NO ACTION: ", status, this.gamePiece.pieceActionSystem)
            action = this.gamePiece.pieceActionSystem.activeAction;
            //return;
        }
        status.animKey = this.gamePiece.pieceActionSystem.applyPieceActionProgress(action, status.source, status.prep,status.swing, status.recover, status.trTime);
    }
    countAttack(status) {
        status.attack++
        this.activateActionType(status, 'COMBAT');
    }


    applyTargetIsDead(status, target) {
        status.combatTarget = null;
        status.engagingTarget = null;
        status.selectedTarget = null;
        status.atkType = ENUMS.AttackType.NONE;
        status.trgAtkType = ENUMS.AttackType.NONE;
        status.charState = ENUMS.CharacterState.IDLE_HANDS;
        status.targState = ENUMS.CharacterState.IDLE_HANDS;
    }

    applyAttackSwingDamage(status) {
        status.appliedAttacks++;
        let combatTarget = status.combatTarget;
        combatTarget.setStatusValue('hp', combatTarget.getStatusByKey('hp') - status['dmg']);

        if (combatTarget.getStatusByKey('hp') > 0) {

        } else {
            this.applyTargetIsDead(status);
        }

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
            if(status.appliedAttacks < status.attack) {
                this.applyAttackSwingDamage(status);
            }

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

    updatePieceTurn(status, config) {
        status.turnProgress = GameAPI.gameMain.turnStatus.turnProgress;
        if (status.turn !== GameAPI.gameMain.turnStatus.turn) {
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

        status.maxHP = status.maxHP || config.maxHP;
        if (status.targState === status.charState) return;

        this.applyCombatStatusTransition(status, config)
    }

    updateHealthStatus(status, config) {
        if (status.hp > 0) {
            this.processTargetSelection(status, config);
            this.updatePieceTurn(status, config)
        } else {
            status.combatTarget = null;
            status.engagingTarget = null;
            status.selectedTarget = null;
            status.disengageTarget = null;
            if (status.charState !== ENUMS.CharacterState.LIE_DEAD) {
                status.charState = ENUMS.CharacterState.LIE_DEAD;
                this.activateActionType(status, ENUMS.getKey('CharacterState', status.charState))
                this.updatePieceTurn(status, config)
                if (status.gamePiece === GameAPI.getActivePlayerCharacter().gamePiece) {

                    evt.dispatch(ENUMS.Event.ADVANCE_ENVIRONMENT,  {envId:'player_dead', time:20});

                    setTimeout(function() {
                        evt.dispatch(ENUMS.Event.MAIN_CHAR_RETURN_HOME, status.gamePiece);
                    }, 3000)

                }
            }
        }
    }

    processGamePieceState(status, config, tpf, time) {
        status.lifetime += tpf;
        this.updateHealthStatus(status, config)
    }

}

export { PieceStateProcessor }