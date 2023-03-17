"use strict";

define([
        'client/js/workers/main/ui/elements/GuiWidget'
    ],
    function(
        GuiWidget
    ) {



        var GuiExpandingContainer = function(options) {

            this.options = {};
            for (var key in options) {
                this.options[key] = options[key];
            }

        };

        GuiExpandingContainer.prototype.initExpandingContainer = function(widgetConfig, onReady) {
            this.guiWidget = new GuiWidget(widgetConfig);
            this.guiWidget.initGuiWidget(null, onReady);
        };

        GuiExpandingContainer.prototype.setGuiWidget = function(guiWidget) {
            this.guiWidget = guiWidget;
        };


        GuiExpandingContainer.prototype.removeGuiWidget = function() {
            this.guiWidget.removeChildren();
            this.guiWidget.recoverGuiWidget();
        };

        GuiExpandingContainer.prototype.addChildWidgetToContainer = function(guiWidget) {
            this.guiWidget.disableWidgetInteraction();
            this.guiWidget.addChild(guiWidget);
            this.fitContainerChildren()
        };

        GuiExpandingContainer.prototype.fitContainerChildren = function() {
            this.guiWidget.applyWidgetPosition()
        };

        GuiExpandingContainer.prototype.addToOffsetXY = function(x, y) {
            this.guiWidget.pos.x += x;
            this.guiWidget.pos.y += y;
        //    this.guiWidget.updateSurfacePositions();
            this.guiWidget.applyWidgetPosition()
        };

        GuiExpandingContainer.prototype.setTestActiveCallback = function(cb) {
            this.guiWidget.addTestActiveCallback(cb);
        };


        return GuiExpandingContainer;

    });