class CombatTargetProcessor {
    constructor() {}

    applyTargetSelection(gamePiece) {
        let selectedTargetPiece = gamePiece.getStatusByKey('selectedTarget');
        let combatTarget = gamePiece.getStatusByKey('combatTarget');
        if (selectedTargetPiece !== null) {
            gamePiece.setStatusValue('disengagingTarget', null);
            if (selectedTargetPiece !== combatTarget) {
                gamePiece.setStatusValue('combatTarget', selectedTargetPiece);
                gamePiece.setStatusValue('engagingTarget', selectedTargetPiece);
            } else {
                // maintaining selection on current Combat target
            }
        } else {
            if (combatTarget !== null) {
                gamePiece.setStatusValue('disengagingTarget', combatTarget);
                gamePiece.setStatusValue('combatTarget', null);
            }
            gamePiece.setStatusValue('engagingTarget', null);
        }
    }

    updateCombatTarget(gamePiece) {
        this.applyTargetSelection(gamePiece)
    }

}

export { CombatTargetProcessor }