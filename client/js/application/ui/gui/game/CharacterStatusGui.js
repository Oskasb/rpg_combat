
class CharacterStatusGui {
    constructor() {
        this.tempVec3 = new THREE.Vector3();
        this.tempVec3b = new THREE.Vector3();
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

    activateCharacterStatusGui() {

        let onHpReady = function(element) {
            this.hpProgressElement = element;
        }.bind(this);

        let onSwingReady = function(element) {
            this.swingProgressElement = element;
        }.bind(this);
        this.addProgressElement( 'progress_indicator_char_hp', onHpReady)
        this.addProgressElement( 'progress_indicator_char_swing', onSwingReady)
        GameAPI.registerGameUpdateCallback(this.callbacks.updateCharStatGui)
    }

    deactivateCharacterStatusGui() {
        GameAPI.unregisterGameUpdateCallback(this.callbacks.updateCharStatGui)
        if (this.hpProgressElement) {
            this.hpProgressElement.guiWidget.recoverGuiWidget();
        }
        if (this.swingProgressElement) {
            this.swingProgressElement.guiWidget.recoverGuiWidget();
        }
    }

    updateCharacterStatElement() {
        this.spatial.getSpatialPosition(this.tempVec3);
        this.tempVec3.y += this.gamePiece.getStatusByKey('height');
        ThreeAPI.toScreenPosition(this.tempVec3, this.tempVec3b)
     //   ThreeAPI.tempVec3b.z = 0;
        this.hpProgressElement.guiWidget.setPosition(this.tempVec3b)
        this.hpProgressElement.setProgress(0, this.gamePiece.getStatusByKey('maxHP'), this.gamePiece.getStatusByKey('hp'))
        this.tempVec3b.y-=0.002
        this.swingProgressElement.guiWidget.setPosition(this.tempVec3b)
        this.swingProgressElement.setProgress(0, 1, Math.sin( this.gamePiece.getStatusByKey('atkProg') * Math.PI))

    }

}

export { CharacterStatusGui }