
class GuiScreenSpaceText {
    constructor(options) {
        let textElement;
        let duration;
        this.options = {};
        for (let key in options) {
            this.options[key] = options[key];
        }

        this.surface = {
            minXY:{x:-0.25, y:-0.5, z:0},
            maxXY:{x: 0.25, y:0.5, z:0}
        };

        let stringReady = function() {
            textElement.updateTextMinMaxPositions(this.surface);
        }.bind(this);

        let removeText =function() {
            this.deactivateScreenSpaceText();
            textElement.recoverTextElement();
        }.bind(this)

        let updateProgress = function(tpf, time) {
            this.time += tpf;

            textElement.minXY.copy(this.pos);
            textElement.maxXY.addVectors(this.pos, this.size);

            if (duration < this.time) {
                removeText();
            }

        }.bind(this);

        let setTextElement = function(elem) {
            textElement = elem;
        }

        let getTextElement = function() {
            return textElement;
        }

        let setDuration = function(seconds) {
            duration = seconds;
        }

        let getDuration = function() {
            return duration;
        }

        this.callbacks = {
            updateProgress:updateProgress,
            removeText:removeText,
            stringReady:stringReady,
            setDuration:setDuration,
            getDuration:getDuration,
            setTextElement:setTextElement,
            getTextElement:getTextElement
        };

        this.pos = new THREE.Vector3();
        this.size= new THREE.Vector3()
    };

    initScreenSpaceText = function(onReady, messageType, duration) {
        this.time = 0;
        this.callbacks.setDuration(duration || 1);

        let conf = {
            "sprite_font": "sprite_font_debug",
            "feedback": "feedback_text_blue"
        };

        let textCB = function (txtElem) {
            txtElem.setFeedbackConfigId(conf.feedback);
            this.callbacks.setTextElement(txtElem);
            onReady(this)
        }.bind(this);

        GuiAPI.getTextSystem().buildTextElement(textCB, conf.sprite_font);

    };

    setTextDimensions = function(pos, size) {
        this.pos.copy(pos);
        this.size.copy(size);
        this.callbacks.getTextElement().updateTextMinMaxPositions(this.surface);
    };

    updateTextContent = function(string) {
        this.callbacks.getTextElement().drawTextString(GuiAPI.getTextSysKey(), string, this.callbacks.stringReady)
    };

    activateScreenSpaceText = function() {
        GuiAPI.addGuiUpdateCallback(this.callbacks.updateProgress);
    };

    deactivateScreenSpaceText = function() {
        GuiAPI.removeGuiUpdateCallback(this.callbacks.updateProgress);
    };


}

export { GuiScreenSpaceText }