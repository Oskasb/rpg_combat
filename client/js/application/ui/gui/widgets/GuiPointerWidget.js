import { GuiWidget} from "../elements/GuiWidget.js";

class GuiPointerWidget {
    constructor(inputIndex) {
        let sprite = {x:7, y:0, z:0.1, w:0.1};
        this.pos = new THREE.Vector3();
        this.origin = new THREE.Vector3();
        this.offset = new THREE.Vector3();
        this.inputIndex = inputIndex;
        this.releaseTime = 2;
        this.releaseProgress = 0;
        this.releaseDuration = 0.75;

        this.numSurfaces = 4;
        this.surfaceElements = [];
        this.hostWidgets = [];
        this.applyInputCallbacks = [];

        let notifyInputUpdated = function(value) {
            console.log("Pointer state callback fires.. ", value, this)
        }.bind(this);

        let applySpriteToNineslice = function(bufferElem, x, y, z, w) {
            sprite.x = x;
            sprite.y = y;
            sprite.z = z;
            sprite.w = w;
            bufferElem.setSprite(sprite);
        };

        let applyLifecycle = function(bufferElem, x, y, z, w, end) {
                bufferElem.lifecycle.x = x;
                bufferElem.lifecycle.y = y;
                bufferElem.lifecycle.z = z;
                bufferElem.lifecycle.w = w;
                if (end) {
                    bufferElem.applyDuration(w);
                }
                bufferElem.startLifecycleNow();
        };

        this.callbacks = {
            notifyInputUpdated:notifyInputUpdated,
            applySpriteToNineslice:applySpriteToNineslice,
            applyLifecycle:applyLifecycle
        }

    };


    initPointerWidget = function(onReady) {

        let widgetRdy = function(widget) {
            let bufferElem = widget.guiSurface.getBufferElement();
            this.hostWidgets.push(widget)
            this.surfaceElements.push(bufferElem);

            if (this.numSurfaces === this.surfaceElements.length) {
                onReady(this)
            }

        }.bind(this);

        for (let i = 0; i < this.numSurfaces; i++) {
            let guiWidget = new GuiWidget("widget_input_pointer");
            guiWidget.initGuiWidget(null, widgetRdy);
        }

    };

    showPointerWidgetSeeking() {

        for (let i = 0; i < this.surfaceElements.length; i++) {
            this.callbacks.applyLifecycle(this.surfaceElements[i], 0, 0.4, 999999, 0.5)
            this.callbacks.applySpriteToNineslice(this.surfaceElements[i], 7, 0, 0.03+i*0.01, 0.03+i*0.01)
        }
    }

    showPointerWorldSeeking() {

        let count = this.surfaceElements.length
        for (let i = 0; i < count; i++) {
            let offsetX = 0.025 + (count*0.5-i-1) * 0.015;
            let offsetY = 0.025 + (-count*0.5 +i) * 0.015;
            this.callbacks.applySpriteToNineslice(this.surfaceElements[i], 7, 0, offsetX, offsetY)
        }

    }

    showPointerWidgetReleased() {

        for (let i = 0; i < this.surfaceElements.length; i++) {
            this.callbacks.applyLifecycle(this.surfaceElements[i], 0, 0.0, 999999, 0.3, true)
        //    this.callbacks.applySpriteToNineslice(this.surfaceElements[i], 7, 0, 0.03+i*0.01, 0.03+i*0.01)
        }
    }

    setElementPosition = function(posVec3) {
        this.pos.copy(posVec3);
    //    this.guiWidget.icon.getBufferElement().setPositionVec3(this.pos);
    //    this.guiWidget.guiSurface.getBufferElement().setPositionVec3(this.pos);

    //    posVec3.x = 0;
    //    posVec3.y = 0;
    //    posVec3.z = -1;

        for (let i = 0; i < this.hostWidgets.length; i++) {
        //    this.callbacks.applyLifecycle(this.surfaceElements[i], 0, 0.4, 999999, 0.5, false)
            this.surfaceElements[i].setPositionVec3(posVec3);

        //    this.hostWidgets[i].offsetWidgetPosition(posVec3)
        //    this.callbacks.applySpriteToNineslice(this.surfaceElements[i], 7, 0, 0.015+i*0.01, 0.025+i*0.01)
        }

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
        for (let i = 0; i < this.hostWidgets.length; i++) {
            this.hostWidgets[i].recoverGuiWidget()
            //    this.callbacks.applySpriteToNineslice(this.surfaceElements[i], 7, 0, 0.03+i*0.01, 0.03+i*0.01)
        }
    };

}
export { GuiPointerWidget }