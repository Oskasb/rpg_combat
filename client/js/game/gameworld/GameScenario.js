import {ScenarioStatic} from "./ScenarioStatic.js";
import {ScenarioDynamic} from "./ScenarioDynamic.js";
import { HomeScenario } from "../gamescenarios/HomeScenario.js";

class GameScenario {
    constructor(scenarioId) {
        this.scenarioId = scenarioId;
        this.scenarioTime = 0;
        this.isActive = true;
        this.mainChatPage = null;
    }

    initGameScenario(eArgs) {

    }

    initGameStaticScenario(staticId, onReady) {
        this.homeScenario = new HomeScenario();
        this.scenarioTime = 0;
        this.staticScenario = new ScenarioStatic(staticId);
        this.staticScenario.initStaticScenario(onReady)

        if (!this.mainChatPage) {
            let openMainCharPage = function() {

                this.mainChatPage = GuiAPI.activatePage("page_player_main");


            }.bind(this);

            setTimeout(function() {
                openMainCharPage();
            }, 100)
        }
    }

    activateDynamicScenario() {
        if (this.dynamicScenario) this.dynamicScenario.dynamicScenarioActivate()
    }

    initGameDynamicScenario(dynamicId, dynamicReady) {
        if (this.dynamicScenario) {
            this.dynamicScenario.exitDynamicScenario()
        }

        //   let dynamicReady = function(dyn) {
        //       console.log("Dynamic scenario loaded", dyn);
        //   };

        this.dynamicScenario = new ScenarioDynamic(dynamicId);
        this.dynamicScenario.initDynamicScenario(dynamicReady)
    }

    exitGameScenario() {
        this.isActive = false;
        //    this.mainChatPage.closeGuiPage();
        this.staticScenario.exitStaticScenario();
        this.dynamicScenario.exitDynamicScenario()
    }

    tickGameScenario(frame) {
        this.scenarioTime+=frame.tpf;
        if (this.dynamicScenario) {
            this.dynamicScenario.tickDynamicScenario(frame.tpf, this.scenarioTime);
        }
        this.staticScenario.tickStaticScenario(frame.tpf, this.scenarioTime);
    }

}

export { GameScenario }