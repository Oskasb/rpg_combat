class EncounterDynamicScenario {
    constructor() {

    }

    initEncounterDynamicScenario(eArgs) {
        this.scenarioDynamicId = eArgs.scenarioDynamicId;

        if (!this.scenarioDynamicId) {
            console.log("No dynamic scenario, exit...")
            return;
        }

        let config = {};
        let dataKey = "encounter_scenarios_dynamic";

        let onConfig = function(config) {
            this.applyScenarioConfig(config);
        }.bind(this)

        let onEncData = function(configData) {
            let data = configData.data;
            for (let i = 0; i < data.length; i++) {
                if (data[i].id === eArgs.scenarioDynamicId) {
                    for (let key in data[i].config) {
                        config[key] = data[i].config[key]
                    }
                    onConfig(config);
                }
            }
        };

        let onDataCb = function(src, config) {
            console.log("Scenario data: ", eArgs, config)
            for (let i = 0; i < config.length; i++) {
                if (config[i].id === dataKey) {
                    onEncData(config[i])
                }
            }
        };

        this.config = config;
        PipelineAPI.subscribeToCategoryKey("WORLD", "STATIC_SCENARIOS", onDataCb)
    }

    applyScenarioConfig = function(config) {



    }

    exitScenario() {

    }

    tickScenario(tpf, scenarioTime) {

        ThreeAPI.setCameraPos(
            Math.cos(scenarioTime*0.2)*3+5,
            Math.sin(scenarioTime*0.4)*1+11,
            Math.sin(scenarioTime*0.2)*3-32
        );

        ThreeAPI.cameraLookAt(0, 0, 0);

    }

}

export {EncounterDynamicScenario}