import { GuiWidget} from "../elements/GuiWidget.js";

class GuiStatsPanel {
    constructor(options) {

            this.options = {};
            for (let key in options) {
                this.options[key] = options[key];
            }


            this.samplers = [];

            this.statWidgets = {};

        let updateStat = function(key, value) {
                this.updateStat(key, value);
            }.bind(this);

        let updateSamplers = function(key, value) {
                this.updateSamplers(key, value);
            }.bind(this);

            this.callbacks = {
                updateStat:updateStat,
                updateSamplers:updateSamplers
            }

        };


        initStatsPanel = function(widgetConfig, onReady, pos) {
            this.guiWidget = new GuiWidget(widgetConfig);
            this.guiWidget.initGuiWidget(pos, onReady);
            GuiAPI.addGuiUpdateCallback(this.callbacks.updateSamplers)
        };

        setGuiWidget = function(guiWidget) {
            this.guiWidget = guiWidget;
            GuiAPI.addGuiUpdateCallback(this.callbacks.updateSamplers)
        };

        removeGuiWidget = function() {
            GuiAPI.removeGuiUpdateCallback(this.callbacks.updateSamplers);
            this.guiWidget.removeChildren();
            this.guiWidget.recoverGuiWidget();
        };

        addChildWidgetToContainer = function(guiWidget) {
            this.guiWidget.disableWidgetInteraction();
            this.guiWidget.addChild(guiWidget);
            this.fitContainerChildren()
        };

        addTrackStatFunction = function(statSampler) {

            if (this.statWidgets[statSampler.key]) {
                return
            }

            this.statWidgets[statSampler.key] = {key:null, value:null};
            let sWids = this.statWidgets;
            let samplers = this.samplers;

            let contWid = this.guiWidget;

            let valueReady = function(widget) {
                sWids[widget.statSampler.key].valueWidget = widget;
                samplers.push(widget.statSampler);
                contWid.addChild(sWids[widget.statSampler.key].keyWidget);
                contWid.addChild(sWids[widget.statSampler.key].valueWidget);
                contWid.applyWidgetPosition()
            };

            let keyReady = function(widget) {
                sWids[widget.statSampler.key].keyWidget = widget;
                valueWidget.initGuiWidget(null, valueReady);
            };

            let valueWidget = new GuiWidget("widget_stats_value_box");
            let keyWidget = new GuiWidget("widget_stats_key_box");

            keyWidget.statSampler = statSampler;
            valueWidget.statSampler = statSampler;
            keyWidget.initGuiWidget(null, keyReady);

        };

        fitContainerChildren = function() {
            this.guiWidget.applyWidgetPosition()
        };

        setupValueString = function(value, unit, digits) {

            let valueString = this.guiWidget.numberToDigits(value, digits, 0);

            return valueString+unit;
        };

        updateStat = function(key, value) {

            let sampler = this.statWidgets[key].keyWidget.statSampler;

            let valueString = this.setupValueString(value, sampler.unit || '', sampler.digits || 2);
            this.statWidgets[key].keyWidget.setFirstSTringText(key);
            this.statWidgets[key].valueWidget.setFirstSTringText(valueString)
        };

        updateStatSampler = function(statSampler) {
            statSampler.callback(statSampler.key, this.callbacks.updateStat);
        };

        updateSamplers = function() {

            for (let i = 0; i < this.samplers.length; i++) {
                this.updateStatSampler(this.samplers[i]);
            }

        };

    }

export { GuiStatsPanel }