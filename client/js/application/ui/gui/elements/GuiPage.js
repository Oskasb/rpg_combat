class GuiPage {
    constructor(config) {
        this.config = config
        this.containers = {};
    }

    activateGuiPage() {
    //    console.log("Activate gui page ", this.config);



        for (let i = 0; i < this.config.length; i++) {
            let containers = this.config[i].containers;
            let buttons = this.config[i].buttons;

            for (let j = 0; j < containers.length; j++) {
                this.setupContainer(containers[j])
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

    setupContainer(conf) {

        let onWidgetReady = function(widget) {
            this.containers[conf.widget_id] = widget;
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
     //   console.log("Close gui page ", this);
        for (let key in this.containers) {
            let widget = this.containers[key]
            widget.guiWidget.recoverGuiWidget();
        }
        this.containers = {};
    }

}

export { GuiPage }

