import {ScenarioStatic} from "./ScenarioStatic.js";
import {ScenarioDynamic} from "./ScenarioDynamic.js";

class GameScenario {
    constructor(eArgs) {
        this.scenarioId = eArgs.scenarioId || 'scenario_id_default'
        this.scenarioTime = 0;
        this.isActive = true;
        this.staticScenario = new ScenarioStatic(eArgs);
        this.dynamicScenario = new ScenarioDynamic(eArgs);

        eArgs.callback(this);
    }

    initGameScenario(eArgs) {
        this.scenarioTime = 0;
        this.staticScenario.initStaticScenario(eArgs)
        this.dynamicScenario.initDynamicScenario((eArgs))
    }

    exitGameScenario(eArgs) {
        this.isActive = false;
        this.staticScenario.exitStaticScenario(eArgs);
        this.dynamicScenario.exitDynamicScenario((eArgs))
    }

    tickGameScenario(frame) {
        this.scenarioTime+=frame.tpf;
        this.dynamicScenario.tickDynamicScenario(frame.tpf, this.scenarioTime);
        this.staticScenario.tickStaticScenario(frame.tpf, this.scenarioTime);
    }

}

export { GameScenario }