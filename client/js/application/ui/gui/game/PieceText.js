import { GuiScreenSpaceText } from "../widgets/GuiScreenSpaceText.js";
import { Vector3 } from "../../../../../libs/three/math/Vector3.js";
let tempVec1 = new Vector3();
let tempVec2 = new Vector3();
class PieceText {
    constructor(gamePiece) {
        this.gamePiece = gamePiece;


        this.pieceTexts = [];

    }

    pieceTextPrint(string, messageType, duration) {

        let onReady = function(ssTxt) {

            ThreeAPI.tempVec3.copy(this.gamePiece.getAboveHead(0.08));
            ThreeAPI.toScreenPosition(ThreeAPI.tempVec3, tempVec1)
            //    let anchor = this.callbacks.getAnchor();
            //    anchor.guiWidget.setPosition(ThreeAPI.tempVec3b)

            //     tempVec1.set(-0.5, -0.5, 0);
            tempVec2.set(1.0, 1.0, 0);

            ssTxt.setTextDimensions(tempVec1, tempVec2);
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