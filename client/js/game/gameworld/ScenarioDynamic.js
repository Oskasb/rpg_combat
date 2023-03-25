import { EncounterDynamicScenario } from "./EncounterDynamicScenario.js";

class ScenarioDynamic {
    constructor(eArgs) {
        this.dynamicScenarioId = eArgs.scenarioDynamicId;
        this.loadedDynamicScenarios = [];
    }

    initDynamicScenario(eArgs) {
        let dynamicScenario = new EncounterDynamicScenario(eArgs)
        dynamicScenario.initEncounterDynamicScenario(eArgs);
        this.loadedDynamicScenarios.push(dynamicScenario);
    }

    exitDynamicScenario(eArgs) {
        let dynamicScenarioIdToClose = eArgs.dynamicScenarioId;
        let dynamicScenario = this.loadedDynamicScenarios.pop();
        if (dynamicScenario.staticScenarioId === dynamicScenarioIdToClose) {
            dynamicScenario.exitScenario();
        } else {
            console.log("Wrong dynamic scenario Id, look for error plz")
        }
    }

    tickDynamicScenario(tpf, scenarioTime) {
        for (let i = 0; i < this.loadedDynamicScenarios.length; i++) {
            this.loadedDynamicScenarios[i].tickScenario(tpf, scenarioTime);
        }
    }
}

export {ScenarioDynamic}