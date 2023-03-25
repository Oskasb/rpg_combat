import {ScenarioStatic} from "./ScenarioStatic.js";

class GameScenario {
    constructor(eArgs) {
        this.scenarioId = eArgs.scenarioId || 'scenario_id_default'
        this.scenarioTime = 0;
        this.isActive = true;
        eArgs.callback(this);

        this.instances = [];
        this.effects = [];
        this.staticScenario = new ScenarioStatic(eArgs);
    }

    initGameScenario() {
        this.scenarioTime = 0;
        this.staticScenario.initStaticScenario()
    }

    updateGameScenario() {
        ThreeAPI.setCameraPos(
            Math.cos(this.scenarioTime*0.2)*3+5,
            Math.sin(this.scenarioTime*0.4)*1+11,
            Math.sin(this.scenarioTime*0.2)*3-32
        );

        ThreeAPI.cameraLookAt(0, 0, 0);
    }

    exitGameScenario(eArgs) {
        this.isActive = false;
        this.staticScenario.exitStaticScenario();
    }

    tickGameScenario(frame) {
        this.scenarioTime+=frame.tpf;
        this.staticScenario.tickStaticScenario(frame.tpf, this.scenarioTime);
        this.updateGameScenario()
    }

}

export { GameScenario }