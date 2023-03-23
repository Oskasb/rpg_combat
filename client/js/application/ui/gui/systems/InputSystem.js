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
    //    GuiAPI.debugDrawGuiPosition(x, y);

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

        let _this = this;
        let sampleInput = function(inputIndex, pointerState) {
            let pointers = this.pointers;
        //    console.log("Sample input: ", inputIndex, pointerState);


        //    let startIndex = inputIndex // * ENUMS.InputState.BUFFER_SIZE;

        //    let inputBuffer = buffer;

            //    if (inputBuffer[startIndex + ENUMS.InputState.HAS_UPDATE] === 200) {
        //    GuiAPI.setInputBufferValue(startIndex, inputBuffer, ENUMS.InputState.HAS_UPDATE, 1)
            //    inputBuffer[startIndex + ENUMS.InputState.HAS_UPDATE] = 1;
            //    }

            let pointer = null;
            let tempVec = this.tempVec1;

            if (pointerState.action[0]) {

                tempVec.x = pointerState.posX ;
                tempVec.y = pointerState.posY ;
                tempVec.z = -0.5;

                if (!pointers[inputIndex]) {

                    let pointerReadyCB = function(guiPointer) {
                        pointerState.guiPointer = guiPointer;
                    };

                        pointer = new GuiPointer(tempVec, pointerReadyCB);
                        pointer.setIsSeeking(true);
                        pointers[inputIndex] = pointer;

                } else {

                    pointer = pointers[inputIndex];
                //    pointer.setInputIndex(inputIndex);
                    pointer.setPointerPosition(tempVec)

                }

            } else {

                if (pointers[inputIndex]) {
                    pointer = pointers[inputIndex];
                    pointer.releasePointer();
                    pointer = null;
                    pointers[inputIndex] = null;
                }

            }

            let hasUpdate = true //GuiAPI.readInputBufferValue(startIndex, inputBuffer, ENUMS.InputState.HAS_UPDATE);

            if (hasUpdate) {
                hasUpdate++;
            //    GuiAPI.setInputBufferValue(startIndex, inputBuffer, ENUMS.InputState.HAS_UPDATE, hasUpdate);
                _this.updateInteractiveElements( inputIndex, pointerState.posX, pointerState.posY, pointer)
            }

        }.bind(this);

        GuiAPI.addInputUpdateCallback(sampleInput);
    };

    registerInteractiveSurfaceElement = function(surfaceElement) {
    //    console.log("registerInteractiveSurfaceElement: ", surfaceElement)
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