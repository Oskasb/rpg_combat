"use strict";

define([
        'client/js/workers/main/ui/elements/GuiWidget'
    ],
    function(
        GuiWidget
    ) {


        var GuiTextBox = function(options) {

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


        GuiTextBox.prototype.initTextBox = function(widgetConfig, onActivate, onReady, pos) {
            this.guiWidget = new GuiWidget(widgetConfig);

            var widgetReady = function(widget) {
                widget.printWidgetText("TRY ME");
                widget.setPosition(pos);
                widget.enableWidgetInteraction();
            };

            this.guiWidget.initGuiWidget(null, widgetReady);
            this.guiWidget.addOnActiaveCallback(onActivate);

        };

        GuiTextBox.prototype.setGuiWidget = function(guiWidget) {
            this.guiWidget = guiWidget;
        };

        GuiTextBox.prototype.updateTextContent = function(text) {
            this.guiWidget.printWidgetText(text)
        };

        GuiTextBox.prototype.activateTextBox = function() {
            this.activated = true;
            this.time = 0;
            GuiAPI.addGuiUpdateCallback(this.callbacks.updateProgress);
        };

        GuiTextBox.prototype.deactivateTextBox = function() {
            this.activated = false;
            GuiAPI.removeGuiUpdateCallback(this.callbacks.updateProgress);
        };

        GuiTextBox.prototype.removeGuiWidget = function() {
            this.deactivateTextBox();
            this.guiWidget.recoverGuiWidget();
        };

        return GuiTextBox;

    });