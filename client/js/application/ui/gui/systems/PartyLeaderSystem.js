import { CharacterPortraitSystem } from "./CharacterPortraitSystem.js";

let characterPortraitSystem = new CharacterPortraitSystem();
let gamePiece = null;
let mainPortrait = null;
let companionPortraits = [];
let partyLeaderActive = false;
let callbacks;
let activatedCompanion = null;

let letCompanionLayout = 'widget_companion_portrait_button';
let mainCharPortraitLayout = 'widget_main_portrait_button';

let clearCompanionPortraits = function() {
    while (companionPortraits.length) {
        companionPortraits.pop().guiWidget.recoverGuiWidget()
    }
}

let notifyButtonStatechange = function() {
    mainPortrait.updatePortraitInteractiveState();
    for (let i = 0 ; i < companionPortraits.length; i++) {
        companionPortraits[i].updatePortraitInteractiveState();
    }
}

let addCompanionPortrait = function(companion, index) {

    let activateCompanion = function(companion) {

        if (activatedCompanion === companion) {
            activatedCompanion = null;
        } else {
            activatedCompanion = companion;
        //    activeCompanionIndex = index
        }
        notifyButtonStatechange()
        console.log("activate companion", companion)
    }

    let testActive = function(companion) {
        if (activatedCompanion === companion) {
            return true;
        } else {
            return false;
        }
    }

    let onReady = function(portrait) {
        companionPortraits.push(portrait)
    }

    characterPortraitSystem.createPortrait(companion, letCompanionLayout, activateCompanion, testActive, 0.14 -index*0.09, -0.305, onReady)


}

let processCompanions = function(tpf, gameTime) {

    for (let i = 0; i < gamePiece.companions.length; i++) {
        let companion = gamePiece.companions[i];
        if (companionPortraits[i]) {
            if (companionPortraits[i].gamePiece !== companion) {
                clearCompanionPortraits();
            } else {
                companionPortraits[i].updateCharacterPortrait(tpf, gameTime)
            }
        } else {
            console.log("Add companion portrait", companion);
            addCompanionPortrait(companion, i)
        }
    }
}

class PartyLeaderSystem {
    constructor() {

        let pressPartyLeader = function(partyLeader) {
            notifyButtonStatechange();
            partyLeaderActive = !partyLeaderActive;
            console.log("pressPartyLeader", partyLeader)
        }

        let partyLeaderTestActive = function(partyLeader) {
            return partyLeaderActive
        }

        callbacks = {
            pressPartyLeader:pressPartyLeader,
            partyLeaderTestActive:partyLeaderTestActive
        }

    }

    setupPortrait() {

        let onReady = function(button) {
           mainPortrait = button;
            console.log("portrait", button);
        }

        characterPortraitSystem.createPortrait(gamePiece, mainCharPortraitLayout, callbacks.pressPartyLeader, callbacks.partyLeaderTestActive, -0.14, -0.29, onReady)

    }

    clearPartyLeaderSystem() {
        partyLeaderActive = false;
        clearCompanionPortraits();
        mainPortrait.guiWidget.recoverGuiWidget();
    }

    setPartyLeaderPiece(piece) {
        gamePiece = piece;
        this.setupPortrait()
    }

    updatePartyLeaderSystem(tpf, gameTime) {
        if (!mainPortrait) return;
        mainPortrait.updateCharacterPortrait(tpf, gameTime);
        processCompanions(tpf, gameTime);
    }

}

export { PartyLeaderSystem }