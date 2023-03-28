import {GuiPage} from "../elements/GuiPage.js";
import {ConfigData} from "../../../utils/ConfigData.js";


class GuiPageSystem {
    constructor() {
        this.pages = {};
        this.activePages = [];
        this.configData = new ConfigData("UI", "PAGES")
    }

    initGuiPageSystem() {

        let config = this.configData.parseConfigData();

        for (let key in config) {
            let pageId = config[key].id;
            let pageData = config[key].data;
            this.pages[pageId]  = new GuiPage(pageData);
        }

    }

    activateGuiPage(pageId) {
        GuiAPI.printDebugText("ACTIVATE PAGE "+pageId);

        if (this.activePages.length) {
            this.activePages.pop().closeGuiPage();
        }

        this.activePages.push(this.pages[pageId].activateGuiPage())
    }

}

export { GuiPageSystem }