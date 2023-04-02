
class GuiScreenSpaceText {
    constructor(options) {

            this.options = {};
            for (var key in options) {
                this.options[key] = options[key];
            }

            this.surface = {
                minXY:{x:-0.25, y:-0.5, z:0},
                maxXY:{x: 0.25, y:0.5, z:0}
            };

            var stringReady = function(tpf, time) {
                this.text.updateTextMinMaxPositions(this.surface);
            }.bind(this);

            var updateProgress = function(tpf, time) {
                this.time += tpf;

                this.text.minXY.copy(this.pos);
                this.text.maxXY.addVectors(this.pos, this.size);

                var string = '';
                var maxSize = this.text.getMaxCharCount();

                for (var i = 0; i < maxSize; i++) {
                    string += Math.floor(Math.random()*10);
                }

                this.updateTextContent(string);
            }.bind(this);

            this.callbacks = {
                updateProgress:updateProgress,
                stringReady:stringReady
            };

            this.pos = new THREE.Vector3();
            this.size= new THREE.Vector3()

        };


        initScreenSpaceText = function(onReady) {


            var conf = {
                "sprite_font": "sprite_font_debug",
                "feedback": "feedback_text_blue"
            };

            var textCB = function (txtElem) {
                txtElem.setFeedbackConfigId(conf.feedback);
                this.text = txtElem;
                onReady(this)
            }.bind(this);

            GuiAPI.getTextSystem().buildTextElement(textCB, conf.sprite_font);

        };

        setTextDimensions = function(pos, size) {
            this.pos.copy(pos);
            this.size.copy(size);
            this.text.updateTextMinMaxPositions(this.surface);
        };


        updateTextContent = function(text) {
            this.text.drawTextString(GuiAPI.getTextSysKey(), text, this.callbacks.stringReady)
        };

        activateScreenSpaceText = function() {
            this.time = 0;
            GuiAPI.addGuiUpdateCallback(this.callbacks.updateProgress);
        };

        deactivateScreenSpaceText = function() {
            GuiAPI.removeGuiUpdateCallback(this.callbacks.updateProgress);
        };

        removeGuiWidget = function() {
            this.deactivateScreenSpaceText();
            this.text.recoverTextElement();
        };

    }

    export { GuiScreenSpaceText }