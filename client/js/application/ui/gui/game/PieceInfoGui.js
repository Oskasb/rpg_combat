import { GuiWidget} from "../elements/GuiWidget.js";
class PieceInfoGui {
    constructor(gamePiece) {

        this.statusListChar = [
            {
                status:'name',
                label:'Name',
            },
            {
                status:'level',
                label:'Level'
            },
            {
                status:'lifetime',
                label: 'Time'
            }
        ]

        this.statusListItem = [
            {
                status:'lifetime',
                label: 'time'
            }
        ]


        this.gamePiece = gamePiece;
        let updatePieceInfoGui = function() {
              this.updatePieceInfo();
        }.bind(this);

        let anchor = null;

        let setAnchor = function(element) {
            anchor = element;
        }
         let getAnchor = function() {
            return anchor;
        }

        this.callbacks = {
            updatePieceInfoGui:updatePieceInfoGui,
            setAnchor:setAnchor,
            getAnchor:getAnchor
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

    addContainerElement(configId, onReady) {
        let opts = GuiAPI.buildWidgetOptions(

            {
                widgetClass:'GuiExpandingContainer',
                widgetCallback:onReady,
                configId:configId
            }
        );

        evt.dispatch(ENUMS.Event.BUILD_GUI_ELEMENT, opts)

    }



    addStatusElements = function(containerElement) {
        let status = this.gamePiece.pieceState.status;

        let addStatusElement = function(statusParams) {

            let keyWidget = new GuiWidget('widget_stat_elem_key')
            let valueWidget = new GuiWidget('widget_stat_elem_value')

            let valueReady = function(widget) {
                widget.setFirstSTringText(status[statusParams.status])
                containerElement.guiWidget.addChild(widget);
            }
            let keyReady = function(widget) {
                keyWidget.setFirstSTringText(statusParams.label)
                containerElement.guiWidget.addChild(widget);
                valueWidget.initGuiWidget(null, valueReady);
            }

            keyWidget.initGuiWidget(null, keyReady);

        }


        let statusList;
        if (status.isItem) {
            statusList = this.statusListItem;
        }

        if (status.isCharacter) {
            statusList = this.statusListChar;
        }

        for (let i = 0; i < statusList.length; i++) {
            addStatusElement(statusList[i], status);
        }

    }

    activatePieceInfoGui() {

        let addContainerElement = function(configId, onReady) {
            let opts = GuiAPI.buildWidgetOptions(
                {
                    widgetClass:'GuiExpandingContainer',
                    widgetCallback:onReady,
                    configId:configId
                }
            );

            evt.dispatch(ENUMS.Event.BUILD_GUI_ELEMENT, opts)
        }


        let onReady = function(element) {
        //    element.guiWidget.initGuiWidget()
        //    element.guiWidget.applyWidgetPosition()
            this.callbacks.getAnchor().guiWidget.addChild(element.guiWidget);
            this.addStatusElements(element);
            //
        }.bind(this);

        let anchorReady = function(element) {

            this.callbacks.setAnchor(element);
            this.callbacks.updatePieceInfoGui();
            addContainerElement( 'widget_stat_elem_container', onReady)
        }.bind(this);

        addContainerElement( 'widget_hidden_container', anchorReady)


        GameAPI.registerGameUpdateCallback(this.callbacks.updatePieceInfoGui)
    }

    deactivatePieceInfoGui() {
        GameAPI.unregisterGameUpdateCallback(this.callbacks.updatePieceInfoGui)
        let anchor = this.callbacks.getAnchor();
        if (anchor) {
            anchor.guiWidget.recoverGuiWidget();
        }
    }

    updatePieceInfo() {
        ThreeAPI.tempVec3.copy(this.gamePiece.getPos());
        ThreeAPI.tempVec3.y += this.gamePiece.getStatusByKey('height') + 0.08;
        ThreeAPI.toScreenPosition(ThreeAPI.tempVec3, ThreeAPI.tempVec3b)
        let anchor = this.callbacks.getAnchor();
        anchor.guiWidget.setPosition(ThreeAPI.tempVec3b)
    }

}

export { PieceInfoGui }