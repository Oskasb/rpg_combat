"use strict";

define([
        'client/js/workers/main/ui/elements/GuiWidget'
    ],
    function(
        GuiWidget
    ) {

        var GuiStatsPanel = function(options) {

            this.options = {};
            for (var key in options) {
                this.options[key] = options[key];
            }


            this.samplers = [];

            this.statWidgets = {};

            var updateStat = function(key, value) {
                this.updateStat(key, value);
            }.bind(this);

            var updateSamplers = function(key, value) {
                this.updateSamplers(key, value);
            }.bind(this);

            this.callbacks = {
                updateStat:updateStat,
                updateSamplers:updateSamplers
            }

        };


        GuiStatsPanel.prototype.initStatsPanel = function(widgetConfig, onReady, pos) {
            this.guiWidget = new GuiWidget(widgetConfig);
            this.guiWidget.initGuiWidget(pos, onReady);
            GuiAPI.addGuiUpdateCallback(this.callbacks.updateSamplers)
        };

        GuiStatsPanel.prototype.setGuiWidget = function(guiWidget) {
            this.guiWidget = guiWidget;
            GuiAPI.addGuiUpdateCallback(this.callbacks.updateSamplers)
        };

        GuiStatsPanel.prototype.removeGuiWidget = function() {
            GuiAPI.removeGuiUpdateCallback(this.callbacks.updateSamplers);
            this.guiWidget.removeChildren();
            this.guiWidget.recoverGuiWidget();
        };

        GuiStatsPanel.prototype.addChildWidgetToContainer = function(guiWidget) {
            this.guiWidget.disableWidgetInteraction();
            this.guiWidget.addChild(guiWidget);
            this.fitContainerChildren()
        };

        GuiStatsPanel.prototype.addTrackStatFunction = function(statSampler) {

            if (this.statWidgets[statSampler.key]) {
                return
            }

            this.statWidgets[statSampler.key] = {key:null, value:null};
            var sWids = this.statWidgets;
            var samplers = this.samplers;

            var contWid = this.guiWidget;

            var valueReady = function(widget) {
                sWids[widget.statSampler.key].valueWidget = widget;
                samplers.push(widget.statSampler);
                contWid.addChild(sWids[widget.statSampler.key].keyWidget);
                contWid.addChild(sWids[widget.statSampler.key].valueWidget);
                contWid.applyWidgetPosition()
            };

            var keyReady = function(widget) {
                sWids[widget.statSampler.key].keyWidget = widget;
                valueWidget.initGuiWidget(null, valueReady);
            };

            var valueWidget = new GuiWidget("widget_stats_value_box");
            var keyWidget = new GuiWidget("widget_stats_key_box");

            keyWidget.statSampler = statSampler;
            valueWidget.statSampler = statSampler;
            keyWidget.initGuiWidget(null, keyReady);

        };

        GuiStatsPanel.prototype.fitContainerChildren = function() {
            this.guiWidget.applyWidgetPosition()
        };

        GuiStatsPanel.prototype.setupValueString = function(value, unit, digits) {

            var valueString = this.guiWidget.numberToDigits(value, digits, 0);

            return valueString+unit;
        };

        GuiStatsPanel.prototype.updateStat = function(key, value) {

            var sampler = this.statWidgets[key].keyWidget.statSampler;

            var valueString = this.setupValueString(value, sampler.unit || '', sampler.digits || 2);
            this.statWidgets[key].keyWidget.setFirstSTringText(key);
            this.statWidgets[key].valueWidget.setFirstSTringText(valueString)
        };

        GuiStatsPanel.prototype.updateStatSampler = function(statSampler) {
            statSampler.callback(statSampler.key, this.callbacks.updateStat);
        };

        GuiStatsPanel.prototype.updateSamplers = function() {

            for (var i = 0; i < this.samplers.length; i++) {
                this.updateStatSampler(this.samplers[i]);
            }

        };

        return GuiStatsPanel;

    });