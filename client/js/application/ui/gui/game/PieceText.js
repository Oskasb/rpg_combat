import { GuiScreenSpaceText } from "../widgets/GuiScreenSpaceText.js";
import { Vector3 } from "../../../../../libs/three/math/Vector3.js";
let tempVec1 = new Vector3();
let tempVec2 = new Vector3();
class PieceText {
    constructor(gamePiece) {
        this.gamePiece = gamePiece;

        let txtOrigin = new Vector3();

        let getTextOrigin = function() {
            ThreeAPI.tempVec3.copy(gamePiece.getAboveHead(0.25));
            ThreeAPI.toScreenPosition(ThreeAPI.tempVec3, txtOrigin)
            GuiAPI.applyAspectToScreenPosition(txtOrigin, txtOrigin);
            return txtOrigin;
        }

        let getDamageTextPosition = function(progress) {
            let pos = getTextOrigin();
            pos.y += progress*0.1;
            return pos;
        }

        this.call = {
            getTextOrigin:getTextOrigin,
            getDamageTextPosition:getDamageTextPosition
        }

        let conf = {
            sprite_font: "sprite_font_debug",
            feedback: "feedback_text_red",
            rgba:  {r:1, g:-0.1, b:-0.3, a:1},
            lutColor:ENUMS.ColorCurve.warmFire,
            textLayout: {"x": 0.5, "y": 0.5, "fontsize": 7}
        };

        this.messageMap = {};

        this.messageMap[ENUMS.Message.SAY]                      = {getPos:this.call.getTextOrigin, config:conf};
        this.messageMap[ENUMS.Message.YELL]                     = {getPos:this.call.getTextOrigin, config:conf};
        this.messageMap[ENUMS.Message.WHISPER]                  = {getPos:this.call.getTextOrigin, config:conf};
        this.messageMap[ENUMS.Message.DAMAGE_NORMAL_TAKEN]      = {getPos:this.call.getDamageTextPosition, config:conf};
        this.messageMap[ENUMS.Message.DAMAGE_NORMAL_DONE]       = {getPos:this.call.getDamageTextPosition, config:conf};
        this.messageMap[ENUMS.Message.DAMAGE_CRITICAL_TAKEN]    = {getPos:this.call.getDamageTextPosition, config:conf};
        this.messageMap[ENUMS.Message.DAMAGE_CRITICAL_DONE]     = {getPos:this.call.getDamageTextPosition, config:conf};

        this.pieceTexts = [];

    }

    pieceTextPrint(string, messageType, duration) {
        let messageMap = this.messageMap;
        messageType = messageType || ENUMS.Message.DAMAGE_NORMAL_TAKEN;

        let conf = messageMap[messageType].config;
        let rgba = conf.rgba || {r:1, g:0.3, b:0.1, a:1}
        let lutColor = conf.lutColor || ENUMS.ColorCurve.yellow_5;
        let call = this.call;

        let positionText = function(txtElem, textProgress) {
            let txtPosVec3 = messageMap[messageType].getPos(textProgress)
            tempVec2.set(1.0, 0.5, 0);
            tempVec2.add(txtPosVec3)
            txtElem.surface.maxXY.addVectors(txtPosVec3, tempVec2);
            txtElem.surface.minXY.subVectors(txtPosVec3, tempVec2);
            txtElem.callbacks.getTextElement().updateTextMinMaxPositions(txtElem.surface);
            rgba.a = 1-textProgress;
            txtElem.callbacks.getTextElement().setTextColor(rgba, ENUMS.ColorCurve.red_3);
        };

        let onReady = function(ssTxt) {
            positionText(ssTxt);
            ssTxt.callbacks.setPositionFunction(positionText);
            ssTxt.activateScreenSpaceText();
            ssTxt.updateTextContent(string)
        }.bind(this);

        let screenSpaceText = new GuiScreenSpaceText()



        screenSpaceText.initScreenSpaceText(onReady, conf, duration);

    }

    updatePieceTexts(tpf, gameTime) {

    }
}



export {PieceText}