class CombatTargetProcessor {
    constructor() {}

    applyTargetSelection(gamePiece) {
        let selectedTargetPiece = gamePiece.getStatusByKey('selectedTarget');
        if (selectedTargetPiece) {
            let combatTarget = gamePiece.getStatusByKey('combatTarget');
            if (selectedTargetPiece !== combatTarget) {
                gamePiece.setStatusValue('engagingTarget', selectedTargetPiece);
            } else {
                // maintaining selection on current Combat target
            }
        } else {
            gamePiece.setStatusValue('engagingTarget', null);
            gamePiece.setStatusValue('combatTarget', null);
        }
    }

    updateCombatTarget(gamePiece) {
        this.applyTargetSelection(gamePiece)
    }

}

export { CombatTargetProcessor }