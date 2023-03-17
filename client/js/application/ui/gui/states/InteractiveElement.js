"use strict";

define([

    ],
    function(

    ) {

        var InteractiveElement = function(surface) {
            this.surfaceElement = surface;
            this.state = ENUMS.ElementState.NONE;
            this.hoverIndices = [];
            this.pressIndices = [];
            this.pressActive = false;
        };

        InteractiveElement.prototype.getSurfaceElement = function() {
            return this.surfaceElement;
        };

        InteractiveElement.prototype.testSurfaceIntersects = function(vec3) {
            return this.surfaceElement.testIntersection(vec3.x, vec3.y);
        };

        InteractiveElement.prototype.setInteractiveState = function(state) {

    //        GuiAPI.printDebugText("" + ENUMS.getKey('ElementState', state));

            this.state = state;
            this.getSurfaceElement().applyStateFeedback()
        };


        InteractiveElement.prototype.getInteractiveElementState = function() {
            return this.state;
        };

        InteractiveElement.prototype.releasePressIndex = function(inputIndex) {
            MATH.quickSplice(this.pressIndices, inputIndex);
        };

        InteractiveElement.prototype.releaseHoverIndex = function(inputIndex) {
            MATH.quickSplice(this.hoverIndices, inputIndex);
        };

        InteractiveElement.prototype.notifyPointerPress = function(inputIndex) {
            this.pressActive = true;
            if (this.pressIndices.indexOf(inputIndex) === -1) {
                this.pressIndices.push(inputIndex);
                if (this.pressIndices.length === 1) {
                    this.onPressStart(inputIndex)
                }
            }
        };


        InteractiveElement.prototype.notifyHoverStateOn = function(inputIndex) {

            if (this.hoverIndices.indexOf(inputIndex) === -1) {
                this.hoverIndices.push(inputIndex);
                this.onHover()

            } else {

                if (this.pressActive) {
                    this.releasePressIndex(inputIndex);
                    this.onPressActivate(inputIndex);
                    this.pressActive = false;
                }
            }
        };

        InteractiveElement.prototype.notifyInputOutside = function(inputIndex) {
            this.pressActive = false;
            if (this.hoverIndices.indexOf(inputIndex) !== -1) {

                this.releaseHoverIndex(inputIndex);
                this.releasePressIndex(inputIndex);

                if (!this.hoverIndices.length) {
                    this.onHoverEnd()
                }
            }
        };


        InteractiveElement.prototype.onHover = function() {
            this.applyHoverState()
        };

        InteractiveElement.prototype.onHoverEnd = function() {
            this.applyActiveState();
        };

        InteractiveElement.prototype.onPressStart = function(inputIndex) {
            this.getSurfaceElement().triggerPressStart(inputIndex);
            this.applyPressState();
        };

        InteractiveElement.prototype.onPressActivate = function(inputIndex) {
            this.getSurfaceElement().triggerActiveate(inputIndex);
            this.applyActiveState();
        };


        InteractiveElement.prototype.applyHoverState = function() {

            GuiAPI.debugDrawRectExtents(this.surfaceElement.minXY, this.surfaceElement.maxXY);

            if ( this.getSurfaceElement().getActive()) {
                this.setInteractiveState(ENUMS.ElementState.ACTIVE_HOVER);
            } else {
                this.setInteractiveState(ENUMS.ElementState.HOVER);

            }
        };

        InteractiveElement.prototype.applyActiveState = function() {

            if ( this.getSurfaceElement().getActive()) {
                this.setInteractiveState(ENUMS.ElementState.ACTIVE);
            } else {
                this.setInteractiveState(ENUMS.ElementState.NONE);
            }
        };

        InteractiveElement.prototype.applyPressState = function() {

            if ( this.getSurfaceElement().getActive()) {
                this.setInteractiveState(ENUMS.ElementState.ACTIVE_PRESS);
            } else {
                this.setInteractiveState(ENUMS.ElementState.PRESS);
            }

        };

        return InteractiveElement;

    });

