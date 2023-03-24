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

        let _this = this;
        let sampleInput = function(inputIndex, pointerState) {
            let pointers = this.pointers;

            let pointer = null;
            let tempVec = this.tempVec1;

            if (pointerState.action[0]) {

                tempVec.x = pointerState.posX ;
                tempVec.y = pointerState.posY ;
                tempVec.z = 0;

            //    GameScreen.fitView(tempVec);

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

                    let interactiveElem = _this.getIntersectingElement(tempVec.x, tempVec.y, inputIndex);

                    if (interactiveElem === pointers[inputIndex].getPointerInteractiveElement()) {
                        GuiAPI.printDebugText("RELEASE POINTER ON ACTIVE ELEMENT");
                //        pointer.pointerPressElementStart(interactiveElem);
                    } else {
                        GuiAPI.printDebugText("RELEASE POINTER");
                    }
                    
                    pointer.releasePointer();
                    pointer = null;
                    pointers[inputIndex] = null;
                }
            }

            _this.updateInteractiveElements( inputIndex, pointerState.posX, pointerState.posY, pointer)

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