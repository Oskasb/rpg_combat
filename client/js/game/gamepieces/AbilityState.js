

class AbilityState {
    constructor(gamePiece, pieceAbility) {
        this.pieceAbility = pieceAbility;
        this.gamePiece = gamePiece;
        this.isActive = false;
        this.castCompleted = false;
        this.activationTime = 0;
        this.castCompletedTime = 0;
        this.castTime = pieceAbility.config['cast_time'] || 0.2;
        this.applyTime = pieceAbility.config['apply_time'] || 0.5;
        this.cooldownTime = pieceAbility.config['cooldown_time'] || 0.5;
        this.apCost = pieceAbility.config['ap_cost'] || 2;
        this.castProgress = 0;
        this.cooldownProgress = 0;
        this.isAvailable = false;
        this.isAutoCasting = false;


        let isActivated = function() {
            return this.isActive
        }.bind(this);

        let getProgressStatus = function() {
            return this.castProgress
        }.bind(this);

        let getCooldownStatus = function() {
            return this.cooldownProgress
        }.bind(this);

        let getIsAvailable = function() {
            return this.isAvailable;
        }.bind(this);

        let getAutoCast = function() {
            return this.isAutoCasting;
        }.bind(this);

        let tickAbilityState = function(tpf, gameTime) {
            this.updateAbilityState(tpf, gameTime);
        }.bind(this)

        let setAutocast = function(bool) {
            this.isAutoCasting = bool;
        }.bind(this)

        let setAbilityTarget = function(target) {
            this.abilityTarget = target;
        }.bind(this);

        let getAbilityTarget = function(target) {
            return this.abilityTarget;
        }.bind(this);

        this.call = {
            tick:tickAbilityState,
            setAbilityTarget:setAbilityTarget,
            getAbilityTarget:getAbilityTarget,
            setAutocast:setAutocast,
            getProgressStatus:getProgressStatus,
            getCooldownStatus:getCooldownStatus,
            getIsAvailable:getIsAvailable,
            getAutoCast:getAutoCast,
            isActivated:isActivated,
        }
        gamePiece.addPieceUpdateCallback(this.call.tick);
    }

    abilityStateActivated() {
        this.isActive = true;
        this.castCompleted = false;
        this.activationTime = GameAPI.getGameTime();
        this.gamePiece.pieceAbilitySystem.setActiveCastingAbility(this.pieceAbility);
    }

    abilityStateCastCompleted() {
        this.castCompleted = true;
        this.castCompletedTime = GameAPI.getGameTime();
        this.gamePiece.pieceAbilitySystem.completeActiveCastingAbility(this.pieceAbility);
    }

    abilityCooldownCompleted() {
        this.isActive = false;
    }

    updateAbilityStateProgress() {
        let progress = 0;
        let turnTime = GameAPI.getTurnStatus().turnTime;
        if (this.castCompleted === false) {
            progress = MATH.calcFraction(this.activationTime, this.activationTime+this.castTime*turnTime, GameAPI.getGameTime())
            if(progress < 1) {
                this.castProgress = progress;
            } else {
                this.abilityStateCastCompleted()
            }
            this.cooldownProgress = 0;
        } else {
            progress = MATH.calcFraction(this.castCompletedTime, this.castCompletedTime+this.cooldownTime*turnTime, GameAPI.getGameTime())
            this.castProgress = 0;
            if(progress < 1) {
                this.cooldownProgress = 1- progress;
            } else {
                this.abilityCooldownCompleted()
            }
        }
    }

    updateAbilityAvailability() {
        let activeCast = this.gamePiece.pieceAbilitySystem.activeCast;
        if (activeCast !== null) {
            this.isAvailable = false;
        } else {

                if (this.isActive) {
                    this.isAvailable = false;
                } else {
                    if (this.call.getAbilityTarget()) {
                        this.isAvailable = true;
                    } else {
                        this.isAvailable = false;
                }
            }
        }
    }

    updateAbilityState(tpf, gameTime) {
        if (this.isActive) {
            this.updateAbilityStateProgress();
        } else {
            this.pieceAbility.processTargetSelection();
            this.castProgress = 0;
            this.cooldownProgress = 0;

        }
        this.updateAbilityAvailability();

        if (this.isAvailable && this.call.getAutoCast()) {
            console.log("Autocast trigger")
            this.pieceAbility.activatePieceAbility()
        }

    }

}

export { AbilityState }