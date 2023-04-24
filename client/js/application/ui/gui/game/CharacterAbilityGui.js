
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
        this.buttonContainers = [];
        this.abilityButtons = [];
        let updateCharAbilityGui = function() {
              this.updateCharacterAbilityElements();
        }.bind(this);

        this.callbacks = {
            updateCharAbilityGui:updateCharAbilityGui,
            deactivateCharAbilityGui:this.deactivateCharacterAbilityGui
        }

    }
    initAbilityGui(gameCharacter) {
        this.charater = gameCharacter;
        this.gamePiece = gameCharacter.gamePiece;
        this.spatial = this.gamePiece.getSpatial();
    }
    addAbilityContainer = function(configId, onReady ) {
        let opts = GuiAPI.buildWidgetOptions(
            {
                widgetClass:'GuiExpandingContainer',
                widgetCallback:onReady,
                configId:configId
            }
        );
        evt.dispatch(ENUMS.Event.BUILD_GUI_ELEMENT, opts)
    }

    addButtonContainer(maxSlots) {
        let abilityButtons = this.abilityButtons
        let containers = this.buttonContainers;
        let slottedAbilities = this.gamePiece.getAbilities()
        let _this = this;

        let onContainerReady = function(element) {

            let addButtonElement = function(configId, container, onReady) {
                let opts = GuiAPI.buildWidgetOptions(
                    {
                        widgetClass:'GuiActionButton',
                        widgetCallback:onReady,
                        container:container,
                        configId:configId
                    }
                );
                evt.dispatch(ENUMS.Event.BUILD_GUI_ELEMENT, opts)
            }

            let onButtonReady = function(element) {
            //    element.guiWidget.applyWidgetPosition()
                console.log("Action Button; ", element)

                let slot = slottedAbilities[abilityButtons.length]

                if (slot) {
                    let ability = slot.pieceAbility;
                    let config = ability.config;
                    element.guiWidget.setWidgetIconKey(config['icon_key']);
                    element.setActivateCallback(ability.call.activatePieceAbility)
                    let interactiveElem = element.getInteractiveElement();

                    let onActivate = function(input) {
                   //     console.log("Activate", input)
                        _this.deactivateCharacterAbilityGui();
                        ability.call.activatePieceAbility();
                    }

                    let onHover = function(input) {
                    //    console.log("hovering", input)
                        interactiveElem.setInteractiveState(ENUMS.ElementState.PRESS);
                        interactiveElem.applyPressState();
                        interactiveElem.addOnActivateCallback(onActivate);

                    }
                    interactiveElem.addOnHoverCallback(onHover);

                }

                abilityButtons.push(element);

            }

        //    element.guiWidget.applyWidgetPosition()
            containers.push(element);
            for (let i = 0; i < maxSlots; i++) {
                addButtonElement('widget_action_button', element, onButtonReady)
            }
        }

        this.addAbilityContainer('widget_action_button_container', onContainerReady)
    }

    activateCharacterAbilityGui() {
        let maxSlots = this.gamePiece.getStatusByKey('ability_slots_max');
        this.addButtonContainer(maxSlots)
        GameAPI.registerGameUpdateCallback(this.callbacks.updateCharAbilityGui)
    }

    deactivateCharacterAbilityGui() {
        GameAPI.unregisterGameUpdateCallback(this.callbacks.updateCharAbilityGui)

        while (this.abilityButtons.length) {
            this.abilityButtons.pop().guiWidget.recoverGuiWidget();
        }
        while (this.buttonContainers.length) {
            this.buttonContainers.pop().guiWidget.recoverGuiWidget();
        }
    }

    updateAbilityElements(availableSlots) {

        let slottedAbilities = this.gamePiece.getAbilities()

    //    console.log(slottedAbilities)
        for (let i = 0; i < this.abilityButtons.length; i++) {
            let element = this.abilityButtons[i].guiWidget;
            let bufferElem = element.icon.bufferElement;
            let slot = slottedAbilities[i]

            if (slot) {
                let ability = slot.pieceAbility;

                let actionButton = this.abilityButtons[i];
                let config = ability.config;

            //    element.setWidgetIconKey(config['icon_key']);
                if (i < availableSlots) {
                    bufferElem.setColorRGBA(this.colorMap['available']);
                //    actionButton.callbacks.updateProgress(Math.random())
                } else {
                    bufferElem.setColorRGBA(this.colorMap['unavailable']);
                }
            } else {
                bufferElem.setColorRGBA(this.colorMap['unavailable']);
            }

        }
    }

    setContainerPosition(pieceScreenPos, container, containerIndex, buttonCount) {
        container.guiWidget.setPosition(pieceScreenPos)
    }

    updateCharacterAbilityElements() {
        this.spatial.getSpatialPosition(this.tempVec3);
        this.tempVec3.y +=  this.gamePiece.getStatusByKey('height');
        ThreeAPI.toScreenPosition(this.tempVec3, this.tempVec3b)

        this.updateAbilityElements(this.gamePiece.getStatusByKey('ability_slots'))

        for (let i = 0; i < this.buttonContainers.length; i++) {
            this.setContainerPosition(this.tempVec3b, this.buttonContainers[i], i, this.buttonContainers.length)
        }


    }

}

export { CharacterAbilityGui }