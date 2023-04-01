
class EncounterDynamicScenario {
    constructor() {
        this.pieces = [];
    }

    initEncounterDynamicScenario(scenarioDynamicId, onReadyCB) {
        this.scenarioDynamicId = scenarioDynamicId;

        if (!this.scenarioDynamicId) {
        //    console.log("No dynamic scenario, exit...")
            return;
        }

        let config = {};
        let dataKey = scenarioDynamicId;

        let onConfig = function(config) {

            this.applyScenarioConfig(config, onReadyCB);
        }.bind(this)

        let onEncData = function(configData) {
            let data = configData.data;
            for (let i = 0; i < data.length; i++) {
                if (data[i].id === 'dynamic_view_init') {
                    for (let key in data[i].config) {
                        config[key] = data[i].config[key]
                    }
                    onConfig(config);
                }
            }
        };

        let onDataCb = function(src, config) {
        //    console.log("Scenario data: ", config)
            for (let i = 0; i < config.length; i++) {
                if (config[i].id === dataKey) {
                    onEncData(config[i])
                }
            }
        };

        this.config = config;
        PipelineAPI.cacheCategoryKey("WORLD", "WORLD_DYNAMIC", onDataCb)
    }

    activateEncDynScenario() {
        GuiAPI.activatePage(this.config['gui_page']);
    }

    applyScenarioConfig = function(config, onReadyCB) {
        GuiAPI.activatePage(null);

        evt.dispatch(ENUMS.Event.ADVANCE_ENVIRONMENT,  {envId:config['environment'], time:50, callback:onReadyCB});

    //    let pos = this.config.camera.pos;
    //    let lookAt = this.config.camera.lookAt;

        let pieces = this.pieces;

        let pieceInstanceCallback = function(gamePiece) {
            this.pieces.push(gamePiece);
            GameAPI.addPieceToWorld(gamePiece);
            GameAPI.registerGameUpdateCallback(gamePiece.getOnUpdateCallback());
        };

        if(config.spawn) {
            for (let i = 0; i < config.spawn.length; i++) {
                GameAPI.createGamePiece(config.spawn[i], pieceInstanceCallback)
            }
        }

    };

    updateScenarioPieces(tpf, scenarioTime) {

    };

    exitScenario() {
        while (this.pieces.length) {
            GameAPI.takePieceFromWorld(this.pieces.pop())
        }
    };

    tickScenario(tpf, scenarioTime) {

        if (!this.config) {
            return;
        }

        this.updateScenarioPieces(tpf, scenarioTime);



    //    ThreeAPI.setCameraPos(pos[0] + Math.sin(scenarioTime*0.3)*0.5, pos[1], pos[2]+ Math.cos(scenarioTime*0.15)*0.5);
    //    ThreeAPI.cameraLookAt(lookAt[0] + Math.sin(scenarioTime*0.2)*0.5, lookAt[1], lookAt[2]+ Math.cos(scenarioTime*0.1)*0.5)

    }

}

export {EncounterDynamicScenario}