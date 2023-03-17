"use strict";

define([
        'client/js/workers/main/ui/elements/GuiWidget'
    ],
    function(
        GuiWidget
    ) {

        var anchors = {
            center:{x:0, y:0},
            top_left:{x:-0.5, y:0.5},
            top_right:{x:0.5, y:0.5},
            bottom_left:{x:-0.5, y:-0.5},
            bottom_right:{x:0.5, y:-0.5},

            top_center:{x:0, y:0.5},
            bottom_center:{x:0, y:-0.5},

            mid_right:{x:0.5, y:0},
            mid_left:{x:-0.5, y:0},
            mid_q_right:{x:0.4, y:0},
            mid_q_left:{x:-0.4, y:0}

        };


        var frustumFactor = 0.825;

        var GuiAnchors = function() {

        };

        GuiAnchors.prototype.initGuiAnchors = function() {

            for (var key in anchors) {
                this.addAnchor(key, anchors[key].x, anchors[key].y)
            }
        };

        GuiAnchors.prototype.addAnchor = function(key) {

            var anchorReady = function(widget) {
                widget.originalPosition.x = widget.anchor.x * frustumFactor;
                widget.originalPosition.y = widget.anchor.y * frustumFactor;
                widget.pos.copy(widget.originalPosition);
                widget.applyWidgetPosition();
                GuiAPI.setAnchorWidget(widget.anchor.key, widget)
            };

            var anchor = new GuiWidget("widget_gui_anchor");
            anchor.anchor = anchors[key];
            anchor.anchor.key = key;

            anchor.initGuiWidget(null, anchorReady);

        };

        GuiAnchors.prototype.removeGuiWidget = function() {

            this.guiWidget.removeChildren();
            this.guiWidget.recoverGuiWidget();

        };

        GuiAnchors.prototype.addChildWidgetToContainer = function(guiWidget) {
            this.guiWidget.disableWidgetInteraction();
            this.guiWidget.addChild(guiWidget);

            this.fitContainerChildren()

        };

        GuiAnchors.prototype.fitContainerChildren = function() {

            this.guiWidget.applyWidgetPosition()
        };

        GuiAnchors.prototype.setTestActiveCallback = function(cb) {
            this.guiWidget.addTestActiveCallback(cb);
        };


        return GuiAnchors;

    });