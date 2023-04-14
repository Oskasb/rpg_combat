class CombatMovementProcessor {
    constructor(gamePiece) {
        this.gamePiece = gamePiece;
    }



    moveToEngagedTarget(engageTarget) {
        this.gamePiece.setStatusValue('combatTarget', null);
    //    let margin = this.determineAttackRangeMargin(engageTarget)*0.85;
        console.log("Move to Target", engageTarget);
        let onArrive = function(arrive) {
            console.log("Arrive at Target", arrive);
            this.initiateCombat(engageTarget);
        }.bind(this);
        this.gamePiece.movementPath.addPathEndCallback(onArrive);
        this.gamePiece.movementPath.setPathTargetPiece(engageTarget);

    }

    initiateCombat(engageTarget) {
        this.gamePiece.setStatusValue('targState', ENUMS.CharacterState.COMBAT);
        this.gamePiece.setStatusValue('combatTarget', engageTarget);
    }

    determineAttackRangeMargin(engageTarget) {
        let targetSize = engageTarget.getStatusByKey('size')
        let meleeRange = this.gamePiece.getStatusByKey('meleeRange');
        return meleeRange + targetSize + 0.05
    }
    measureAttackRange(engageTarget) {
        let distance = MATH.distanceBetween(this.gamePiece.getPos(), engageTarget.getPos());
        let margin = this.determineAttackRangeMargin(engageTarget);
        let combatRange = this.gamePiece.getStatusByKey('size') + margin;
        return distance < combatRange;
    }
    updateEngagedTarget(engageTarget) {
        if (engageTarget) {
            this.gamePiece.getSpatial().turnTowardsPos(engageTarget.getPos());
            let isInRange = this.measureAttackRange(engageTarget)
            if (isInRange) {
                this.initiateCombat(engageTarget);
                this.moveToEngagedTarget(engageTarget);
            } else {
                this.moveToEngagedTarget(engageTarget);
            }
        }
    }

}

export { CombatMovementProcessor }