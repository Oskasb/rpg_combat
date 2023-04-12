import {ConfigData} from "../../application/utils/ConfigData.js";
import * as ScenarioUtils from "../gameworld/ScenarioUtils.js";
class EncounterGrid {
    constructor() {
        this.gridTiles = [];
        this.instances = [];
        this.configData = new ConfigData("GRID", "ENCOUNTER_GRIDS",  'grid_main_data', 'data_key', 'config')
    }

    initEncounterGrid(scenarioGridConfig) {
        let onConfig = function(config, updateCount) {
            //    console.log("Update Count: ", updateCount, config)
            if (updateCount) {
                GuiAPI.printDebugText("REFLOW GRID")
                this.removeEncounterGrid();
            } else {
                setTimeout(function() {
                //    onReady(this);
                }, 0);
            }
            this.applyGridConfig(config, scenarioGridConfig);
        }.bind(this)

        this.configData.parseConfig(scenarioGridConfig['dataId'], onConfig)
    }

    applyGridConfig(config, scenarioGridConfig) {
        ScenarioUtils.setupEncounterGrid(this.gridTiles, this.instances, config, scenarioGridConfig)
    }

    getTileAtPosition(posVec3) {
        return ScenarioUtils.getTileForPosition(this.gridTiles, posVec3)
    }

    removeEncounterGrid() {
        let instances = this.instances;
        while (instances.length) {
            let instance = instances.pop();
            instance.decommissionInstancedModel();
        }
        while (this.gridTiles.length) {
            let col = this.gridTiles.pop()
            while (col.length) {
                let tile = col.pop();
                tile.indicateTileStatus(false);
            }
        }
    }

}

export { EncounterGrid }