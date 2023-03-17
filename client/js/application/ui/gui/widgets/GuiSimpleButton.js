"use strict";

define([

    ],
    function(

    ) {

        var GuiSimpleButton = function(options) {

            this.options = {};
            for (var key in options) {
                this.options[key] = options[key];
            }
        };

        GuiSimpleButton.prototype.setGuiWidget = function(guiWidget) {
            this.guiWidget = guiWidget;
        };

        GuiSimpleButton.prototype.removeGuiWidget = function() {
            this.guiWidget.recoverGuiWidget();
        };

        GuiSimpleButton.prototype.pressButtonFromCode = function() {
            this.guiWidget.notifyElementActivate(0);
            this.guiWidget.getWidgetSurface().updateInterativeState();
        };

        GuiSimpleButton.prototype.setTestActiveCallback = function(cb) {
            this.guiWidget.addTestActiveCallback(cb);
        };

        return GuiSimpleButton;

    });