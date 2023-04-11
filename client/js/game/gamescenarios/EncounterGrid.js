import {ConfigData} from "../../application/utils/ConfigData.js";
import * as ScenarioUtils from "../gameworld/ScenarioUtils.js";
class EncounterGrid {
    constructor() {
        this.instances = [];
        this.configData = new ConfigData("GRID", "ENCOUNTER_GRIDS",  'grid_main_data', 'data_key', 'config')
    }

    initEncounterGrid(dataId) {
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
            this.applyGridConfig(config, updateCount);
        }.bind(this)

        this.configData.parseConfig(dataId, onConfig)
    }

    applyGridConfig(config) {
        ScenarioUtils.setupEncounterGrid(this.instances, config)
    }
    removeEncounterGrid() {
        let instances = this.instances;
        while (instances.length) {
            let instance = instances.pop();
            instance.decommissionInstancedModel();
        }
    }

}

export { EncounterGrid }