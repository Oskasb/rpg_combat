class GuiPage {
    constructor(config) {
        this.config = config
        this.containers = [];
    }

    activateGuiPage() {
        console.log("Activate gui page ", this.config);



        for (let i = 0; i < this.config.length; i++) {
            let containers = this.config[i].containers
            for (let j = 0; j < containers.length; j++) {
                this.setupContainers(containers[j])
            }

        }

    }

    buildOptionsFromWidgetConfig(conf) {
        let options = GuiAPI.buildWidgetOptions(
            {
                widgetClass:conf['widget_class']     || 'GuiSimpleButton',
                configId: conf['widget_config_id']   || 'button_big_blue',
            }
        );

        for (let key in conf['options']) {
            options[key] = conf['options'][key];
        }
        return options;
    }

    setupContainers(conf) {
        let onWidgetReady = function(widget) {
            console.log("Add Container", widget);
            this.containers.push(widget)
        }.bind(this);

        let options = this.buildOptionsFromWidgetConfig(conf);

        GuiAPI.buildGuiWidget(conf['widget_class'], options, onWidgetReady)
    }

    closeGuiPage() {
        console.log("Close gui page ", this);
    }

}

export { GuiPage }

