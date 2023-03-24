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
        ThreeAPI.setCameraPos(Math.sin(this.scenarioTime*0.04)*30, 6 + Math.sin(this.scenarioTime*0.7)*2, Math.cos(this.scenarioTime*0.04)*30);
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