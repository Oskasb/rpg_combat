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

    //    console.log(this.options, this.options['key_box'], this.options['value_box'])

        if (typeof(this.options['key_box']) !== 'string') {
            this.options.key_box = "widget_stats_key_box"
        }

        if (typeof(this.options['value_box']) !== 'string') {
            this.options.value_box = "widget_stats_value_box"
        }


        let catKey = options['track_config']['category'];
        let confKey = options['track_config']['key'];
        let trackValues = PipelineAPI.getCachedConfigs()[catKey][confKey];

        let updateTrackedStats = function() {
            for (let i = 0; i < this.samplers.length; i++) {
                let sampler = this.samplers[i].key
                let value = trackValues[sampler];
                this.updateStat(this.samplers[i].key, value);
            }
        }.bind(this);

        this.callbacks = {
            updateTrackedStats:updateTrackedStats,
        }

    };

    setGuiWidget = function(guiWidget) {
        this.guiWidget = guiWidget;

    //    this.addChildWidgetToContainer(this);

        guiWidget.guiStatsPanel = this;
        let cb = function() {

        }
        let addStatSampler = function(key, callback, unit, digits) {
            return {key:key,   callback:callback || cb, unit:unit || '', digits:digits || 2}
        }


        let samplers = this.options['track_config']['samplers']
        for (let i= 0; i <  samplers.length; i++) {
     //       console.log("Add Track stats", samplers[i]);
            this.addTrackStatFunction(addStatSampler(samplers[i].key, '', '', samplers[i].digits));
        }

        GuiAPI.addGuiUpdateCallback(this.callbacks.updateTrackedStats)

    };

    recoverGuiWidget = function() {
 //       console.log("RECOVER STATS PANEL")
    }
    removeGuiWidget = function() {
        this.guiWidget.guiStatsPanel = null;
    //    console.log("Remove Stats Panel")
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

   //     console.log(this.options.value_box,  this.options.key_box)
        let valueWidget = new GuiWidget( this.options.value_box);
        let keyWidget = new GuiWidget( this.options.key_box);

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

}

export { GuiStatsPanel }