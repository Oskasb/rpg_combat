import { GuiPointerWidget} from "../widgets/GuiPointerWidget.js";

class GuiPointer {
    constructor(inputIndex, pos) {
            this.intersects = false;
            this.pos = new THREE.Vector3(0, 0, 0);
            this.scale = new THREE.Vector3(1, 1, 1);
            this.interactiveElement = null;
            this.inputIndex = inputIndex;
            this.isSeeking = false;
            this.isHovering = false;
            this.guiPointerWidget = new GuiPointerWidget(inputIndex);
            this.setupPointerElement( this.configId);
            this.setInputIndex(inputIndex)
        };

        setupPointerElement = function(configId) {

        let addWidgetCb = function(guiPointerWidget) {
            guiPointerWidget.setElementPosition(this.pos);
        //    guiPointerWidget.guiWidget.printWidgetText(''+this.inputIndex);
        //    this.deactivatePointerWidget(0.15);
        }.bind(this);

        this.guiPointerWidget.initPointerWidget(addWidgetCb)

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
            this.guiPointerWidget.showPointerWidgetSeeking();
            if (this.isSeeking !== bool){

                if (bool) {
                    GuiAPI.printDebugText("WORLD POINTER");
                    GuiAPI.registerWorldSpacePointer(this);
                    this.guiPointerWidget.showPointerWorldSeeking();
                }

            } else {
                if (bool) {
                //    this.setupPointerElement(this.configId);
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
            this.isHovering = bool;
        }

        getPointerHoverig() {
            return this.isHovering;
        }

        deactivatePointerWidget(time) {
            this.guiPointerWidget.showPointerWidgetReleased(time);
        }

        releasePointer = function() {
            GuiAPI.printDebugText("RELEASE")
            this.isSeeking = false;
            this.intersects = false;
            this.interactiveElement = null;

            GuiAPI.unregisterWorldSpacePointer(this);
            this.deactivatePointerWidget(0.15);

        //    this.bufferElement.applyDuration(1);
        //    this.bufferElement.startLifecycleNow();
        //    this.guiPointerWidget.removeGuiWidget()
        };


        setPointerScale = function(vec3) {
            this.bufferElement.setScaleVec3(vec3)
        };

    }

    export { GuiPointer }
