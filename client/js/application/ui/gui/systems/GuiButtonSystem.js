class GuiButtonSystem {
    constructor() {

    }

    initGuiButtonSystem() {
        evt.on(ENUMS.Event.BUILD_BUTTON, this.buildButton)
    }


    buildButton(evtArgs) {

        console.log(evtArgs)

        let buttonReady = function(button) {
            console.log("Button Ready, no callback registered...", button)
        };

        let opts = GuiAPI.buildWidgetOptions(evtArgs);

        GuiAPI.buildGuiWidget(evtArgs.widgetClass || 'GuiSimpleButton', opts, evtArgs.widgetCallback || buttonReady);

    }


}

export {GuiButtonSystem}