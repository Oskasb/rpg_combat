import { GameScenario}  from "./gameworld/GameScenario.js";

class GameMain {
    constructor() {
        this.activeScenarios = [];
        this.callbacks = {};
        this.playerCharacters = []
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
        this.setupCallbacks();
        evt.on(ENUMS.Event.SCENARIO_ACTIVATE, this.callbacks.activateScenario);
        evt.on(ENUMS.Event.SCENARIO_CLOSE, this.callbacks.deActivateScenario);
        evt.on(ENUMS.Event.FRAME_READY, this.callbacks.updateGameFrame)
    }

    initGameScenario(eArgs) {

        for (let i = 0; i < this.activeScenarios.length; i++) {
            let scenario = this.activeScenarios[i];
            if (scenario.scenarioId !== eArgs.scenarioId) {
                this.closeGameScenario(eArgs);
            } else {
                console.log("Game Scenario already active... cancelling change")
                return;
            }
        }

        let scenario = new GameScenario(eArgs);
        scenario.initGameScenario(eArgs);
        this.activeScenarios.push(scenario);
    }

    closeGameScenario(eArgs) {
        if (this.activeScenarios.length === 0) {
            console.log("No Game Scenario active... cancelling")
            return;
        }

        let scenario = this.activeScenarios.pop();
        scenario.exitGameScenario(eArgs);
    }

    updateGameMain(frame) {
        for (let i = 0; i < this.activeScenarios.length; i++) {
            let scenario = this.activeScenarios[i];
            if (scenario.isActive) {
                scenario.tickGameScenario(frame);
            }
        }

    }

}

export {GameMain};