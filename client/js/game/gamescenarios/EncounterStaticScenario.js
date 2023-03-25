class EncounterStaticScenario {
    constructor() {
        this.instances = [];
    }

    initEncounterStaticScenario(eArgs) {
        this.scenarioStaticId = eArgs.scenarioStaticId;

        let config = {};
        let dataKey = "encounter_scenarios_static";

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
        //    console.log("Scenario data: ", eArgs, config)
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
        let boxGrid = config.box_grid;
        evt.dispatch(ENUMS.Event.ADVANCE_ENVIRONMENT,  {envId:config.environment, time:1});

        let instances = this.instances;

        let iconKeysCave = [
            "gravel",
            "rock_layers",
            "rock_stripes",
            "rock_rusty"
        ];

        let iconSprites = GuiAPI.getUiSprites("box_tiles_8x8");

        let groundReturns = function(box) {
            box.spatial.setPosXYZ(0, -1, 0)
            box.spatial.setScaleXYZ(50, 0.01, 50);
            box.setSprite(iconSprites['mud']);
            this.instances.push(box);
        }.bind(this);

        client.dynamicMain.requestAssetInstance('asset_box', groundReturns)


        let setupGrid = function(boxSize, gridWidth, gridDepth, wallHeight) {

            let offset = boxSize*gridWidth;

            for (let i = 0; i < gridWidth; i++) {

                for (let j = 0; j < gridDepth; j++) {

                    let wallOffsetX = 0;
                    let wallOffsetY = 0;
                    let floorOffset = 0;

                    let iconSprite = iconSprites[iconKeysCave[Math.floor(Math.random()*iconKeysCave.length)]];

                    let addSceneBox = function(instance) {
                        instances.push(instance)
                        instance.setActive(ENUMS.InstanceState.ACTIVE_VISIBLE);
                        instance.spatial.setPosXYZ(
                            2*boxSize*i - offset + wallOffsetX,
                            -boxSize + floorOffset,
                            2*boxSize*j - offset + wallOffsetY
                        );
                        instance.spatial.setScaleXYZ(boxSize*0.02, boxSize*0.02, boxSize*0.02)
                        instance.setSprite(iconSprite);
                    };

                    client.dynamicMain.requestAssetInstance('asset_box', addSceneBox)

                    for (let floor = 0; floor < wallHeight; floor++) {
                        let add = false;

                        wallOffsetX = 0;
                        wallOffsetY = 0;
                        floorOffset = 0;

                        if (j === gridDepth-1) {
                            wallOffsetY = boxSize*2  // // - boxSize*2;
                            floorOffset = (boxSize + floor*boxSize)*2
                            client.dynamicMain.requestAssetInstance('asset_box', addSceneBox)
                        }

                        if (i === 0) {
                            wallOffsetX = -boxSize*2;
                            floorOffset = (boxSize + floor*boxSize)*2
                            add = true;
                        }
                        if (i === gridWidth-1) {
                            wallOffsetX = boxSize*2  // // - boxSize*2;
                            floorOffset = (boxSize + floor*boxSize)*2
                            add = true;
                        }

                        if (add) {
                            client.dynamicMain.requestAssetInstance('asset_box', addSceneBox)
                        }

                    }

                }
            }

        };

        setupGrid(boxGrid['box_size'], boxGrid['grid_width'], boxGrid['grid_depth'], boxGrid['wall_height'])

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