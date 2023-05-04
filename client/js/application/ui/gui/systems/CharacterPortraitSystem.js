import { GuiCharacterPortrait } from "../widgets/GuiCharacterPortrait.js";
import {CharacterAbilityGui} from "../game/CharacterAbilityGui.js";

class CharacterPortraitSystem {
    constructor() {
    }

    createPortrait(gamePiece, layoutConfId, onActivate, testActive, x, y, onReady) {
       return new GuiCharacterPortrait(gamePiece, layoutConfId, onActivate, testActive, x, y, onReady)
    }

    createLeaderActionBar(gamePiece) {
        return gamePiece.getCharacter().activateCharAbilityGui();
    }

    createCompanionActionBar(gamePiece) {
        return gamePiece.getCharacter().activateCharAbilityGui();
    }

}

export { CharacterPortraitSystem }