import { PieceAction } from "./PieceAction.js";

class PieceActionSystem {
    constructor() {
        this.actions = {}
        this.gamePiece = null;
        this.activeAction = null;
    }

    initPieceActionSystem(gamePiece, rigData) {
        this.gamePiece = gamePiece;
        let actions = this.actions;
        let addActionGroup = function(actionList, data) {
            for (let i = 0; i < data.length; i++) {
                actionList.push(new PieceAction(data[i]))
            }
        }

        for (let key in rigData['action_maps']) {
            actions[key] = [];
            addActionGroup(actions[key], rigData['action_maps'][key])
        }

        console.log("Action System ", this);
    }

    activateActionOfType(actionType, actionName) {
        let pieceAction = this.getPieceActionOfType(actionType, actionName);
        pieceAction.activatePieceAction();
        this.activeAction = pieceAction;
        return pieceAction;
    }

    getPieceActionOfType(actionType, name) {
        if (name) {
            return MATH.getFromArrayByKeyValue(this.actions[actionType], 'name', name);
        } else {
            return MATH.getRandomArrayEntry(this.actions[actionType])
        }
    }

    applyPieceActionProgress(pieceAction, init, active, end, duration) {
        let animKey = pieceAction.updatePieceActionState(init, active, end);

        if (!this.gamePiece.getPlayingAnimation(animKey)) {
            this.gamePiece.applyPieceAnimationState(animKey, duration)
        }
        return animKey;
    }

}

export { PieceActionSystem }