"use strict";

define([

    ],
    function(

    ) {

    var intersects;

        var GuiPointer = function(element) {
            this.pos = new THREE.Vector3(0, 0, 0);
            this.bufferElement = element;
            this.pointerState = null;
            this.interactiveElement = null;
            this.targetElementState = null;
            this.inputIndex = null;
            this.isSeeking = false;
        };

        GuiPointer.prototype.setPointerInteractiveElement = function(interactiveElement) {
            this.interactiveElement = interactiveElement;
        };

        GuiPointer.prototype.getPointerInteractiveElement = function() {
            return this.interactiveElement;
        };

        GuiPointer.prototype.pointerPressElementStart = function(interactiveElem) {
            if (this.getIsSeeking()) {
                this.setPointerInteractiveElement(interactiveElem);
                GuiAPI.printDebugText("ELEMENT POINTER");
                GuiAPI.unregisterWorldSpacePointer(this);
            } else {

            }
        };

        GuiPointer.prototype.setIsSeeking = function(bool) {

            if (this.isSeeking !== bool){

                if (bool) {
                    GuiAPI.printDebugText("WORLD POINTER");
                    GuiAPI.registerWorldSpacePointer(this);
                }

            }

            this.isSeeking = bool;
        };

        GuiPointer.prototype.getIsSeeking = function() {
            return this.isSeeking;
        };

        GuiPointer.prototype.updatePointerInteractiveElement = function() {

            this.setIsSeeking(false);

            intersects = this.interactiveElement.testSurfaceIntersects(this.pos);

            if (intersects) {
                this.interactiveElement.notifyPointerPress(this.getInputIndex());
            } else {
                this.interactiveElement = null;
            }

        };


        GuiPointer.prototype.setInputIndex = function(inputIndex) {
            this.inputIndex = inputIndex;
        };

        GuiPointer.prototype.getInputIndex = function() {
            return this.inputIndex;
        };


        GuiPointer.prototype.setPointerPosition = function(vec3) {
            this.pos.copy(vec3);
            this.bufferElement.setPositionVec3(vec3)
        };

        GuiPointer.prototype.releasePointer = function() {
            GuiAPI.unregisterWorldSpacePointer(this);
            this.bufferElement.releaseElement()
        };


        GuiPointer.prototype.setPointerScale = function(vec3) {
            this.bufferElement.setScaleVec3(vec3)
        };

        return GuiPointer;

    });