
class CharacterStatusGui {
    constructor() {

        let updateCharStatGui = function() {
              this.updateCharacterStatElement();
        }.bind(this);

        this.callbacks = {
            updateCharStatGui:updateCharStatGui
        }

    }
    initStatusGui(gameCharacter) {
        this.charater = gameCharacter;
        this.gamePiece = gameCharacter.gamePiece;
        this.spatial = this.gamePiece.getSpatial();
    }
    activateCharacterStatusGui() {



        let onReady = function(element) {
            console.log("Char Widget", element)

            this.progressElement = element;
        }.bind(this);

        let opts = GuiAPI.buildWidgetOptions(

            {
                widgetClass:'GuiProgressBar',
                widgetCallback:onReady,
                configId: 'progress_indicator_char_hp'
            }
        );

        evt.dispatch(ENUMS.Event.BUILD_GUI_ELEMENT, opts)
        GameAPI.registerGameUpdateCallback(this.callbacks.updateCharStatGui)
    }

    deactivateCharacterStatusGui() {
        GameAPI.unregisterGameUpdateCallback(this.callbacks.updateCharStatGui)
        this.progressElement.guiWidget.recoverGuiWidget();
    }

    updateCharacterStatElement() {
        this.spatial.getSpatialPosition(ThreeAPI.tempVec3);
        ThreeAPI.tempVec3.y += this.gamePiece.getStatusByKey('height');
        ThreeAPI.toScreenPosition(ThreeAPI.tempVec3, ThreeAPI.tempVec3b)
     //   ThreeAPI.tempVec3b.z = 0;
        this.progressElement.guiWidget.setPosition(ThreeAPI.tempVec3b)
        this.progressElement.setProgress(0, this.gamePiece.getStatusByKey('maxHP'), this.gamePiece.getStatusByKey('hp'))

    }

}

export { CharacterStatusGui }