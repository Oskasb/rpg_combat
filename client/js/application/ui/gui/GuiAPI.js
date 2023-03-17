import { WidgetBuilder } from "./widgets/WidgetBuilder.js";
import { GuiSettings } from "./GuiSettings.js";
import { Instantiator } from "./instancing/Instantiator.js";
import { GuiDebug } from "./systems/GuiDebug.js";

class GuiAPI {
    constructor() {
        this.aspect = 1;
        this.elementPools = {};
        this.inputSystem;
        this.textSystem;
        this.instantiator = new Instantiator();
        this.worldSpacePointers = [];
        this.guiSettings = new GuiSettings();
        this.widgetBuilder = new WidgetBuilder();
        this.basicText;
        this.txtSysKey = 'UI_TEXT_MAIN';
        this.guiUpdateCallbacks = [];
        this.inputUpdateCallbacks = [];
        this.aspectUpdateCallbacks = [];
        this.guiBuffers = {};
        this.anchorWidgets = {};
        this.registeredTextElements = {};

        let _this = this;

        let callInputUpdateCallbacks = function(input, buffer) {
            MATH.callAll(_this.inputUpdateCallbacks, input, buffer);
        };

        let callAspectUpdateCallbacks = function(aspect) {
            //        console.log("Aspect:", aspect);
            MATH.callAll(_this.aspectUpdateCallbacks, aspect);
        };


        let updateInput = function(INPUT_BUFFER) {
            let inputs = ENUMS.Numbers.POINTER_TOUCH0 + ENUMS.Numbers.TOUCHES_COUNT;
            for (let ib = 0; ib < inputs; ib++) {
                if (_this.readInputBufferValue(ib, INPUT_BUFFER, ENUMS.InputState.HAS_UPDATE )) {
                    callInputUpdateCallbacks(ib, INPUT_BUFFER)
                }
            }
        };

        this.calls = {
            callInputUpdateCallbacks:callInputUpdateCallbacks,
            callAspectUpdateCallbacks:callAspectUpdateCallbacks,
            updateInput:updateInput
        }


    };


    initGuiApi = function(onReadyCB) {

        let reqs = 0;
        let loads = 0;

        let loadCb = function() {
            loads++
            if (loads === reqs) {
                onReadyCB();
            }
        };

        let loadUiConfig = function(key, dataId) {
            reqs++;
            this.guiSettings.loadUiConfig(key, dataId, loadCb);
        };

        this.guiSettings.initGuiSprite("SPRITES", "FONT_16x16");
        this.guiSettings.initGuiSprite("SPRITES", "GUI_16x16");

        loadUiConfig("ICON_ELEMENTS", "GUI_16x16");
        loadUiConfig("SURFACE_LAYOUT", "SURFACES");

        loadUiConfig("WIDGET", "STANDARD_WIDGETS");

        loadUiConfig("FEEDBACK", "ICON");
        loadUiConfig("FEEDBACK", "SURFACE");
        loadUiConfig("FEEDBACK", "TEXT");
        loadUiConfig("SPRITE_FONT", "FONT_16x16");
        loadUiConfig("SURFACE_NINESLICE", "GUI_16x16");

    };

    addUiSystem = function(sysKey, uiSysKey, assetId, poolSize, renderOrder) {
        this.instantiator.addInstanceSystem(sysKey, uiSysKey, assetId, poolSize, renderOrder)
    };

    buildBufferElement = function(uiSysKey, cb) {
        this.instantiator.buildBufferElement(uiSysKey, cb)
    };



    registerTextSurfaceElement = function(elemKey, txtElem) {
        this.registeredTextElements[elemKey] = txtElem;
        this.textSystem.addTextElement(txtElem);
    };

    buildGuiWidget = function(widgetClassName, options, onReady) {
        this.widgetBuilder.buildWidget(widgetClassName, options, onReady);
    };

    buildWidgetOptions = function(configId, onActivate, testActive, interactive, text, offset_x, offset_y, anchor) {

        let opts = {};

        opts.configId = configId || 'button_big_blue';
        opts.onActivate = onActivate || null;
        opts.testActive = testActive || null;
        opts.interactive = interactive || false;
        opts.text = text || false;
        opts.offset_x = offset_x || null;
        opts.offset_y = offset_y || null;
        opts.anchor = anchor || false;

        return opts
    };

    setInputSystem = function(inputSys) {
        this.inputSystem = inputSys;
    };

