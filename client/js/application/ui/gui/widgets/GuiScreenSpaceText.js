"use strict";

define([
        'client/js/workers/main/ui/elements/GuiTextElement'
    ],
    function(
        GuiTextElement
    ) {


        var GuiScreenSpaceText = function(options) {

            this.options = {};
            for (var key in options) {
                this.options[key] = options[key];
            }


            this.surface = {
                minXY:{x:-0.5, y:-0.5, z:0},
                maxXY:{x:0.5, y:0.5, z:0}
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


        GuiScreenSpaceText.prototype.initScreenSpaceText = function(onReady) {


            var conf = {
                "sprite_font": "sprite_font_main_text",
                "feedback": "feedback_text_blue"
            };

            var textCB = function (txtElem) {
                txtElem.setFeedbackConfigId(conf.feedback);
                this.text = txtElem;
                onReady(this)
            }.bind(this);

            GuiAPI.getTextSystem().buildTextElement(textCB, conf.sprite_font);

        };

        GuiScreenSpaceText.prototype.setTextDimensions = function(pos, size) {
            this.pos.copy(pos);
            this.size.copy(size);
            this.text.updateTextMinMaxPositions(this.surface);
        };


        GuiScreenSpaceText.prototype.updateTextContent = function(text) {
            this.text.drawTextString(GuiAPI.getTextSysKey(), text, this.callbacks.stringReady)
        };

        GuiScreenSpaceText.prototype.activateScreenSpaceText = function() {
            this.time = 0;
            GuiAPI.addGuiUpdateCallback(this.callbacks.updateProgress);
        };

        GuiScreenSpaceText.prototype.deactivateScreenSpaceText = function() {
            GuiAPI.removeGuiUpdateCallback(this.callbacks.updateProgress);
        };

        GuiScreenSpaceText.prototype.removeGuiWidget = function() {
            this.deactivateScreenSpaceText();
            this.text.recoverTextElement();
        };

        return GuiScreenSpaceText;

    });