import { GuiCharacterPortrait } from "../widgets/GuiCharacterPortrait.js";

class CharacterPortraitSystem {
    constructor() {
    }

    createPortrait(gamePiece, layoutConfId, onActivate, testActive, x, y, onReady) {
       return new GuiCharacterPortrait(gamePiece, layoutConfId, onActivate, testActive, x, y, onReady)
    }

}

export { CharacterPortraitSystem }