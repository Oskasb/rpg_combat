
class CharacterStatusGui {
    constructor() {
        this.tempVec3 = new THREE.Vector3();
        this.tempVec3b = new THREE.Vector3();
        this.attackPointElements = [];
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


    addAttacksContainer(onReady) {
        let opts = GuiAPI.buildWidgetOptions(
            {
                widgetClass:'GuiExpandingContainer',
                widgetCallback:onReady,
                configId:'widget_attack_point_container'
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

        let onAttacksContainerReady = function(element) {
            this.attacksContainer = element;
            element.guiWidget.applyWidgetPosition()
        }.bind(this)

        this.addProgressElement( 'progress_indicator_char_hp', onHpReady)
        this.addProgressElement( 'progress_indicator_char_swing', onSwingReady)
        this.addAttacksContainer(onAttacksContainerReady)
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
        if (this.attacksContainer) {
            this.attacksContainer.guiWidget.recoverGuiWidget();
        }
        MATH.emptyArray(this.attackPointElements);
    }

    addAttackElement(container, onReady) {

        let opts = GuiAPI.buildWidgetOptions(
            {
                widgetClass:'GuiExpandingContainer',
                widgetCallback:onReady,
                container:container,
                configId:'icon_attack_point'
            }
        );

        evt.dispatch(ENUMS.Event.BUILD_GUI_ELEMENT, opts)
    }

    updateMaxAttackCount(maxAttacks) {
        let attackElements = this.attackPointElements
        let container = this.attacksContainer;
        let onReady = function(element) {
            attackElements.push(element);
            console.log("add attack", element)
            element.guiWidget.setWidgetIconKey('atk_on');
            container.guiWidget.applyWidgetPosition()
        }

        if (attackElements.length < maxAttacks) {
            this.addAttackElement(container, onReady)
        } else {
            while (attackElements.length > maxAttacks) {
                attackElements.pop().guiWidget.recoverGuiWidget();
            }
        }

    }


    updateAttackPointElements(maxAttacks, currentAttack, remainingAttacks) {
        if (this.attackPointElements.length !== maxAttacks) {
            this.updateMaxAttackCount(maxAttacks)
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
        this.tempVec3b.y-=0.004
        this.attacksContainer.guiWidget.setPosition(this.tempVec3b)
        this.updateAttackPointElements(this.gamePiece.getStatusByKey('turnAttacks'), this.gamePiece.getStatusByKey('attack'), this.gamePiece.getStatusByKey('attacks'))
    }

}

export { CharacterStatusGui }