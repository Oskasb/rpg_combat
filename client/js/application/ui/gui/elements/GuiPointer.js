import { GuiPointerWidget} from "../widgets/GuiPointerWidget.js";

class GuiPointer {
    constructor(inputIndex, dragDistance) {
            this.intersects = false;
            this.dragDistance = dragDistance;
            this.pos = new THREE.Vector3(0, 0, 0);
            this.scale = new THREE.Vector3(1, 1, 1);
            this.interactiveElement = null;
            this.inputIndex = inputIndex;
            this.worldSpaceIndicator = null;
            this.worldSpaceTarget = null;
            this.isSeeking = false;
            this.isHovering = false;
            this.isMovementInput = false;
            this.guiPointerWidget = new GuiPointerWidget(inputIndex);
            this.setupPointerElement( this.configId);
            this.setInputIndex(inputIndex);
        };

        setupPointerElement = function(configId) {

        let addWidgetCb = function(guiPointerWidget) {
            guiPointerWidget.setElementPosition(this.pos);
        //    guiPointerWidget.guiWidget.printWidgetText(''+this.inputIndex);
            this.deactivatePointerWidget();
        }.bind(this);

        this.guiPointerWidget.initPointerWidget(addWidgetCb)

    };

        setPointerInteractiveElement = function(interactiveElement) {
         //   GuiAPI.printDebugText("SET POINTER ELEM");
            this.interactiveElement = interactiveElement;
        };

        getPointerInteractiveElement = function() {
            return this.interactiveElement;
        };

        pointerPressElementStart = function(interactiveElem) {
            GuiAPI.unregisterWorldSpacePointer(this);
            this.guiPointerWidget.showPointerWidgetSeeking();
                this.setPointerInteractiveElement(interactiveElem);
             //   GuiAPI.printDebugText("ELEMENT POINTER - STATE: "+ENUMS.getKey('ElementState', interactiveElem.state));


        };

        pointerPressWorldStart = function() {
            GuiAPI.registerWorldSpacePointer(this);
            this.guiPointerWidget.showPointerWorldSeeking();
        };

        setIsSeeking = function(bool) {

            if (this.isSeeking !== bool){

                if (bool) {
               //     GuiAPI.printDebugText("WORLD POINTER");

                }

            } else {
                if (bool) {
                    this.guiPointerWidget.showPointerWidgetSeeking();
                }
            }

            this.isSeeking = bool;
        };

        getIsSeeking = function() {
            return this.isSeeking;
        };

        setInputIndex = function(inputIndex) {
        //    this.guiPointerWidget.guiWidget.printWidgetText(''+this.inputIndex);
            this.inputIndex = inputIndex;
        };

        getInputIndex = function() {
            return this.inputIndex;

        };

        setPointerPosition = function(vec3) {
            this.pos.copy(vec3);
            this.guiPointerWidget.setElementPosition(this.pos);
        };

        setPointerHovering(bool) {
            if (bool) {
                this.guiPointerWidget.showPointerWidgetHovering();
            }
            this.isHovering = bool;
        }

        getPointerHovering() {
            return this.isHovering;
        }

    getPointerHasDragState() {
            return (Math.abs(this.dragDistance[0]) + Math.abs(this.dragDistance[1]))
    }

        deactivatePointerWidget() {
            this.guiPointerWidget.showPointerWidgetReleased();
        }

        releasePointer = function() {
        //    GuiAPI.printDebugText("RELEASE")
            this.isSeeking = false;
            this.intersects = false;
            this.interactiveElement = null;

            GuiAPI.releaseWorldSpacePointer(this);
            this.deactivatePointerWidget();

        };


    }

    export { GuiPointer }
