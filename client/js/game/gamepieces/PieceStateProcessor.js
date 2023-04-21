class PieceStateProcessor {
    constructor(gamePiece) {
        this.gamePiece = gamePiece;
    }

    processEngagingTarget(status) {
        if ((status.targState === ENUMS.CharacterState.COMBAT) || (status.charState === ENUMS.CharacterState.ENGAGING) ) {
            return;
        } else {
       //     console.log("targ state ENGAGING")
            status.charState = ENUMS.CharacterState.ENGAGING;
        }
    }

    processCombatTarget(status) {
        if  (status.charState === ENUMS.CharacterState.ENGAGING) {
            if (status.targState !== ENUMS.CharacterState.COMBAT) {
             //   console.log("targ state COMBAT")
                status.targState = ENUMS.CharacterState.COMBAT;
            }
        }
    }

    processDisengagingTarget(status) {
        if ((status.charState === ENUMS.CharacterState.COMBAT) || (status.charState === ENUMS.CharacterState.ENGAGING)) {
            if (status.charState !== ENUMS.CharacterState.DISENGAGING) {
                status.charState = ENUMS.CharacterState.DISENGAGING;
                status.targState = ENUMS.CharacterState.IDLE_HANDS;
        //        console.log("targ state DISENGAGING")
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


        status.turnTime = config.turnTime;
        status.maxAPs = config.maxActPts;
        status.appliedAttacks = 0;
        status.actPts = MATH.clamp(status.actPts+1, 0, status.maxAPs);
        status.turn = GameAPI.gameMain.turnStatus.turn;
        status.turnProgress = GameAPI.gameMain.turnStatus.turnProgress;

        status.charState = status.targState;

        if (MATH.isEvenNumber(GameAPI.getTurnStatus().turn)){
            status.turnAttacks = Math.ceil(status.FAST);
        } else {
            status.turnAttacks = Math.floor(status.FAST);
        }


        let target = status.gamePiece.getTarget()
        if (target) {
            if (target.isDead) {
                status.gamePiece.clearEngagementStatus()
                this.gamePiece.threatDetector.updateScenarioThreat();
                console.log("It is dead, dont do it", status)
                return;
            }
        } else {
            if (status.hp < status.maxHP) {
                status.hp = MATH.clamp(Math.floor(status.hp+status.level*1.5), status.hp, status.maxHP);
            }
        }



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
        //    console.log("NO ACTION: ", status, this.gamePiece.pieceActionSystem)
            action = this.gamePiece.pieceActionSystem.activeAction;
            //return;
        }
        status.animKey = this.gamePiece.pieceActionSystem.applyPieceActionProgress(action, status.source, status.prep,status.swing, status.recover, status.trTime);
    }
    countAttack(status) {
        status.attack++
        this.activateActionType(status, 'COMBAT');
    }


    clearCombatState(status) {

        status.combatTarget = null;
        status.engagingTarget = null;
        status.selectedTarget = null;
        status.disengagingTarget = null;
        status.atkType = ENUMS.AttackType.NONE;
        status.trgAtkType = ENUMS.AttackType.NONE;
        status.charState = ENUMS.CharacterState.IDLE_HANDS;
        status.targState = ENUMS.CharacterState.IDLE_HANDS;
        // status.atkProg = 0;
        status.attacks = 0;
        status.attack = 0;
    }
    applyTargetIsDead(status, target) {
        let newTarget = status.gamePiece.notifyOpponentKilled(target)
        if (!newTarget) {
            status.gamePiece.combatSystem.disengageTarget(status.gamePiece.getTarget());
            this.clearCombatState(status)
        }

        if (status.gamePiece === GameAPI.getMainCharPiece()) {
            evt.dispatch(ENUMS.Event.MAIN_CHAR_SELECT_TARGET, {piece:null, value:false });

            status.xp += status.xp_value;
            if (status.levels[status.level] < status.xp) {
                status.xp -= status.levels[status.level]
                status.level++;
            }

            evt.dispatch(ENUMS.Event.MAIN_CHAR_STATUS_EVENT,
                {
                    targetKey:'xp_progress',
                    min:0,
                    max:status.levels[status.level],
                    current:status.xp
                })
        }
    }

    applyAttackSwingDamage(status) {
        status.appliedAttacks++;
        if (!status.combatTarget) {
            status.combatTarget = status.engagingTarget;
        }
        let combatTarget = status.combatTarget;
        combatTarget.setStatusValue('hp', combatTarget.getStatusByKey('hp') - status['dmg']);

        if (combatTarget.getStatusByKey('hp') > 0) {

        } else {
            this.applyTargetIsDead(status, combatTarget);
        }

    }

    processSwingProgress(status, config) {

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
            if(status.appliedAttacks < status.attack) {
                this.applyAttackSwingDamage(status);
            }
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
        status.attacks = status.turnAttacks;
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
            let opponentPiece = status.gamePiece.getTarget();
            status.gamePiece.applyPieceDeadStatus();
            if (status.charState !== ENUMS.CharacterState.LIE_DEAD) {
                status.charState = ENUMS.CharacterState.LIE_DEAD;
                status.gamePiece.movementPath.cancelMovementPath();

                let tile = status.gamePiece.movementPath.getTileAtPos(status.gamePiece.getPos())
                tile.setTileStatus('FREE');
                this.activateActionType(status, ENUMS.getKey('CharacterState', status.charState))
                this.updatePieceTurn(status, config)
                status.targState = ENUMS.CharacterState.LIE_DEAD;
                status.charState = ENUMS.CharacterState.LIE_DEAD;
                if (status.gamePiece === GameAPI.getMainCharPiece()) {

                    evt.dispatch(ENUMS.Event.ADVANCE_ENVIRONMENT,  {envId:'player_dead', time:20});
                    evt.dispatch(ENUMS.Event.MAIN_CHAR_SELECT_TARGET, {piece:null, value:false });
                    setTimeout(function() {
                        evt.dispatch(ENUMS.Event.MAIN_CHAR_RETURN_HOME, status.gamePiece);
                    }, 3000)

                } else {
                    status.gamePiece.character.deactivateCharIndicator();
                    GameAPI.inactivateWorldPiece(status.gamePiece);
                }
            }

            if (opponentPiece) {
                opponentPiece.notifyOpponentKilled(status.gamePiece);
            }
        }
    }

    processGamePieceState(status, config, tpf, time) {
        if (status.charState === ENUMS.CharacterState.LIE_DEAD) {
            console.log("Dead cant fight, no need to update")
            return;
        }
        status.pauseProgress = GameAPI.gameMain.turnStatus.pauseProgress;
        status.autoPause = GameAPI.gameMain.turnStatus.autoPause;
        status.lifetime += tpf;
        this.updateHealthStatus(status, config)
    }

}

export { PieceStateProcessor }