"use strict";

define([
        'client/js/workers/main/ui/elements/GuiPointer'
    ],
    function(
        GuiPointer
    ) {

        var startIndex;

        var inputIndex;
        var inputBuffer;
        var tempVec1 = new THREE.Vector3();

        var pointers = [];

        var pointer;

        var uiSysId;
        var surface;
        var intersects;

        var InputSystem = function() {

            this.surfaceElements = [];
            this.stupListener();

        };


        InputSystem.prototype.initInputSystem = function(callback) {

            var onInputSetting = function(src, data) {

                uiSysId = src;
                GuiAPI.addUiSystem(src, data.config["sprite_atlas"],  data.config["mesh_asset"],   data.config["pool_size"], data.config["render_order"]);
                callback();
            };

            var backplates = function(src, data) {
                GuiAPI.addUiSystem(src, data.config["sprite_atlas"],  data.config["mesh_asset"],   data.config["pool_size"], data.config["render_order"]);
                GuiAPI.getGuiSettings().initGuiSettings(["UI_ELEMENTS_MAIN"], onInputSetting);
            };

            GuiAPI.getGuiSettings().initGuiSettings(["UI_ELEMENTS_BACK"], backplates);

        };


        InputSystem.prototype.getIntersectingElement = function(x, y, inputIndex) {
            for (var i = 0; i < this.surfaceElements.length; i++) {
                surface = this.surfaceElements[i];

                intersects = surface.testIntersection(x, y);

                interactiveElem = surface.getInteractiveElement();

                if (intersects) {
                    return interactiveElem;
                } else {
                    interactiveElem.notifyInputOutside(inputIndex)
                }
            }
        };

        var interactiveElem;

        InputSystem.prototype.updateInteractiveElements = function(inputIndex, x, y, pointer) {

            GuiAPI.debugDrawGuiPosition(x, y);

            if (pointer) {

                if (pointer.getPointerInteractiveElement()) {
                    pointer.updatePointerInteractiveElement();
                    return;
                }

                interactiveElem = this.getIntersectingElement(x, y, inputIndex);

                if (interactiveElem) {
                    pointer.pointerPressElementStart(interactiveElem);
                } else {
                    pointer.setIsSeeking(false);
                }

            } else {

                interactiveElem = this.getIntersectingElement(x, y, inputIndex);

                if (interactiveElem) {
                    interactiveElem.notifyHoverStateOn(inputIndex);
                }
            }

        };



        InputSystem.prototype.stupListener = function() {

            var sampleInput = function(input, buffer) {
                inputIndex = input;

                startIndex = input // * ENUMS.InputState.BUFFER_SIZE;

                inputBuffer = buffer;

            //    if (inputBuffer[startIndex + ENUMS.InputState.HAS_UPDATE] === 200) {
                GuiAPI.setInputBufferValue(startIndex, inputBuffer, ENUMS.InputState.HAS_UPDATE, 1)
            //    inputBuffer[startIndex + ENUMS.InputState.HAS_UPDATE] = 1;
            //    }

                pointer = null;

                if (GuiAPI.readInputBufferValue(startIndex, inputBuffer, ENUMS.InputState.ACTION_0) ) {

                    tempVec1.x = GuiAPI.readInputBufferValue(startIndex, inputBuffer, ENUMS.InputState.MOUSE_X)  ;
                    tempVec1.y = GuiAPI.readInputBufferValue(startIndex, inputBuffer, ENUMS.InputState.MOUSE_Y)  ;
                    tempVec1.z = 0 // (Math.random()-0.5 ) * 5 //;

                    if (!pointers[inputIndex]) {

                        var addPointer = function(bufferElem) {
                            pointer = new GuiPointer(bufferElem);
                            pointer.setPointerPosition(tempVec1);
                            pointer.setIsSeeking(true);
                            pointers[inputIndex] = pointer;
                        };
                        pointers[inputIndex] = true;
                        GuiAPI.buildBufferElement(uiSysId, addPointer)

                    } else {

                        pointer = pointers[inputIndex];
                        pointer.setInputIndex(inputIndex);
                        pointer.setPointerPosition(tempVec1)

                    }

                } else {

                    if (pointers[inputIndex]) {
                        pointer = pointers[inputIndex];
                        pointer.releasePointer();
                        pointer = null;
                        pointers[inputIndex] = null;
                    }

                }

                let hasUpdate =  GuiAPI.readInputBufferValue(startIndex, inputBuffer, ENUMS.InputState.HAS_UPDATE);

                if (hasUpdate) {
                    hasUpdate++;
                    GuiAPI.setInputBufferValue(startIndex, inputBuffer, ENUMS.InputState.HAS_UPDATE, hasUpdate);
                    this.updateInteractiveElements(
                        inputIndex,
                        GuiAPI.readInputBufferValue(startIndex, inputBuffer, ENUMS.InputState.MOUSE_X),
                        GuiAPI.readInputBufferValue(startIndex, inputBuffer, ENUMS.InputState.MOUSE_Y),
                        pointer)
                }

            }.bind(this);

            GuiAPI.addInputUpdateCallback(sampleInput);
        };

        InputSystem.prototype.registerInteractiveSurfaceElement = function(surfaceElement) {
            if (this.surfaceElements.indexOf(surfaceElement) === -1) {
                this.surfaceElements.push(surfaceElement);
            } else {
                console.log("Element already registered")
            }
        };

        InputSystem.prototype.unregisterInteractiveSurfaceElement = function(surfaceElement) {
            MATH.quickSplice(this.surfaceElements, surfaceElement);
        };


        return InputSystem;

    });