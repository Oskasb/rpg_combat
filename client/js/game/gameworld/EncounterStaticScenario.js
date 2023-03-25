class EncounterStaticScenario {
    constructor() {
        this.instances = [];
    }

    initEncounterStaticScenario(eArgs) {
        this.scenarioStaticId = eArgs.scenarioStaticId;

        let config = {};
        let dataKey = "encounter_scenarios";

        let onConfig = function(config) {
            this.applyScenarioConfig(config);
        }.bind(this)

        let onEncData = function(configData) {
            let data = configData.data;
            for (let i = 0; i < data.length; i++) {
                if (data[i].id === eArgs.scenarioStaticId) {
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



    applyScenarioConfig(config) {
        let envArgs = [];
        envArgs[0] = 0;
        envArgs[1] = 20;
        envArgs[2] = config.environment;
        let boxGrid = config.box_grid;
        evt.dispatch(ENUMS.Event.ADVANCE_ENVIRONMENT, envArgs);

        let instances = this.instances;

        let iconKeysCave = [
            "gravel",
            "rock_layers",
            "rock_stripes",
            "rock_rusty"
        ];

        let iconSprites = GuiAPI.getUiSprites("box_tiles_8x8");
        let setupFloorGrid = function(boxSize, gridWidth, gridDepth) {

            let offset = boxSize*gridWidth;

            for (let i = 0; i < gridWidth; i++) {

                for (let j = 0; j < gridDepth; j++) {

                    let addBox = function(instance) {
                        instances.push(instance)
                        instance.setActive(ENUMS.InstanceState.ACTIVE_VISIBLE);
                        instance.spatial.setPosXYZ(2*boxSize*i -offset, -boxSize, 2*boxSize*j - offset);
                        instance.spatial.setScaleXYZ(boxSize*0.02, boxSize*0.02, boxSize*0.02)
                        let iconSprite = iconSprites[iconKeysCave[Math.floor(Math.random()*iconKeysCave.length)]];
                        instance.setSprite(iconSprite);
                    };

                    client.dynamicMain.requestAssetInstance('asset_box', addBox)
                }
            }

        };

        setupFloorGrid(boxGrid['box_size'], boxGrid['grid_width'], boxGrid['grid_depth'])

    }

    exitScenario() {
        let instances = this.instances;
        while (instances.length) {
            let instance = instances.pop();
            instance.decommissionInstancedModel();
        }
    };

    tickScenario(tpf, scenarioTime) {

    }

}

export { EncounterStaticScenario }