    getInputSystem = function() {
        return this.inputSystem;
    };

    setTextSystem = function(txtSys) {
        this.textSystem = txtSys;
    };

    getTextSystem = function() {
        return this.textSystem;
    };

    getGuiDebug = function() {
        return GuiDebug;
    };

    getUiSprites = function(spriteKey) {
        return this.guiSettings.getUiSprites(spriteKey);
    };

    getGuiSettings = function() {
        return this.guiSettings;
    };

    getGuiSettingConfig = function(uiKey, dataKey, dataId) {
        return this.guiSettings.getSettingDataConfig(uiKey, dataKey, dataId);
    };


    debugDrawGuiPosition = function(x, y) {
        GuiDebug.debugDrawPoint(x, y)
    };

    debugDrawRectExtents = function(minVec, maxVec) {
        GuiDebug.drawRectExtents(minVec, maxVec)
    };

    printDebugText = function(string) {
        GuiDebug.addDebugTextString(string)
    };

    attachGuiToActor = function(actor) {
        actor.setActorGui(new ActorGui(actor))
    };

    detachActorGui = function(actor) {
        actor.getActorGui().removeAllGuiWidgets();
    };

    registerInteractiveGuiElement = function(surfaceElement) {
        this.inputSystem.registerInteractiveSurfaceElement(surfaceElement)
    };

    unregisterInteractiveGuiElement = function(surfaceElement) {
        this.inputSystem.unregisterInteractiveSurfaceElement(surfaceElement)
    };


    setAnchorWidget = function(key, widget) {
        this.anchorWidgets[key] = widget;
    };

    getAnchorWidget = function(key) {
        return this.anchorWidgets[key];
    };

    addInputUpdateCallback = function(cb) {
        this.inputUpdateCallbacks.push(cb);
    };

    removeInputUpdateCallback = function(cb) {
        MATH.quickSplice(this.inputUpdateCallbacks, cb);
    };

    addGuiUpdateCallback = function(cb) {
        this.guiUpdateCallbacks.push(cb);
    };

    removeGuiUpdateCallback = function(cb) {
        MATH.quickSplice(this.guiUpdateCallbacks, cb);
    };

    addAspectUpdateCallback = function(cb) {
        this.aspectUpdateCallbacks.push(cb);
    };

    removeAspectUpdateCallback = function(cb) {
        MATH.quickSplice(this.aspectUpdateCallbacks, cb);
    };


    applyAspectToScreenPosition = function(sourcePos, store) {
        store.copy(sourcePos);
        store.x = sourcePos.x * this.aspect;
    };

    setInputBufferValue = function(inputIndex, buffer, enumKey, value) {
        let idx = inputIndex*ENUMS.InputState.BUFFER_SIZE + enumKey;
        buffer[idx] = value;
    };

    readInputBufferValue = function(inputIndex, buffer, enumKey) {
        let idx = inputIndex*ENUMS.InputState.BUFFER_SIZE + enumKey;
        return buffer[idx]
    };

    setCameraAspect = function(camAspect) {
        if (this.aspect !== camAspect) {
            this.aspect = camAspect;
            this.calls.callAspectUpdateCallbacks(this.aspect);
        }
    };

    registerWorldSpacePointer = function(pointer) {
        this.worldSpacePointers.push(pointer);
    };

    unregisterWorldSpacePointer = function(pointer) {
        MATH.quickSplice(this.worldSpacePointers, pointer)
    };

    getWorldSpacePointers = function() {
        return this.worldSpacePointers
    };



    getTextSysKey = function() {
        return this.txtSysKey;
    };

    sampleInputState = function(INPUT_BUFFER) {



        this.calls.updateInput(INPUT_BUFFER);
        GuiDebug.updateDebugElements();
    };


    updateGui = function(tpf, time) {

        let dymmy1 = function(textWidget) {
            textWidget.printWidgetText("MOO "+Math.random(), 7)
        };

        GuiDebug.updateDebugElements();
        this.instantiator.updateInstantiatorBuffers();
        this.instantiator.monitorBufferStats();

        if (this.registeredTextElements['main_text_box']) {
            dymmy1(this.registeredTextElements['main_text_box']);
        }

        MATH.callAll(this.guiUpdateCallbacks, tpf, time);
        DebugAPI.generateTrackEvent('GUI_DT', time, 'ms', 2)
    };

}

export { GuiAPI }