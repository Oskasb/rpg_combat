class GuiPointer {
    constructor(element) {
            this.intersects = false;
            this.pos = new THREE.Vector3(0, 0, 0);
            this.bufferElement = element;
            this.pointerState = null;
            this.interactiveElement = null;
            this.targetElementState = null;
            this.inputIndex = null;
            this.isSeeking = false;
        };

        setPointerInteractiveElement = function(interactiveElement) {
            this.interactiveElement = interactiveElement;
        };

        getPointerInteractiveElement = function() {
            return this.interactiveElement;
        };

        pointerPressElementStart = function(interactiveElem) {
            if (this.getIsSeeking()) {
                this.setPointerInteractiveElement(interactiveElem);
                GuiAPI.printDebugText("ELEMENT POINTER");
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

            this.setIsSeeking(false);

           this.intersects = this.interactiveElement.testSurfaceIntersects(this.pos);

            if (this.intersects) {
                this.interactiveElement.notifyPointerPress(this.getInputIndex());
            } else {
                this.interactiveElement = null;
            }

        };


        setInputIndex = function(inputIndex) {
            this.inputIndex = inputIndex;
        };

        getInputIndex = function() {
            return this.inputIndex;
        };


        setPointerPosition = function(vec3) {
            this.pos.copy(vec3);
            this.bufferElement.setPositionVec3(vec3)
        };

        releasePointer = function() {
            GuiAPI.unregisterWorldSpacePointer(this);
            this.bufferElement.releaseElement()
        };


        setPointerScale = function(vec3) {
            this.bufferElement.setScaleVec3(vec3)
        };

    }

    export { GuiPointer }
