import { GameScenario}  from "./gameworld/GameScenario.js";

class GameMain {
    constructor() {
        this.activeScenario = {};
        this.callbacks = {}
    }

    setupCallbacks = function() {
        let callbacks = this.callbacks;
        let _this = this;

        callbacks.activateScenario = function(eArgs) {
            _this.initGameScenario(eArgs)
        };
        callbacks.deActivateScenario = function(eArgs) {
            _this.closeGameScenario(eArgs)
        };
        callbacks.updateGameFrame = function(frame) {
            _this.updateGameMain(frame)
        }

    };


    initGameMain() {
        this.setupCallbacks()
        evt.on(ENUMS.Event.SCENARIO_ACTIVATE, this.callbacks.activateScenario);
        evt.on(ENUMS.Event.SCENARIO_CLOSE, this.callbacks.deActivateScenario);
        evt.on(ENUMS.Event.FRAME_READY, this.callbacks.updateGameFrame)
    }

    initGameScenario(eArgs) {
        if (this.activeScenario.isActive) {

            console.log("Game Scenario already active... cancelling it")
            this.closeGameScenario(eArgs);
            return;
        }
        this.activeScenario = new GameScenario(eArgs);
        this.activeScenario.initGameScenario(eArgs)
    }

    closeGameScenario(eArgs) {
        if (!this.activeScenario) {
            console.log("No Game Scenario active... cancelling")
            return;
        }

        this.activeScenario.exitGameScenario(eArgs);
    }

    updateGameMain(frame) {
        if (this.activeScenario.isActive) {
            this.activeScenario.tickGameScenario(frame);
        }
    }

}

export {GameMain};