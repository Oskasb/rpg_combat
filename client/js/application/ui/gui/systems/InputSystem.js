import { GuiPointer } from "../elements/GuiPointer.js";

class InputSystem {
    constructor() {
        this.uiSysId;
        this.surfaceElements = [];
        this.stupListener();
        this.tempVec1 = new THREE.Vector3();
        this.pointers = [];

    };

    initInputSystem = function(callback) {

        let _this = this;

        var onInputSetting = function(src, data) {
            _this.uiSysId = src;
            GuiAPI.addUiSystem(src, data.config["sprite_atlas"],  data.config["mesh_asset"],   data.config["pool_size"], data.config["render_order"]);
            callback();
        };

        var backplates = function(src, data) {
            GuiAPI.addUiSystem(src, data.config["sprite_atlas"],  data.config["mesh_asset"],   data.config["pool_size"], data.config["render_order"]);
            GuiAPI.getGuiSettings().initGuiSettings(["UI_ELEMENTS_MAIN"], onInputSetting);
        };

        GuiAPI.getGuiSettings().initGuiSettings(["UI_ELEMENTS_BACK"], backplates);

    };


    getIntersectingElement = function(x, y, inputIndex) {
        for (var i = 0; i < this.surfaceElements.length; i++) {
            let surface = this.surfaceElements[i];
            let intersects = surface.testIntersection(x, y);
            let interactiveElem = surface.getInteractiveElement();
            if (intersects) {
                return interactiveElem;
            } else {
                interactiveElem.notifyInputOutside(inputIndex)
            }
        }
    };



    updateInteractiveElements = function(inputIndex, x, y, pointer) {
        let interactiveElem;
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



    stupListener = function() {
        let pointers = this.pointers;
        let _this = this;
        var sampleInput = function(input, buffer) {
            let inputIndex = input;

            let startIndex = input // * ENUMS.InputState.BUFFER_SIZE;

            let inputBuffer = buffer;

            //    if (inputBuffer[startIndex + ENUMS.InputState.HAS_UPDATE] === 200) {
            GuiAPI.setInputBufferValue(startIndex, inputBuffer, ENUMS.InputState.HAS_UPDATE, 1)
            //    inputBuffer[startIndex + ENUMS.InputState.HAS_UPDATE] = 1;
            //    }

            let pointer = null;

            if (GuiAPI.readInputBufferValue(startIndex, inputBuffer, ENUMS.InputState.ACTION_0) ) {

                this.tempVec1.x = GuiAPI.readInputBufferValue(startIndex, inputBuffer, ENUMS.InputState.MOUSE_X)  ;
                this.tempVec1.y = GuiAPI.readInputBufferValue(startIndex, inputBuffer, ENUMS.InputState.MOUSE_Y)  ;
                this.tempVec1.z = 0 // (Math.random()-0.5 ) * 5 //;

                if (!pointers[inputIndex]) {

                    var addPointer = function(bufferElem) {
                        pointer = new GuiPointer(bufferElem);
                        pointer.setPointerPosition(tempVec1);
                        pointer.setIsSeeking(true);
                        pointers[inputIndex] = pointer;
                    };
                    pointers[inputIndex] = true;
                    GuiAPI.buildBufferElement(_this.uiSysId, addPointer)

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
                _this.updateInteractiveElements(
                    inputIndex,
                    GuiAPI.readInputBufferValue(startIndex, inputBuffer, ENUMS.InputState.MOUSE_X),
                    GuiAPI.readInputBufferValue(startIndex, inputBuffer, ENUMS.InputState.MOUSE_Y),
                    pointer)
            }

        }.bind(this);

        GuiAPI.addInputUpdateCallback(sampleInput);
    };

    registerInteractiveSurfaceElement = function(surfaceElement) {
        if (this.surfaceElements.indexOf(surfaceElement) === -1) {
            this.surfaceElements.push(surfaceElement);
        } else {
            console.log("Element already registered")
        }
    };

    unregisterInteractiveSurfaceElement = function(surfaceElement) {
        MATH.quickSplice(this.surfaceElements, surfaceElement);
    };

}

export { InputSystem }