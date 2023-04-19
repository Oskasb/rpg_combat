import { CompanionMovement } from "./CompanionMovement.js";

class CompanionSystem {
    constructor(gamePiece) {
        this.gamePiece = gamePiece;
        this.companionMovement = new CompanionMovement(gamePiece);
    }




    updateCompanion(tpf, gameTime) {
        let followingPiece = this.gamePiece.getStatusByKey('following');
        if (!followingPiece) {
            console.log("Companion is not following, broken")
            return;
        }
        this.companionMovement.updateCompanionMovement(followingPiece);

    }

    tickCompanionSystem(tpf, gameTime) {
        this.updateCompanion(tpf, gameTime);
    }

}

export { CompanionSystem }