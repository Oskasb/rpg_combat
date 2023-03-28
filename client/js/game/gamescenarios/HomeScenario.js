import { HomeScenarioUtils } from "./HomeScenarioUtils.js";
import { ScenarioUtils } from "../gameworld/ScenarioUtils.js";

class HomeScenario {
    constructor() {
        this.scenarioUtils = new ScenarioUtils();
        this.instances = [];
        this.homeScenarioUtils = new HomeScenarioUtils()
    }

    initHomeScenario(callback) {
    //    GuiAPI.activatePage('page_scene_home');


        client.treeInstances = [];
        client.particleEffects = [];

        this.homeScenarioUtils.buildGround(2048, 5)
    //    this.homeScenarioUtils.buildForest();

        let assets = [
            "asset_tree_3",
            "asset_tree_2",
            "asset_tree_4",
            "asset_tree_1"
        ];
        let pos = new THREE.Vector3(0, 0, 20)
        let size = new THREE.Vector3(45, 0, 45)

        let instances = this.scenarioUtils.spawnPatch(assets, 15, pos, size, 8, 0.1, 0.1, 7);

        this.homeScenarioUtils.buildStronghold('asset_house_small');

        this.homeScenarioUtils.instances.concat(instances);

        let itemCallback = function(instance) {
            this.sword = instance;
            callback(this);
        }.bind(this);

        this.homeScenarioUtils.buildItem('asset_ninjablade', ThreeAPI.tempVec3.set(-1, 1, 1), ThreeAPI.tempObj.quaternion.set(0, 0, 0, 1), itemCallback);

    };

    exitScenario() {
        this.homeScenarioUtils.exitScenarioUtils()

    };



    tickScenario(tpf, scenarioTime) {
        this.homeScenarioUtils.tickScenarioUtils(tpf, scenarioTime)
    }

}

export { HomeScenario }