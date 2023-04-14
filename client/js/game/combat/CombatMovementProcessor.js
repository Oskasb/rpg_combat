class CombatMovementProcessor {
    constructor(gamePiece) {
        this.gamePiece = gamePiece;
    }



    moveToEngagedTarget(engageTarget) {
        this.gamePiece.setStatusValue('combatTarget', null);
        let margin = this.determineAttackRangeMargin(engageTarget)*0.85;
        let onArrive = function(arrive) {
            console.log("Arrive at Target", arrive);
            this.initiateCombat(engageTarget);
        }.bind(this);
        this.gamePiece.movementPath.determinePathToTarget(engageTarget);
        this.gamePiece.movementPath.moveAlongActiveGridPath(onArrive);
    //    let travelTime = this.gamePiece.getStatusByKey('turnTime') * this.gamePiece.getStatusByKey('turnProgress') * 0.5
    //    this.gamePiece.pieceMovement.moveToTargetAtTime('walk', this.gamePiece.getPos(), engageTarget.getPos(), travelTime, onArrive, margin)
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