"use strict";

define([
        'client/js/workers/main/ui/elements/GuiWidget'
    ],
    function(
        GuiWidget
    ) {


        var GuiProgressBar = function(options) {

            this.options = {};
            for (var key in options) {
                this.options[key] = options[key];
            }

            this.min = 0;
            this.max = 0;
            this.current = 0;

            this.digits = 2;

            this.time = 0;

            var updateProgress = function(tpf, time) {
                this.time += tpf;
                this.updateCurrentProgress(this.time);
            }.bind(this);

            this.callbacks = {
                updateProgress:updateProgress
            }
        };


        GuiProgressBar.prototype.initProgressBar = function(widgetConfig, onActivate, onReady, pos) {
            this.guiWidget = new GuiWidget(widgetConfig);

            var widgetReady = function(widget) {
                widget.setWidgetIconKey("plate");
                widget.setPosition(pos);
                widget.enableWidgetInteraction();
            };

            this.guiWidget.initGuiWidget(null, widgetReady);
            this.guiWidget.addOnActiaveCallback(onActivate);
        };


        GuiProgressBar.prototype.setProgress = function(min, max, current) {
            this.min = min;
            this.max = max;
            this.updateCurrentProgress(current);
        };


        GuiProgressBar.prototype.updateCurrentProgress = function(current) {
            this.current = current;
            this.guiWidget.indicateProgress(this.min, this.max, this.current, this.digits)
        };

        GuiProgressBar.prototype.activateProgressBar = function() {
            this.time = 0;
            GuiAPI.addGuiUpdateCallback(this.callbacks.updateProgress);
            this.setProgress(0, 2, 0);

        };


        GuiProgressBar.prototype.deactivateProgressBar = function() {
            GuiAPI.removeGuiUpdateCallback(this.callbacks.updateProgress);
        };


        GuiProgressBar.prototype.removeGuiWidget = function() {
            this.deactivateProgressBar();
            this.guiWidget.recoverGuiWidget();
        };

        return GuiProgressBar;

    });