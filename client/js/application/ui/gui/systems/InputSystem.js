import { GuiPointer } from "../elements/GuiPointer.js";

class InputSystem {
    constructor() {
        this.uiSysId;
        this.surfaceElements = [];
        this.setupListener();
        this.preloadedPointers = [];
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

        let tempVec = ThreeAPI.tempVec3;
        for (let i = 0; i < 11; i++) {
            this.preloadedPointers.push(new GuiPointer(i, tempVec))
        }

    };


    getIntersectingElement = function(x, y, inputIndex) {
        let element;
        for (let i = 0; i < this.surfaceElements.length; i++) {
            let surface = this.surfaceElements[i];
            let intersects = surface.testIntersection(x, y);
            let interactiveElem = surface.getInteractiveElement();
            if (intersects) {
                element = interactiveElem;
            } else {
                interactiveElem.notifyInputOutside(inputIndex)
            }
        }
        return element;
    };



    updateInteractiveElements = function(inputIndex, x, y, pointer) {
        let interactiveElem;
        //    GuiAPI.debugDrawGuiPosition(x, y);

        if (pointer.getIsSeeking()) {

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


    setupListener = function() {

        let _this = this;

        let sampleInput = function(inputIndex, pointerState) {
            let guiPointer = pointerState.guiPointer;

            if (inputIndex !== guiPointer.inputIndex) {
                console.log("bad")
            }

            let tempVec = ThreeAPI.tempVec3;
            tempVec.x = pointerState.posX ;
            tempVec.y = pointerState.posY ;
            tempVec.z = 0;

            let interactiveElem = _this.getIntersectingElement(tempVec.x, tempVec.y, inputIndex);

            if (pointerState.action[0]) {

                guiPointer.setPointerPosition(tempVec)

                if (!guiPointer.isSeeking && pointerState.pressFrames === 1) {
                    guiPointer.setIsSeeking(true);
                }

            } else {
                if (guiPointer.getIsSeeking()) {
                    if (interactiveElem === pointerState.guiPointer.getPointerInteractiveElement()) {
                        GuiAPI.printDebugText("RELEASE POINTER ON ACTIVE ELEMENT");

                        interactiveElem.onPressActivate(inputIndex);
                    //    interactiveElem.notifyHoverStateOn(inputIndex);
                        //        pointer.pointerPressElementStart(interactiveElem);
                    } else {
                        GuiAPI.printDebugText("RELEASE POINTER "+inputIndex);
                    }

                    guiPointer.releasePointer();

                }
            }

            _this.updateInteractiveElements( inputIndex, pointerState.posX, pointerState.posY, guiPointer)

        };

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