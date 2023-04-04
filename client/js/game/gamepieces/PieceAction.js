class PieceAction {
    constructor(actionData) {
        this.name = actionData.name;
        this.init = actionData.init;
        this.active = actionData.active;
        this.end = actionData.end;
        this.activeAction = {
            init:null,
            active:null,
            end:null
        }
        this.currentAnim = null;
    }

    activatePieceAction() {
        this.activeAction = {
            init:MATH.getRandomArrayEntry(this.init),
            active:MATH.getRandomArrayEntry(this.active),
            end:MATH.getRandomArrayEntry(this.end),
        }
    }

    updatePieceActionState(init, active, end) {
        if (init < 1) {
            return this.activeAction.init;
        }
        if (active < 1) {
            return this.activeAction.active;
        }
        return this.activeAction.end;
    }

}

export { PieceAction }