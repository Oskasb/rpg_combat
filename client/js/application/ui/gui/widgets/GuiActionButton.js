"use strict";

define([
        'client/js/workers/main/ui/elements/GuiWidget',
        'client/js/workers/main/game/actions/Action'
    ],
    function(
        GuiWidget,
        Action
    ) {

    var progWidgetId = 'widget_action_button_progress';
    var progressIcon = 'progress_vertical';


        var stateFeedbackMap = {};
        stateFeedbackMap[ENUMS.ActionState.UNAVAILABLE   ] = ENUMS.ElementState.DISABLED    ;
        stateFeedbackMap[ENUMS.ActionState.AVAILABLE     ] = ENUMS.ElementState.NONE        ;
        stateFeedbackMap[ENUMS.ActionState.ACTIVATING    ] = ENUMS.ElementState.ACTIVE      ;
        stateFeedbackMap[ENUMS.ActionState.ACTIVE        ] = ENUMS.ElementState.ACTIVE_PRESS;
        stateFeedbackMap[ENUMS.ActionState.ON_COOLDOWN   ] = ENUMS.ElementState.DISABLED    ;
        stateFeedbackMap[ENUMS.ActionState.ENABLED       ] = ENUMS.ElementState.NONE        ;

        var GuiActionButton = function(options) {

            this.options = {};

            for (var key in options) {
                this.options[key] = options[key];
            }

            var testActive = function() {
                if (this.action) {
                    return this.action.testActivatable()
                }
            }.bind(this);

            var activateAction = function(inputIndex, widget) {
                this.actionButtonActivated(inputIndex, widget);
            }.bind(this);

            var updateProgress = function(tpf, time) {
                this.updateCurrentProgress(this.getAction());
            }.bind(this);

            var actionButtonTriggerUiUpdate = function() {
                this.actionButtonTriggerUiUpdate();
            }.bind(this);

            var updateSufficientActionPoints = function(action, count) {
                this.updateSufficientActionPoints(action, count);
            }.bind(this);

            var attachActionToButton = function(action) {
                this.attachActionToButton(action);
            }.bind(this);

            var removeGuiWidget = function() {
                this.removeGuiWidget();
            }.bind(this);

            this.callbacks = {
                testActive:testActive,
                activateAction:activateAction,
                updateProgress:updateProgress,
                actionButtonTriggerUiUpdate:actionButtonTriggerUiUpdate,
                updateSufficientActionPoints:updateSufficientActionPoints,
                attachActionToButton:attachActionToButton,
                removeGuiWidget:removeGuiWidget
            }
        };


        GuiActionButton.prototype.setGuiWidget = function(widget) {
            this.guiWidget = widget;

            var progressReady = function(pwidget) {
                widget.addChild(pwidget);
            };

                widget.enableWidgetInteraction();

                this.progressWidget = new GuiWidget(progWidgetId);
                this.progressWidget.initGuiWidget(null, progressReady);
                this.progressWidget.setWidgetIconKey(progressIcon);
                this.setTestActiveCallback(this.callbacks.testActive);

                widget.attachToAnchor('bottom_right');

        };


        GuiActionButton.prototype.initActionButton = function(widgetConfig, onReady) {
            this.guiWidget = new GuiWidget(widgetConfig);

            var progressReady = function(widget) {

                this.guiWidget.addChild(widget);

            }.bind(this);

            var buttonReady = function(widget) {
                widget.enableWidgetInteraction();

                this.progressWidget = new GuiWidget(progWidgetId);
                this.progressWidget.initGuiWidget(null, progressReady);
                this.progressWidget.setWidgetIconKey(progressIcon);
                this.setTestActiveCallback(this.callbacks.testActive);

                widget.attachToAnchor('bottom_right');

                onReady(widget)

            }.bind(this);

            this.guiWidget.initGuiWidget(null, buttonReady);

        };

        GuiActionButton.prototype.setAction = function(action) {
            this.action = action;
        };


        GuiActionButton.prototype.getAction = function() {
            return this.action;
        };


        GuiActionButton.prototype.attachActionToButton = function(action) {

            this.setAction(action);
            this.guiWidget.printWidgetText(action.getActionName());
            this.guiWidget.setWidgetIconKey(action.getActionIcon());
            this.guiWidget.addOnActiaveCallback(this.callbacks.activateAction);

        };

        GuiActionButton.prototype.bindActionSlotCallbacks = function(actionSlot) {

            actionSlot.addActionPointUpdateCallback(this.callbacks.updateSufficientActionPoints);
            actionSlot.addSetSlotActionCallback(this.callbacks.attachActionToButton);
            actionSlot.addActionSlotRemovedCallback(this.callbacks.removeGuiWidget);
            actionSlot.addActionTriggeredCallback(this.callbacks.actionButtonTriggerUiUpdate);

            if (actionSlot.getSlotCurrentAction()) {
                actionSlot.notifySetSlotAction(actionSlot.getSlotCurrentAction())
            }
            this.actionSlot = actionSlot;
        };

        GuiActionButton.prototype.updateCurrentProgress = function(action) {

            if (!action.getActionText()) {
                console.log("TextMissing", action)
            } else {
                this.guiWidget.setFirstSTringText(action.getActionText());
            }

            this.progressWidget.indicateProgress(0, action.getActionTargetTime(), action.getActionProgressTime(), 1);

            this.guiWidget.setWidgetInteractiveState(stateFeedbackMap[action.getActionState()]);
            this.progressWidget.setWidgetInteractiveState(stateFeedbackMap[action.getActionState()]);

            if (!action.getActionIsActive()) {
                this.progressWidget.setFirstSTringText(null);
                this.guiWidget.enableWidgetInteraction();
                GuiAPI.removeGuiUpdateCallback(this.callbacks.updateProgress);
            }

        };

        GuiActionButton.prototype.actionButtonInitiateAction = function() {

            this.getAction().requestActivation();
            this.actionButtonTriggerUiUpdate();

        };

        GuiActionButton.prototype.actionButtonTriggerUiUpdate = function() {

            GuiAPI.addGuiUpdateCallback(this.callbacks.updateProgress);
            this.guiWidget.disableWidgetInteraction();

        };


        GuiActionButton.prototype.actionButtonActivated = function(inputIndex, widget) {

            if (this.getAction().testAvailable()) {
                this.actionButtonInitiateAction()
            }

        };

        GuiActionButton.prototype.setTestActiveCallback = function(cb) {
            this.guiWidget.addTestActiveCallback(cb);
        };

        GuiActionButton.prototype.updateSufficientActionPoints = function(action, count) {
            this.guiWidget.setWidgetInteractiveState(stateFeedbackMap[action.getActionState()]);

            if (action.getActionState() === ENUMS.ActionState.UNAVAILABLE) {
                this.guiWidget.setFirstSTringText(count +'/'+action.getActionPointCost());
            } else {
                if (action.getActionState() === ENUMS.ActionState.AVAILABLE) {
                    this.updateCurrentProgress(action);
                }
            }

        };

        GuiActionButton.prototype.removeGuiWidget = function() {
            this.guiWidget.recoverGuiWidget();
            this.progressWidget.recoverGuiWidget();
            GuiAPI.removeGuiUpdateCallback(this.callbacks.updateProgress);

if (this.actionSlot) {
    this.actionSlot.removeActionPointUpdateCallback(this.callbacks.updateSufficientActionPoints);
    this.actionSlot.removeSetSlotActionCallback(this.callbacks.attachActionToButton);
    this.actionSlot.removeActionSlotRemovedCallback(this.callbacks.removeGuiWidget);
    this.actionSlot.removeActionTriggeredCallback(this.callbacks.actionButtonTriggerUiUpdate);
}

        };

        GuiActionButton.prototype.getDummyAction = function() {
            return new Action();
        };

        return GuiActionButton;

    });