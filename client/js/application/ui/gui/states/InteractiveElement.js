class InteractiveElement {

    constructor(surface) {
            this.surfaceElement = surface;
            this.state = ENUMS.ElementState.NONE;
            this.hoverIndices = [];
            this.pressIndices = [];
            this.pressActive = false;
        };

        getSurfaceElement = function() {
            return this.surfaceElement;
        };

        testSurfaceIntersects = function(vec3) {
            return this.surfaceElement.testIntersection(vec3.x, vec3.y);
        };

        setInteractiveState = function(state) {

            GuiAPI.printDebugText("INT STATE: " + ENUMS.getKey('ElementState', state));

            this.state = state;
            this.getSurfaceElement().applyStateFeedback()
        };


        getInteractiveElementState = function() {
            return this.state;
        };

        releasePressIndex = function(inputIndex) {
            MATH.quickSplice(this.pressIndices, inputIndex);
        };

        releaseHoverIndex = function(inputIndex) {
            MATH.quickSplice(this.hoverIndices, inputIndex);
        };

        notifyPointerPress = function(inputIndex) {
            this.pressActive = true;
            if (this.pressIndices.indexOf(inputIndex) === -1) {
                this.pressIndices.push(inputIndex);
                if (this.pressIndices.length === 1) {
                    this.onPressStart(inputIndex)
                }
            }
        };


        notifyHoverStateOn = function(inputIndex) {

            if (this.hoverIndices.indexOf(inputIndex) === -1) {
                this.hoverIndices.push(inputIndex);
                this.onHover()

            } else {

                if (this.pressActive) {
                    this.releasePressIndex(inputIndex);
                    this.onPressActivate(inputIndex);
                    this.pressActive = false;
                }
            }
        };

        notifyInputOutside = function(inputIndex) {
            this.pressActive = false;
            if (this.hoverIndices.indexOf(inputIndex) !== -1) {

                this.releaseHoverIndex(inputIndex);
                this.releasePressIndex(inputIndex);

                if (!this.hoverIndices.length) {
                    this.onHoverEnd()
                }
            }
        };


        onHover = function() {
            this.applyHoverState()
        };

        onHoverEnd = function() {
            this.applyActiveState();
        };

        onPressStart = function(inputIndex) {
            this.getSurfaceElement().triggerPressStart(inputIndex);
            this.applyPressState();
        };

        onPressActivate = function(inputIndex) {
            this.getSurfaceElement().triggerActiveate(inputIndex);
            this.applyActiveState();
        };


        applyHoverState = function() {

            GuiAPI.debugDrawRectExtents(this.surfaceElement.minXY, this.surfaceElement.maxXY);

            if ( this.getSurfaceElement().getActive()) {
                this.setInteractiveState(ENUMS.ElementState.ACTIVE_HOVER);
            } else {
                this.setInteractiveState(ENUMS.ElementState.HOVER);

            }
        };

        applyActiveState = function() {

            if ( this.getSurfaceElement().getActive()) {
                this.setInteractiveState(ENUMS.ElementState.ACTIVE);
            } else {
                this.setInteractiveState(ENUMS.ElementState.NONE);
            }
        };

        applyPressState = function() {

            if ( this.getSurfaceElement().getActive()) {
                this.setInteractiveState(ENUMS.ElementState.ACTIVE_PRESS);
            } else {
                this.setInteractiveState(ENUMS.ElementState.PRESS);
            }

        };


    }

    export { InteractiveElement }

