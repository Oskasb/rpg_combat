import { GuiPointerWidget} from "../widgets/GuiPointerWidget.js";

class GuiPointer {
    constructor(inputIndex, pos, callback) {
            this.intersects = false;
            this.pos = new THREE.Vector3(pos.x, pos.y, pos.z);
            this.scale = new THREE.Vector3(1, 1, 1);
            this.interactiveElement = null;
            this.inputIndex = inputIndex;
            this.isSeeking = false;
            this.guiPointerWidget = new GuiPointerWidget(inputIndex);
            this.setupPointerElement("widget_input_pointer" , callback)
            this.setInputIndex(inputIndex)
        };

    setupPointerElement = function(configId, callback) {

        let addWidgetCb = function(guiPointerWidget) {
       //     console.log('Add guiPointerWidget ', guiPointerWidget);
            guiPointerWidget.setElementPosition(this.pos);

         //   callback(this)
        }.bind(this);

        this.guiPointerWidget.initPointerWidget(configId, addWidgetCb)

    };

        setPointerInteractiveElement = function(interactiveElement) {
            GuiAPI.printDebugText("SET POINTER ELEM");
            this.interactiveElement = interactiveElement;
        };

        getPointerInteractiveElement = function() {
            return this.interactiveElement;
        };

        pointerPressElementStart = function(interactiveElem) {
            if (this.getIsSeeking()) {
                this.setPointerInteractiveElement(interactiveElem);
                GuiAPI.printDebugText("ELEMENT POINTER - STATE: "+ENUMS.getKey('ElementState', interactiveElem.state));
                GuiAPI.unregisterWorldSpacePointer(this);
            } else {

            }
        };

        setIsSeeking = function(bool) {

            if (this.isSeeking !== bool){

                if (bool) {
                    GuiAPI.printDebugText("WORLD POINTER");
                    GuiAPI.registerWorldSpacePointer(this);
                }

            }

            this.isSeeking = bool;
        };

        getIsSeeking = function() {
            return this.isSeeking;
        };

        updatePointerInteractiveElement = function() {

           this.intersects = this.interactiveElement.testSurfaceIntersects(this.pos);

            if (this.intersects) {
                this.interactiveElement.notifyPointerPress(this.getInputIndex());
            } else {
            //    this.interactiveElement.notifyPointerPress(this.getInputIndex());
                this.interactiveElement = null;
            }

        };


        setInputIndex = function(inputIndex) {
            this.guiPointerWidget.guiWidget.printWidgetText(''+this.inputIndex);
            this.inputIndex = inputIndex;
        };

        getInputIndex = function() {
            return this.inputIndex;

        };

        setPointerPosition = function(vec3) {
            this.pos.copy(vec3);
            this.guiPointerWidget.setElementPosition(this.pos);
        };

        releasePointer = function() {
            this.isSeeking = false;
            this.intersects = false;
            this.interactiveElement = null;

            GuiAPI.unregisterWorldSpacePointer(this);
        //    this.guiPointerWidget.removeGuiWidget()
        };


        setPointerScale = function(vec3) {
            this.bufferElement.setScaleVec3(vec3)
        };

    }

    export { GuiPointer }
