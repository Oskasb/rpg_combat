import { GuiWidget} from "../elements/GuiWidget.js";
import { ConfigData} from "../../../utils/ConfigData.js";

class GuiStatsPanel {
    constructor(options) {
        this.samplers = [];
        this.statWidgets = {};
        this.options = {};
        for (let key in options) {
            this.options[key] = options[key];
        }

        //    if (options['track_config']) {

        let catKey = options['track_config']['category'];
        let confKey = options['track_config']['key'];
        this.configData = new ConfigData(catKey, confKey);
        //    }
/*
        let cb = function() {

        }
        let addStatSampler = function(key, callback, unit, digits) {
            return {key:key,   callback:callback || cb, unit:unit || '', digits:digits || 10}
        }

        let trackValues = this.configData.config;

        let samplers = this.options['track_config']['samplers']
        for (let i= 0; i <  samplers.length; i++) {
            this.addTrackStatFunction(addStatSampler(samplers[i]));
        }

*/
        let trackValues = this.configData.config;
        let updateTrackedStats = function() {
            for (let i = 0; i < this.samplers.length; i++) {
                let sampler = this.samplers[i].key
                let value = trackValues[sampler]
                this.updateStat(this.samplers[i].key, value);
            }
        }.bind(this);

        let updateStat = function(key, value) {
            this.updateStat(key, value);
        }.bind(this);

        let updateSamplers = function(key, value) {
            this.updateSamplers(key, value);
        }.bind(this);

        this.callbacks = {
            updateStat:updateStat,
            updateSamplers:updateSamplers,
            updateTrackedStats:updateTrackedStats,
        }

    };

    setGuiWidget = function(guiWidget) {
        this.guiWidget = guiWidget;

        guiWidget.guiStatsPanel = this;
        let cb = function() {

        }
        let addStatSampler = function(key, callback, unit, digits) {
            return {key:key.key,   callback:callback || cb, unit:unit || '', digits:digits || 10}
        }



        let samplers = this.options['track_config']['samplers']
        for (let i= 0; i <  samplers.length; i++) {
            console.log("Add Track stats", samplers[i]);
            this.addTrackStatFunction(addStatSampler(samplers[i]));
        }

        GuiAPI.addGuiUpdateCallback(this.callbacks.updateTrackedStats)
    };

    removeGuiWidget = function() {
        delete this.guiWidget.guiStatsPanel;
        console.log("Remove Stats Panel")
        GuiAPI.removeGuiUpdateCallback(this.callbacks.updateTrackedStats);
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
    /*
            updateStatSampler = function(statSampler) {
                statSampler.callback(statSampler.key, this.callbacks.updateStat);
            };

            updateSamplers = function() {

                for (let i = 0; i < this.samplers.length; i++) {
                    this.updateStatSampler(this.samplers[i]);
                }

            };
    */
}

export { GuiStatsPanel }