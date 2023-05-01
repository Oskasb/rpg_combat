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

        this.messageMap = {};

        this.messageMap[ENUMS.Message.SAY]                      = this.call.getTextOrigin;
        this.messageMap[ENUMS.Message.YELL]                     = this.call.getTextOrigin;
        this.messageMap[ENUMS.Message.WHISPER]                  = this.call.getTextOrigin;
        this.messageMap[ENUMS.Message.DAMAGE_NORMAL_TAKEN]      = this.call.getDamageTextPosition;
        this.messageMap[ENUMS.Message.DAMAGE_NORMAL_DONE]       = this.call.getDamageTextPosition;
        this.messageMap[ENUMS.Message.DAMAGE_CRITICAL_TAKEN]    = this.call.getDamageTextPosition;
        this.messageMap[ENUMS.Message.DAMAGE_CRITICAL_DONE]     = this.call.getDamageTextPosition;

        this.pieceTexts = [];

    }

    pieceTextPrint(string, messageType, duration) {

        messageType = messageType || ENUMS.Message.DAMAGE_NORMAL_TAKEN;

        let call = this.call;
        let messageMap = this.messageMap;
        let positionText = function(txtElem, textProgress) {
            let txtPosVec3 = messageMap[messageType](textProgress)
            tempVec2.set(1.0, 0.5, 0);
            tempVec2.add(txtPosVec3)
            txtElem.surface.maxXY.addVectors(txtPosVec3, tempVec2);
            txtElem.surface.minXY.subVectors(txtPosVec3, tempVec2);
            txtElem.callbacks.getTextElement().updateTextMinMaxPositions(txtElem.surface);
        };

        let onReady = function(ssTxt) {
            positionText(ssTxt);
            ssTxt.callbacks.setPositionFunction(positionText);
            ssTxt.activateScreenSpaceText();
            ssTxt.updateTextContent(string)
        }.bind(this);

        let screenSpaceText = new GuiScreenSpaceText()

        screenSpaceText.initScreenSpaceText(onReady, messageType, duration);

    }

    updatePieceTexts(tpf, gameTime) {

    }
}



export {PieceText}