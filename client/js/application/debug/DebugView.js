import * as DebugUtils from "./DebugUtils.js";

class DebugView {
    constructor() {
        this.inspecting = {};
        this.isActive = false;
        let onActivate = function() {
            this.activateDebugView();
        }.bind(this);

        this.callbacks = {
            onActivate:onActivate
        }
    }

    debugModelInspection = function(event) {
        console.log("Debug View Models ", event);
    }

    initDebugView = function() {
        let onDebugModels = function(event) {
            this.debugModelInspection(event);
        }.bind(this);

        evt.on(ENUMS.Event.DEBUG_VIEW_MODELS, onDebugModels)

        let testActive = function() {
            return this.isActive;
        }.bind(this)

        DebugUtils.createDebugButton('DEBUG', this.callbacks.onActivate, testActive, 'top_left', 0.035, -0.01)

    }

    activateDebugView = function() {
        this.isActive = !this.isActive;
        if (!this.isActive) {
            this.deactivateDebugView()
            return;
        }
        this.page = GuiAPI.activatePage('page_debug_view');
        this.containers = this.page.containers;

        evt.dispatch(ENUMS.Event.DEBUG_VIEW_TOGGLE, {activate:this.isActive, container:this.containers['page_debug_top_right']})
        console.log("Activate Debug View", this.page)


        //    GuiAPI.getGuiDebug().setupDebugText(this.containers['page_home_bottom_left']);

    }

    deactivateDebugView() {
        this.page.closeGuiPage();
    }

}

export { DebugView }