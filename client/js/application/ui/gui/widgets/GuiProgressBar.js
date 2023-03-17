import { GuiWidget} from "../elements/GuiWidget.js";

class GuiProgressBar {
    constructor(ptions) {

        this.options = {};
        for (let key in options) {
            this.options[key] = options[key];
        }

        this.min = 0;
        this.max = 0;
        this.current = 0;

        this.digits = 2;

        this.time = 0;

        let updateProgress = function(tpf, time) {
            this.time += tpf;
            this.updateCurrentProgress(this.time);
        }.bind(this);

        this.callbacks = {
            updateProgress:updateProgress
        }
    };


    initProgressBar = function(widgetConfig, onActivate, onReady, pos) {
        this.guiWidget = new GuiWidget(widgetConfig);

        let widgetReady = function(widget) {
            widget.setWidgetIconKey("plate");
            widget.setPosition(pos);
            widget.enableWidgetInteraction();
        };

        this.guiWidget.initGuiWidget(null, widgetReady);
        this.guiWidget.addOnActiaveCallback(onActivate);
    };


    setProgress = function(min, max, current) {
        this.min = min;
        this.max = max;
        this.updateCurrentProgress(current);
    };


    updateCurrentProgress = function(current) {
        this.current = current;
        this.guiWidget.indicateProgress(this.min, this.max, this.current, this.digits)
    };

    activateProgressBar = function() {
        this.time = 0;
        GuiAPI.addGuiUpdateCallback(this.callbacks.updateProgress);
        this.setProgress(0, 2, 0);

    };

    deactivateProgressBar = function() {
        GuiAPI.removeGuiUpdateCallback(this.callbacks.updateProgress);
    };

    removeGuiWidget = function() {
        this.deactivateProgressBar();
        this.guiWidget.recoverGuiWidget();
    };

}

export { GuiProgressBar }