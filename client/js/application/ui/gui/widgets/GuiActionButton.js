import { GuiWidget} from "../elements/GuiWidget.js";
import { Action } from "../../../../game/piece_functions/Action.js";

let colorMap = {
    flash:{"r": 0.99, "g": 0.99, "b": 0.99, "a": 0.99},
    on:{"r": 0.11, "g": 0.75, "b": 0.75, "a": 0.99},
    active:{"r": 0.99, "g": 0.93, "b": 0.39, "a": 0.99},
    off:{"r": 0.35, "g": 0.35, "b": 0.85, "a": 0.99},
    available:{"r": 0.01, "g": 0.79, "b": 0.01, "a": 0.99},
    activated:{"r": 0.99, "g": 0.73, "b": -0.4, "a": 0.99},
    unavailable:{"r": 0.7, "g": -0.1, "b": -0.15, "a": 0.39}
}

class GuiActionButton {
    constructor(options) {

        this.colorMap = {}

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

        let testActive = function() {
            if (this.action) {
                return this.action.testActivatable()
            }
        }.bind(this);

        let activateActionButton = function(inputIndex, widget) {
            this.activateActionButton(inputIndex, widget);
        }.bind(this);

        let updateProgress = function(progress) {
            this.updateCurrentProgress(progress);
        }.bind(this);

        let updateActionStatus = function(action, uiSysTime) {
            this.updateActionStatus(action, uiSysTime);
        }.bind(this);

        let actionButtonTriggerUiUpdate = function() {
            this.actionButtonTriggerUiUpdate();
        }.bind(this);

        let updateSufficientActionPoints = function(action, count) {
            this.updateSufficientActionPoints(action, count);
        }.bind(this);

        let attachActionToButton = function(action) {
            this.attachActionToButton(action);
        }.bind(this);

        let removeGuiWidget = function() {
            this.removeGuiWidget();
        }.bind(this);

        this.activateCallback = function() {
            console.log("Dummy activation cb")
        };

        this.callbacks = {
            testActive:testActive,
            activateActionButton:activateActionButton,
            updateProgress:updateProgress,
            updateActionStatus:updateActionStatus,
            actionButtonTriggerUiUpdate:actionButtonTriggerUiUpdate,
            updateSufficientActionPoints:updateSufficientActionPoints,
            attachActionToButton:attachActionToButton,
            removeGuiWidget:removeGuiWidget
        }
    };

    setActivateCallback(callback) {
        this.activateCallback = callback
    }

    activateActionButton(inputIndex, widget) {
        this.activateCallback(inputIndex, widget);
    }

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
        this.setTestActiveCallback(this.callbacks.testActive);

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
            widget.enableWidgetInteraction();

            this.progressWidget = new GuiWidget(this.progWidgetId);
            this.progressWidget.initGuiWidget(null, progressReady);
            this.progressWidget.setWidgetIconKey(this.progressIcon);
            this.setTestActiveCallback(this.callbacks.testActive);

            widget.attachToAnchor('bottom_right');

            onReady(widget)

        }.bind(this);

        this.guiWidget.initGuiWidget(null, buttonReady);

    };

    setAction = function(action) {
        this.action = action;
    };


    getAction = function() {
        return this.action;
    };


    attachActionToButton = function(action) {
/*
        this.setAction(action);
        this.guiWidget.printWidgetText(action.getActionName());
        this.guiWidget.setWidgetIconKey(action.getActionIcon());
        this.guiWidget.addOnActiaveCallback(this.callbacks.activateAction);
*/
    };

    bindActionSlotCallbacks = function(actionSlot) {
/*
        actionSlot.addActionPointUpdateCallback(this.callbacks.updateSufficientActionPoints);
        actionSlot.addSetSlotActionCallback(this.callbacks.attachActionToButton);
        actionSlot.addActionSlotRemovedCallback(this.callbacks.removeGuiWidget);
        actionSlot.addActionTriggeredCallback(this.callbacks.actionButtonTriggerUiUpdate);

        if (actionSlot.getSlotCurrentAction()) {
            actionSlot.notifySetSlotAction(actionSlot.getSlotCurrentAction())
        }
        this.actionSlot = actionSlot;

 */
    };

    updateCurrentProgress = function(progress) {
        this.progressWidget.indicateProgress(0, 1, progress, 1);
    };

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

    updateFrameColor(action, uiSysTime) {
        this.flashFrame(uiSysTime);

    }

    updateActionStatus(action, uiSysTime) {
        this.callbacks.updateProgress(Math.abs(Math.sin(uiSysTime*3)))
        this.updateFrameColor(action, uiSysTime);
    }

    updateActionButton = function(action, uiSysTime) {
        this.callbacks.updateActionStatus(action, uiSysTime);
    }

}

export { GuiActionButton }