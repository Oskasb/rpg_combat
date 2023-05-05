import { GuiWidget} from "../elements/GuiWidget.js";
import { Action } from "../../../../game/piece_functions/Action.js";

let colorMap = {
    flash:{"r": 0.99, "g": 0.99, "b": 0.99, "a": 0.99},
    on:{"r": 0.11, "g": 0.75, "b": 0.75, "a": 0.99},
    active:{"r": 0.21, "g": 0.53, "b": 0.99, "a": 0.99},
    off:{"r": 0.99, "g": -0.55, "b": -0.55, "a": 0.99},
    available:{"r": 0.41, "g": 0.79, "b": 0.11, "a": 0.99},
    activated:{"r": 0.59, "g": 0.99, "b": 0.39, "a": 0.99},
    unavailable:{"r": 0.3, "g": 0.3, "b": 0.5,  "a": 0.99}
}

class GuiActionButton {
    constructor(options) {

        this.colorMap = {}

        this.available = true;

        for (let key in colorMap) {
            this.colorMap[key] = colorMap[key];
        }

        this.progWidgetId = 'widget_action_button_progress';
        this.progressIcon = 'progress_vertical';

        let stateFeedbackMap = {};
        stateFeedbackMap[ENUMS.ActionState.UNAVAILABLE   ] = ENUMS.ElementState.DISABLED    ;
        stateFeedbackMap[ENUMS.ActionState.AVAILABLE     ] = ENUMS.ElementState.NONE        ;
        stateFeedbackMap[ENUMS.ActionState.ACTIVATING    ] = ENUMS.ElementState.ACTIVE      ;
        stateFeedbackMap[ENUMS.ActionState.ACTIVE        ] = ENUMS.ElementState.ACTIVE_PRESS;
        stateFeedbackMap[ENUMS.ActionState.ON_COOLDOWN   ] = ENUMS.ElementState.DISABLED    ;
        stateFeedbackMap[ENUMS.ActionState.ENABLED       ] = ENUMS.ElementState.NONE        ;
        this.stateFeedbackMap = stateFeedbackMap;

        this.options = {};

        for (let key in options) {
            this.options[key] = options[key];
        }

        let updateProgress = function(progress) {
            this.updateCurrentProgress(progress);
        }.bind(this);

        let updateActionStatus = function(action, uiSysTime) {
            this.updateActionStatus(action, uiSysTime);
        }.bind(this);

        let removeGuiWidget = function() {
            this.removeGuiWidget();
        }.bind(this);

        this.callbacks = {
            updateProgress:updateProgress,
            updateActionStatus:updateActionStatus,
            removeGuiWidget:removeGuiWidget
        }
    };

    getInteractiveElement = function() {
        return this.guiWidget.guiSurface.interactiveElement;
    }
    setGuiWidget = function(widget) {
        this.guiWidget = widget;
        console.log("Init Action Button", this)
        let progressReady = function(pwidget) {
            widget.addChild(pwidget);
        };

        widget.enableWidgetInteraction();

        this.progressWidget = new GuiWidget(this.progWidgetId);
        this.progressWidget.initGuiWidget(null, progressReady);
        this.progressWidget.setWidgetIconKey(this.progressIcon);
    //    this.setTestActiveCallback(this.callbacks.testActive);

        widget.attachToAnchor('bottom_right');

    };


    initActionButton = function(widgetConfig, onReady) {

        this.guiWidget = new GuiWidget(widgetConfig);

        for (let key in colorMap) {
            this.colorMap[key] = colorMap[key];
        }

        let progressReady = function(widget) {
            this.guiWidget.addChild(widget);
        }.bind(this);

        let buttonReady = function(widget) {
            console.log("Button Ready", this)

            this.progressWidget = new GuiWidget(this.progWidgetId);
            this.progressWidget.initGuiWidget(null, progressReady);
            this.progressWidget.setWidgetIconKey(this.progressIcon);

            widget.attachToAnchor('bottom_right');

            onReady(widget)

        }.bind(this);

        this.guiWidget.initGuiWidget(null, buttonReady);

    };

    updateAbilityProgress = function(ability) {
        let progress = 0;
        let progressStatus = ability.call.getProgressStatus();
        let cooldownStatus = ability.call.getCooldownStatus();

        if (progressStatus !== 0) {
            progress = progressStatus;
            this.setProgressBarColor(this.colorMap['active'])
        } else if (cooldownStatus !== 0) {
            progress = cooldownStatus;
            this.setProgressBarColor(this.colorMap['off'])
        }

        this.progressWidget.indicateProgress(0, 1, progress, 1);
    };

    updateAbilityAvailability = function(ability) {
    //    console.log("Update avail")
        let isAvailable = ability.call.getIsAvailable();

        if (isAvailable > 0.5) {
            this.getInteractiveElement().setInteractiveState(this.stateFeedbackMap[ENUMS.ActionState.AVAILABLE])
            //    this.enableButtonInteraction();
           this.setActionIconColor(this.colorMap['available'])
        } else {
            this.getInteractiveElement().setInteractiveState(this.stateFeedbackMap[ENUMS.ActionState.UNAVAILABLE])
            //    this.disableButtonInteraction();
            this.setActionIconColor(this.colorMap['unavailable'])
        }

    }

    actionButtonInitiateAction = function() {
        this.getAction().requestActivation();
        this.actionButtonTriggerUiUpdate();
    };

    actionButtonTriggerUiUpdate = function() {
        this.guiWidget.disableWidgetInteraction();
    };

    setTestActiveCallback = function(cb) {
        this.guiWidget.addTestActiveCallback(cb);
    };

    removeGuiWidget = function() {
        this.guiWidget.recoverGuiWidget();
        this.progressWidget.recoverGuiWidget();
    };

    getDummyAction = function() {
        return new Action();
    };

    getProgressSurface = function() {
        return this.progressWidget.guiSurface;
    }

    setActionIconColor = function(rgba) {
        this.guiWidget.icon.setGuiIconColorRGBA(rgba);
    }
    setProgressBarColor = function(rgba) {
        this.progressWidget.icon.setGuiIconColorRGBA(rgba);
    }

    setFrameColor(rgba) {
        let frameSurface = this.getProgressSurface();
        frameSurface.setSurfaceColor(rgba)
    }

    flashFrame(uiSysTime) {
        let rgba = this.colorMap['flash']
        let brightness = 0.25 + Math.cos(uiSysTime*10)*0.25;
        rgba.r = Math.abs(Math.sin(uiSysTime*8))*0.49 +brightness;
        rgba.g = Math.abs(Math.cos(uiSysTime*8))*0.49 +brightness;
        rgba.b = 0.5 + brightness;
        this.setFrameColor(rgba)
    }

    updateFrameColor(ability, uiSysTime) {
        this.flashFrame(uiSysTime);
    }

    updateActionStatus(ability, uiSysTime) {
        this.updateAbilityAvailability(ability)
        this.updateAbilityProgress(ability)
        this.updateFrameColor(ability, uiSysTime);
    }

    updateActionButton = function(ability, uiSysTime) {
        this.callbacks.updateActionStatus(ability, uiSysTime);
    }

}

export { GuiActionButton }