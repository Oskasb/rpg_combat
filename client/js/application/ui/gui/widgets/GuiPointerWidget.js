import { GuiWidget} from "../elements/GuiWidget.js";

class GuiPointerWidget {
    constructor(inputIndex) {

        this.pos = new THREE.Vector3();
        this.origin = new THREE.Vector3();
        this.offset = new THREE.Vector3();
        this.inputIndex = inputIndex;
        this.releaseTime = 0;
        this.releaseProgress = 0;
        this.releaseDuration = 0.75;

        this.applyInputCallbacks = [];

        let notifyInputUpdated = function(value) {
            console.log("Pointer state callback fires.. ", value, this)
        }.bind(this);

        this.callbacks = {
            notifyInputUpdated:notifyInputUpdated
        }

    };


    initPointerWidget = function(widgetConfig, onReady) {

        let widgetRdy = function(widget) {
        //    widget.attachToAnchor('center');
            widget.setWidgetIconKey('pinpoint_crosshair');
        //    widget.addOnPressStartCallback(this.callbacks.onPressStart);
            widget.printWidgetText(this.inputIndex);
            onReady(this)
        }.bind(this);

        this.guiWidget = new GuiWidget(widgetConfig);
        this.guiWidget.initGuiWidget(null, widgetRdy);

    };

    setElementPosition = function(posVec3) {
        this.guiWidget.offsetWidgetPosition(posVec3);
    };

    addInputUpdateCallback = function(applyInputUpdate) {
        this.applyInputCallbacks.push(applyInputUpdate)
    };

    notifyInputUpdated = function(ang, dist) {

        for (let i = 0; i < this.applyInputCallbacks.length; i++) {
            this.applyInputCallbacks[i](ang, dist);
        }
    };

    removeGuiWidget = function() {
        MATH.emptyArray(this.applyInputCallbacks);
        this.guiWidget.recoverGuiWidget()
    };

}
export { GuiPointerWidget }