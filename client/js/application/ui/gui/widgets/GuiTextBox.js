import { GuiWidget} from "../elements/GuiWidget.js";

class GuiTextBox {
    constructor(options) {

            this.options = {};
            for (var key in options) {
                this.options[key] = options[key];
            }


            this.activated = false;

            var updateProgress = function(tpf, time) {
                this.time += tpf;
                this.updateTextContent(this.time);
            }.bind(this);

            var testActive = function() {
                return this.activated;
            }.bind(this);

            this.callbacks = {
                updateProgress:updateProgress,
                testActive:testActive
            }
        };


        initTextBox = function(widgetConfig, onActivate, onReady, pos) {
            this.guiWidget = new GuiWidget(widgetConfig);

            var widgetReady = function(widget) {
                widget.printWidgetText("TRY ME");
                widget.setPosition(pos);
                widget.enableWidgetInteraction();
            };

            this.guiWidget.initGuiWidget(null, widgetReady);
            this.guiWidget.addOnActiaveCallback(onActivate);

        };

        setGuiWidget = function(guiWidget) {
            this.guiWidget = guiWidget;
        };

        updateTextContent = function(text) {
            this.guiWidget.printWidgetText(text)
        };

        activateTextBox = function() {
            this.activated = true;
            this.time = 0;
            GuiAPI.addGuiUpdateCallback(this.callbacks.updateProgress);
        };

        deactivateTextBox = function() {
            this.activated = false;
            GuiAPI.removeGuiUpdateCallback(this.callbacks.updateProgress);
        };

        removeGuiWidget = function() {
            this.deactivateTextBox();
            this.guiWidget.recoverGuiWidget();
        };

    }

export { GuiTextBox }