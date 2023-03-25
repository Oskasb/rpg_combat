import {HomeScenario} from "./HomeScenario.js";
import {EncounterStaticScenario} from "./EncounterStaticScenario.js";

class ScenarioStatic {
    constructor(eArgs) {
        this.homeScenarioId = 'home_scenariostatic';
        this.tempObj = new THREE.Object3D();
        this.staticScenarioId = eArgs.scenarioStaticId; // || 'home_scenariostatic'
        this.loadedStatisScenarios = [];
    }

    initStaticScenario(eArgs) {
        let staticScenario;
        if (this.staticScenarioId === this.homeScenarioId) {
            staticScenario = new HomeScenario();
            staticScenario.initHomeScenario();
        } else {
            staticScenario = new EncounterStaticScenario();
            staticScenario.initEncounterStaticScenario(eArgs);
        }

        this.loadedStatisScenarios.push(staticScenario)
    }

    updateStaticScenario(tpf, scenarioTime) {
        for (let i = 0; i < this.loadedStatisScenarios.length; i++) {
            this.loadedStatisScenarios[i].tickScenario(tpf, scenarioTime);
        }
    }

    exitStaticScenario(eArgs) {
        let staticScenarioIdToClose = eArgs.staticScenarioId;
        let staticScenario = this.loadedStatisScenarios.pop();
        if (staticScenario.staticScenarioId === staticScenarioIdToClose) {
            staticScenario.exitScenario();
        } else {
            console.log("Wrong scenario Id, look for error plz")
        }
    }

    tickStaticScenario(tpf, scenarioTime) {
        this.updateStaticScenario(tpf, scenarioTime)
    }

}

export { ScenarioStatic }