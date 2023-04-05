import { GuiWidget} from "../elements/GuiWidget.js";

class GuiProgressBar {
    constructor(options) {

        this.options = {};
        for (let key in options) {
            this.options[key] = options[key];
        }

        this.min = 0;
        this.max = 100;
        this.current = 0;
        this.digits = options.digits || 2;
        this.time = 0;

        let progressEvent = options['progress_event'];
        this.progressEvent = ENUMS.Event[progressEvent.event]


        let updateProgress = function(event) {
            if (event.targetKey === progressEvent['target_key']) {
                this.setProgress(event.min,event.max, event.current)
            }
        }.bind(this);

        this.callbacks = {
            updateProgress:updateProgress
        }

        evt.on(this.progressEvent, updateProgress);

    };

    setGuiWidget = function(guiWidget) {
        this.guiWidget = guiWidget;
        guiWidget.setWidgetIconKey("plate");
        guiWidget.guiProgressBar = this;
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

    deactivateProgressBar = function() {
        evt.removeListener(this.progressEvent, this.callbacks.updateProgress, evt)
    };

    removeGuiWidget = function() {
        this.deactivateProgressBar();
        this.guiWidget.recoverGuiWidget();
    };

}

export { GuiProgressBar }