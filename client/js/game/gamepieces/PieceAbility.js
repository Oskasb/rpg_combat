import * as CombatEffects from "./../combat/CombatEffects.js";

class PieceAbility {
    constructor(gamePiece, abilityId, config) {
        this.gamePiece = gamePiece;
        this.abilityId = abilityId;
        this.config = config;
        this.abilityStatus = {};

        let activateAbility = function() {
            this.activatePieceAbility()
        }.bind(this)

        this.call = {
            activatePieceAbility:activateAbility,
            updateActivatedAbility:this.updateActivatedAbility
        }

    }

    setAbilityStatus(abilityStatus) {
        for (let key in abilityStatus) {
            this.abilityStatus[key] = abilityStatus[key];
        }
    }

    activatePieceAbility() {
        console.log("Call Activate Ability", this);
    //    GameAPI.registerGameUpdateCallback(this.call.updateActivatedAbility)
        this.gamePiece.setStatusValue('activeAbility', this)
    }

    updateActivatedAbility() {

    }

    applyAbilityToTarget(target) {

        CombatEffects.fireBallEffect(target, 25)
        this.gamePiece.setStatusValue('activeAbility', null)
    }

}

export { PieceAbility }