import { HomeScenarioUtils } from "./HomeScenarioUtils.js";

class HomeScenario {
    constructor() {
        this.instances = [];
        this.homeScenarioUtils = new HomeScenarioUtils()
    }

    initHomeScenario() {
        evt.dispatch(ENUMS.Event.ADVANCE_ENVIRONMENT,  {envId:'high_noon', time:1});

        client.treeInstances = [];
        client.particleEffects = [];

        this.homeScenarioUtils.buildGround(1024, 2)
        this.homeScenarioUtils.buildForest();
        this.homeScenarioUtils.buildStronghold('asset_house_small');

        let itemCallback = function(instance) {
            this.sword = instance;
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