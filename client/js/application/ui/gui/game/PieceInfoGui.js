
class PieceInfoGui {
    constructor(gamePiece) {

        this.gamePiece = gamePiece;
        let updatePieceInfoGui = function() {
              this.updatePieceInfo();
        }.bind(this);

        this.callbacks = {
            updatePieceInfoGui:updatePieceInfoGui
        }

    }

    addProgressElement(configId, onReady) {
        let opts = GuiAPI.buildWidgetOptions(

            {
                widgetClass:'GuiProgressBar',
                widgetCallback:onReady,
                configId:configId
            }
        );

        evt.dispatch(ENUMS.Event.BUILD_GUI_ELEMENT, opts)

    }

    activatePieceInfoGui() {
        console.log("Activate PIG")
        let onHpReady = function(element) {
            this.hpProgressElement = element;
        }.bind(this);

        let onSwingReady = function(element) {
            this.swingProgressElement = element;
        }.bind(this);
        this.addProgressElement( 'progress_indicator_char_hp', onHpReady)
        this.addProgressElement( 'progress_indicator_char_swing', onSwingReady)
        GameAPI.registerGameUpdateCallback(this.callbacks.updatePieceInfoGui)
    }

    deactivatePieceInfoGui() {
        console.log("Deactivate PIG")
        GameAPI.unregisterGameUpdateCallback(this.callbacks.updatePieceInfoGui)
        if (this.hpProgressElement) {
            this.hpProgressElement.guiWidget.recoverGuiWidget();
        }
        if (this.swingProgressElement) {
            this.swingProgressElement.guiWidget.recoverGuiWidget();
        }
    }

    updatePieceInfo() {
        ThreeAPI.tempVec3.copy(this.gamePiece.getPos());
        ThreeAPI.tempVec3.y += this.gamePiece.getStatusByKey('height');
        ThreeAPI.toScreenPosition(ThreeAPI.tempVec3, ThreeAPI.tempVec3b)
     //   ThreeAPI.tempVec3b.z = 0;
        this.hpProgressElement.guiWidget.setPosition(ThreeAPI.tempVec3b)
        this.hpProgressElement.setProgress(0, this.gamePiece.getStatusByKey('maxHP'), this.gamePiece.getStatusByKey('hp'))
        ThreeAPI.tempVec3b.y-=0.002
        this.swingProgressElement.guiWidget.setPosition(ThreeAPI.tempVec3b)
        this.swingProgressElement.setProgress(0, 1, Math.sin( this.gamePiece.getStatusByKey('atkProg') * Math.PI))

    }

}

export { PieceInfoGui }