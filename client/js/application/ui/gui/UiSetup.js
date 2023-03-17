import { InputSystem } from "./systems/InputSystem.js";
import { TextSystem } from "./systems/TextSystem.js";
import { GuiAnchors } from "./widgets/GuiAnchors.js";

class UiSetup {
    constructor() {
         //   this.uiTestSetup = new UiTestSetup();
            this.guiAnchors = new GuiAnchors();
        };

        initUiSetup = function(callback) {

            GuiAPI.setInputSystem( new InputSystem());
            GuiAPI.setTextSystem( new TextSystem());

            let textSysCb = function() {
                callback('textSysCb loaded');
            };
            let inputReady = function() {

                GuiAPI.getTextSystem().initTextSystem(textSysCb);
            };

            GuiAPI.getInputSystem().initInputSystem(inputReady);

        };

        setupDefaultUi = function() {
            this.guiAnchors.initGuiAnchors();
            GuiAPI.getGuiDebug().setupDebugControlContainer();
            GuiAPI.getGuiDebug().setupDebugControlContainer2();
        //    this.uiTestSetup.initUiTestSetup();
        };

    }

    export { UiSetup }