import { EncounterDynamicScenario } from "../gamescenarios/EncounterDynamicScenario.js";

class ScenarioDynamic {
    constructor(scenarioDynamicId) {
        this.dynamicScenarioId = scenarioDynamicId;
        this.loadedDynamicScenarios = [];
    }

    initDynamicScenario(onReadyCB) {
        let dynamicScenario = new EncounterDynamicScenario();
        this.loadedDynamicScenarios.push(dynamicScenario);
        dynamicScenario.initEncounterDynamicScenario(this.dynamicScenarioId, onReadyCB);
    }

    dynamicScenarioActivate() {
        for (let i = 0; i < this.loadedDynamicScenarios.length; i++) {
            this.loadedDynamicScenarios[i].activateEncDynScenario();
        }
    }

    exitDynamicScenario() {
        let dynamicScenario = this.loadedDynamicScenarios.pop();
        if (dynamicScenario) {
            dynamicScenario.exitScenario();
        } else {
            console.log("No dynamic scenario, look for error plz")
        }
    }

    tickDynamicScenario(tpf, scenarioTime) {
        for (let i = 0; i < this.loadedDynamicScenarios.length; i++) {
            this.loadedDynamicScenarios[i].tickScenario(tpf, scenarioTime);
        }
    }
}

export {ScenarioDynamic}