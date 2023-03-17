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
            this.guiAnchors.initGuiAnchors();


            var onReady = function(textBox) {
                textBox.updateTextContent("Text ready...")
                //textBoxes.push(textBox);
            };

            var onActivate = function(inputIndex, widget) {
                widget.printWidgetText('pressed')
            };

            var opts = GuiAPI.buildWidgetOptions('main_text_box', onActivate, false, true, "TRY ME", 0, 0, 'center');

            GuiAPI.buildGuiWidget('GuiTextBox', opts, onReady);


        };

        setupDefaultUi = function() {

            GuiAPI.getGuiDebug().setupDebugControlContainer();
            GuiAPI.getGuiDebug().setupDebugControlContainer2();
        //    this.uiTestSetup.initUiTestSetup();
        };

    }

    export { UiSetup }