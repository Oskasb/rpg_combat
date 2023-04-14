import {ConfigData} from "../../../utils/ConfigData.js";

class GuiPage {
    constructor(pageId) {
        this.isActive = false;
        this.pageId = pageId;
        this.containers = {};
        this.builtContainers= 0;
        this.configData = new ConfigData("UI", "PAGES")

        this.config = this.configData.parseConfigData()[pageId].data;

        let reactivate = function() {
            this.activateGuiPage();
        }.bind(this);

        let onUpdate = function(data) {
            if (this.isActive) {
                GuiAPI.printDebugText('REFLOW '+this.pageId)
                this.configData.reapplyDataToConfig(data, this.config, pageId);
                this.closeGuiPage();
                setTimeout(reactivate,200);
            }
        }.bind(this);

        this.configData.addUpdateCallback(onUpdate)

    }

    activateGuiPage(callback) {
    //    console.log("Activate gui page ", this.config);
        this.isActive = true;

        this.builtContainers = 0;
        for (let i = 0; i < this.config.length; i++) {
            let containers = this.config[i].containers;
            let buttons = this.config[i].buttons;

            for (let j = 0; j < containers.length; j++) {
                this.setupContainer(containers[j], callback, containers.length)
            }
            for (let j = 0; j < buttons.length; j++) {
                this.setupButton(buttons[j])
            }

        }
        return this;
    }

    buildOptionsFromWidgetConfig(conf) {
        let options = GuiAPI.buildWidgetOptions(
            {
                widgetClass:conf['widget_class']     || 'GuiSimpleButton',
                configId: conf['widget_config_id']   || 'button_big_blue',
            }
        );

        for (let key in conf['options']) {
            if (key === 'container_id') {
                let id = conf['options'][key]
                options.container = this.containers[id];
            } else {
                options[key] = conf['options'][key];
            }

        }
        return options;
    }

    setupContainer(conf, callback, count) {

        let onWidgetReady = function(widget) {
            this.containers[conf.widget_id] = widget;
            this.builtContainers++
            if (count === this.builtContainers) {
                if (typeof(callback) === 'function') {
                    callback(this);
                }
            }
        }.bind(this);

        let options = this.buildOptionsFromWidgetConfig(conf);

        GuiAPI.buildGuiWidget(conf['widget_class'], options, onWidgetReady)
    }



    setupButton(conf) {
        let onWidgetReady = function(widget) {

        }.bind(this);

        let options = this.buildOptionsFromWidgetConfig(conf);

        options.interactive = true;

        GuiAPI.buildGuiWidget(conf['widget_class'], options, onWidgetReady)
    }

    closeGuiPage() {
        this.isActive = false;
   //     console.log("Close gui page ", this);
        for (let key in this.containers) {
            let widget = this.containers[key]
            widget.guiWidget.recoverGuiWidget();
        }
        this.containers = {};
    }

}

export { GuiPage }

