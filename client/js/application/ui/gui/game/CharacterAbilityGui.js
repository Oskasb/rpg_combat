
class CharacterAbilityGui {
    constructor() {
        this.colorMap = {
            on:{"r": 0.11, "g": 0.75, "b": 0.75, "a": 0.99},
            active:{"r": 0.99, "g": 0.93, "b": 0.39, "a": 0.99},
            off:{"r": 0.35, "g": 0.35, "b": 0.85, "a": 0.99},
            available:{"r": 0.01, "g": 0.79, "b": 0.01, "a": 0.99},
            activated:{"r": 0.99, "g": 0.73, "b": -0.4, "a": 0.99},
            unavailable:{"r": 0.7, "g": -0.1, "b": -0.15, "a": 0.39}
        }

        this.tempVec3 = new THREE.Vector3();
        this.tempVec3b = new THREE.Vector3();
        this.attackPointElements = [];
        this.actionPointElements = [];
        let updateCharAbilityGui = function() {
              this.updateCharacterAbilityElements();
        }.bind(this);

        this.callbacks = {
            updateCharAbilityGui:updateCharAbilityGui
        }

    }
    initAbilityGui(gameCharacter) {
        this.charater = gameCharacter;
        this.gamePiece = gameCharacter.gamePiece;
        this.spatial = this.gamePiece.getSpatial();
    }


    addAbilityContainer(configId, onReady ) {
        let opts = GuiAPI.buildWidgetOptions(
            {
                widgetClass:'GuiExpandingContainer',
                widgetCallback:onReady,
                configId:configId // 'widget_attack_point_container'
            }
        );

        evt.dispatch(ENUMS.Event.BUILD_GUI_ELEMENT, opts)
    }

    activateCharacterAbilityGui() {

        let onAPContainerReady = function(element) {
            this.abilityContainer = element;
            element.guiWidget.applyWidgetPosition()
        }.bind(this)


        this.addAbilityContainer('widget_attack_point_container', onAPContainerReady )
        GameAPI.registerGameUpdateCallback(this.callbacks.updateCharAbilityGui)
    }

    deactivateCharacterAbilityGui() {
        GameAPI.unregisterGameUpdateCallback(this.callbacks.updateCharAbilityGui)

        while (this.actionPointElements.length) {
            this.actionPointElements.pop().guiWidget.recoverGuiWidget();
        }
        if (this.abilityContainer) {
            this.abilityContainer.guiWidget.recoverGuiWidget();
        }
    }

    addAbilityElement(configId, container, onReady) {

        let opts = GuiAPI.buildWidgetOptions(
            {
                widgetClass:'GuiExpandingContainer',
                widgetCallback:onReady,
                container:container,
                configId:configId // 'icon_attack_point'
            }
        );

        evt.dispatch(ENUMS.Event.BUILD_GUI_ELEMENT, opts)
    }


    updateMaxAPCount(maxAttacks) {
        let attackElements = this.actionPointElements
        let container = this.abilityContainer;
        let onReady = function(element) {
            attackElements.push(element);
            container.guiWidget.applyWidgetPosition()
        }

        if (attackElements.length < maxAttacks) {
            this.addAbilityElement('icon_action_point', container, onReady)
        } else {
            while (attackElements.length > maxAttacks) {
                attackElements.pop().guiWidget.recoverGuiWidget();
            }
        }
    }

    updateActionPointElements(maxAPs, availableAPs, activeAPs) {
        if (this.actionPointElements.length !== maxAPs) {
            this.updateMaxAPCount(maxAPs)
        }

        for (let i = 0; i < this.actionPointElements.length; i++) {
            let element = this.actionPointElements[i].guiWidget;
            let bufferElem = element.icon.bufferElement;
            if (i < activeAPs) {

                element.setWidgetIconKey('ap_light');
                bufferElem.setColorRGBA(this.colorMap['activated']);

            } else if (i < availableAPs) {
                element.setWidgetIconKey('ap_light');
                bufferElem.setColorRGBA(this.colorMap['available']);
            } else {
                element.setWidgetIconKey('ap_light');
                bufferElem.setColorRGBA(this.colorMap['unavailable']);
            }
        }
    }

    updateCharacterAbilityElements() {
        this.spatial.getSpatialPosition(this.tempVec3);
        this.tempVec3.y += 0// this.gamePiece.getStatusByKey('height');
        ThreeAPI.toScreenPosition(this.tempVec3, this.tempVec3b)

        this.tempVec3b.y -= 0.024
        this.abilityContainer.guiWidget.setPosition(this.tempVec3b)
        this.updateActionPointElements(this.gamePiece.getStatusByKey('maxAPs'), this.gamePiece.getStatusByKey('actPts'), this.gamePiece.getStatusByKey('activeAPs'))
    }

}

export { CharacterAbilityGui }