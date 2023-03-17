"use strict";

var GuiAPI;

define([
        'application/ExpandingPool',
        'ui/widgets/WidgetBuilder',
        'ui/GuiSettings',
        'workers/main/instancing/Instantiator',
        'ui/systems/GuiDebug',
        'ui/ActorGui'
    ],
    function(
        ExpandingPool,
        WidgetBuilder,
        GuiSettings,
        Instantiator,
        GuiDebug,
        ActorGui
    ) {

        var i;
        var inputs;
        var ib;
        var guiSystems = [];

        var aspect = 1;

        var elementPools = {};

        var inputSystem;
        var textSystem;

        var instantiator = new Instantiator();

        var worldSpacePointers = [];

        var guiSettings = new GuiSettings();
        var widgetBuilder = new WidgetBuilder();

        var basicText;

        var txtSysKey = 'UI_TEXT_MAIN';

        var guiUpdateCallbacks = [];
        var inputUpdateCallbacks = [];
        var aspectUpdateCallbacks = [];

        var guiBuffers = {};


        var anchorWidgets = {};

        var GuiAPI = function() {

        };


        GuiAPI.initGuiApi = function(onReadyCB) {

            var reqs = 0;
            var loads = 0;

            var loadCb = function() {
                loads++
                if (loads === reqs) {
                    onReadyCB();
                }
            };

            var loadUiConfig = function(key, dataId) {
                reqs++;
                guiSettings.loadUiConfig(key, dataId, loadCb);
            };

            guiSettings.initGuiSprite("SPRITES", "FONT_16x16");
            guiSettings.initGuiSprite("SPRITES", "GUI_16x16");

            loadUiConfig("ICON_ELEMENTS", "GUI_16x16");
            loadUiConfig("SURFACE_LAYOUT", "SURFACES");

            loadUiConfig("WIDGET", "STANDARD_WIDGETS");

            loadUiConfig("FEEDBACK", "ICON");
            loadUiConfig("FEEDBACK", "SURFACE");
            loadUiConfig("FEEDBACK", "TEXT");
            loadUiConfig("SPRITE_FONT", "FONT_16x16");
            loadUiConfig("SURFACE_NINESLICE", "GUI_16x16");

        };

        GuiAPI.addUiSystem = function(sysKey, uiSysKey, assetId, poolSize, renderOrder) {
            instantiator.addInstanceSystem(sysKey, uiSysKey, assetId, poolSize, renderOrder)
        };

        GuiAPI.buildBufferElement = function(uiSysKey, cb) {
            instantiator.buildBufferElement(uiSysKey, cb)
        };

        var registeredTextElements = {};

        GuiAPI.registerTextSurfaceElement = function(elemKey, txtElem) {
            registeredTextElements[elemKey] = txtElem;
            textSystem.addTextElement(txtElem);
        };

        GuiAPI.buildGuiWidget = function(widgetClassName, options, onReady) {
            widgetBuilder.buildWidget(widgetClassName, options, onReady);
        };

        GuiAPI.buildWidgetOptions = function(configId, onActivate, testActive, interactive, text, offset_x, offset_y, anchor) {

            var opts = {};

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

        GuiAPI.setInputSystem = function(inputSys) {
            inputSystem = inputSys;
        };

        GuiAPI.getInputSystem = function() {
            return inputSystem;
        };

        GuiAPI.setTextSystem = function(txtSys) {
            textSystem = txtSys;
        };

        GuiAPI.getTextSystem = function() {
            return textSystem;
        };

        GuiAPI.getGuiDebug = function() {
            return GuiDebug;
        };

        GuiAPI.getUiSprites = function(spriteKey) {
            return guiSettings.getUiSprites(spriteKey);
        };

        GuiAPI.getGuiSettings = function() {
            return guiSettings;
        };

        GuiAPI.getGuiSettingConfig = function(uiKey, dataKey, dataId) {
            return guiSettings.getSettingDataConfig(uiKey, dataKey, dataId);
        };


        GuiAPI.debugDrawGuiPosition = function(x, y) {
            GuiDebug.debugDrawPoint(x, y)
        };

        GuiAPI.debugDrawRectExtents = function(minVec, maxVec) {
            GuiDebug.drawRectExtents(minVec, maxVec)
        };

        GuiAPI.printDebugText = function(string) {
            GuiDebug.addDebugTextString(string)
        };

        GuiAPI.attachGuiToActor = function(actor) {
            actor.setActorGui(new ActorGui(actor))
        };

        GuiAPI.detachActorGui = function(actor) {
            actor.getActorGui().removeAllGuiWidgets();
        };

        GuiAPI.registerInteractiveGuiElement = function(surfaceElement) {
            inputSystem.registerInteractiveSurfaceElement(surfaceElement)
        };

        GuiAPI.unregisterInteractiveGuiElement = function(surfaceElement) {
            inputSystem.unregisterInteractiveSurfaceElement(surfaceElement)
        };


        GuiAPI.setAnchorWidget = function(key, widget) {
            anchorWidgets[key] = widget;
        };

        GuiAPI.getAnchorWidget = function(key) {
            return anchorWidgets[key];
        };

        GuiAPI.addInputUpdateCallback = function(cb) {
            inputUpdateCallbacks.push(cb);
        };

        GuiAPI.removeInputUpdateCallback = function(cb) {
            MATH.quickSplice(inputUpdateCallbacks, cb);
        };

        GuiAPI.addGuiUpdateCallback = function(cb) {
            guiUpdateCallbacks.push(cb);
        };

        GuiAPI.removeGuiUpdateCallback = function(cb) {
            MATH.quickSplice(guiUpdateCallbacks, cb);
        };

        GuiAPI.addAspectUpdateCallback = function(cb) {
            aspectUpdateCallbacks.push(cb);
        };

        GuiAPI.removeAspectUpdateCallback = function(cb) {
            MATH.quickSplice(aspectUpdateCallbacks, cb);
        };


        GuiAPI.applyAspectToScreenPosition = function(sourcePos, store) {
            store.copy(sourcePos);
            store.x = sourcePos.x * aspect;
        };

        GuiAPI.setInputBufferValue = function(inputIndex, buffer, enumKey, value) {
            let idx = inputIndex*ENUMS.InputState.BUFFER_SIZE + enumKey;
            buffer[idx] = value;
        };

        GuiAPI.readInputBufferValue = function(inputIndex, buffer, enumKey) {
            let idx = inputIndex*ENUMS.InputState.BUFFER_SIZE + enumKey;
            return buffer[idx]
        };

        GuiAPI.setCameraAspect = function(camAspect) {
            if (aspect !== camAspect) {
                aspect = camAspect;
                callAspectUpdateCallbacks(aspect);
            }
        };

        GuiAPI.registerWorldSpacePointer = function(pointer) {
            worldSpacePointers.push(pointer);
        };

        GuiAPI.unregisterWorldSpacePointer = function(pointer) {
            MATH.quickSplice(worldSpacePointers, pointer)
        };

        GuiAPI.getWorldSpacePointers = function() {
            return worldSpacePointers
        };

        var callInputUpdateCallbacks = function(input, buffer) {
            MATH.callAll(inputUpdateCallbacks, input, buffer);
        };

        var callAspectUpdateCallbacks = function(aspect) {
    //        console.log("Aspect:", aspect);
            MATH.callAll(aspectUpdateCallbacks, aspect);
        };


        var updateInput = function(INPUT_BUFFER) {
            inputs = ENUMS.Numbers.POINTER_TOUCH0 + ENUMS.Numbers.TOUCHES_COUNT;
            for (ib = 0; ib < inputs; ib++) {
                if (GuiAPI.readInputBufferValue(ib, INPUT_BUFFER, ENUMS.InputState.HAS_UPDATE )) {
                    callInputUpdateCallbacks(ib, INPUT_BUFFER)
                }
            }
        };


        var dymmy1 = function(textWidget) {
            textWidget.printWidgetText("MOO "+Math.random(), 7)
        };


        GuiAPI.getTextSysKey = function() {
            return txtSysKey;
        };

        GuiAPI.sampleInputState = function(INPUT_BUFFER) {
            updateInput(INPUT_BUFFER);
            GuiDebug.updateDebugElements();
        };

        var now;
        GuiAPI.updateGui = function(tpf, time) {
            now = MATH.getNowMS();
            GuiDebug.updateDebugElements();
            instantiator.updateInstantiatorBuffers();
            instantiator.monitorBufferStats();

            if (registeredTextElements['main_text_box']) {
                dymmy1(registeredTextElements['main_text_box']);
            }

            MATH.callAll(guiUpdateCallbacks, tpf, time);
            DebugAPI.generateTrackEvent('GUI_DT', MATH.getNowMS() - now, 'ms', 2)
        };

        return GuiAPI;

    });