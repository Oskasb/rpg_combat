"use strict";

define([
        'client/js/workers/main/ui/elements/GuiWidget'
    ],
    function(
        GuiWidget
    ) {

        var progressIcon = 'progress_horizontal';
        var readyIconKey = 'center_lit_square';

        var tempVec1 = new THREE.Vector3();

        var GuiActionPoint = function(options) {

            this.options = {};
            for (var key in options) {
                this.options[key] = options[key];
            }

            this.offsetPos = new THREE.Vector3();
            this.offsetTargetPos = new THREE.Vector3();
            this.deltaPos = new THREE.Vector3();
            this.sourcePos = new THREE.Vector3();

            this.movePprogress = 0;
            this.currentTime = 0;
            this.moveTime = 0.5;
            this.moving = false;

            this.lastProgress = 0;

            this.actionPoint = null;

            var updateActionPointStatus = function(tpf, time) {
                this.updateActionPointStatus(this.getActionPointStatus(), tpf);
            }.bind(this);

            this.callbacks = {
                updateActionPointStatus:updateActionPointStatus
            }
        };


        GuiActionPoint.prototype.initActionPoint = function(widgetConfig, onReady) {
            this.offsetPos.set(0, 0, 0);
            this.guiWidget = new GuiWidget(widgetConfig);

            var containerReady = function(widget) {
                widget.setWidgetIconKey(progressIcon);
                widget.setWidgetInteractiveState(ENUMS.ElementState.NONE);
                onReady(this);

            }.bind(this);

            this.guiWidget.initGuiWidget(null, containerReady);

        };



        GuiActionPoint.prototype.getGuiActionPointIndex = function() {
            return this.index;
        };

        GuiActionPoint.prototype.setActionPointTargetOffset = function(targetOffset) {
            if (!this.offsetTargetPos.equals(targetOffset)) {
                this.offsetTargetPos.copy(targetOffset);
                this.deltaPos.subVectors(this.offsetTargetPos ,this.offsetPos);
                this.sourcePos.copy(this.offsetPos);
                this.currentTime = 0;
                this.moving = true;
            }
        };

        GuiActionPoint.prototype.updateGuiActionPointPosition = function() {

            var moveProg = MATH.curveSigmoid(this.movePprogress);

            tempVec1.copy(this.deltaPos);
            tempVec1.multiplyScalar(moveProg);

            this.offsetPos.addVectors(tempVec1, this.sourcePos);

            this.guiWidget.offsetWidgetPosition(this.offsetPos);

        };

        GuiActionPoint.prototype.getGuiActionPointIndex = function() {
            return this.actionPoint.getActionPointIndex();
        };

        GuiActionPoint.prototype.setActionPoint = function(actionPoint) {
            this.actionPoint = actionPoint;
        };

        GuiActionPoint.prototype.getActionPoint = function() {
            return this.actionPoint;
        };

        GuiActionPoint.prototype.updateGuiActionPointFrame = function(tpf, actionPoint) {

            if (this.moving) {

                this.currentTime += tpf;


                this.movePprogress = this.currentTime / this.moveTime;

                if (this.currentTime > this.moveTime) {

                    this.moving = false;
                    this.movePprogress = 1;
                }

                this.updateGuiActionPointPosition();
            } else {

            }

            if (this.actionPoint.getActionPointIsConsumed()) {
                this.guiWidget.setWidgetInteractiveState(ENUMS.ElementState.DISABLED);
            } else if (this.actionPoint.getActionPointReady()) {
                this.guiWidget.setWidgetInteractiveState(ENUMS.ElementState.ACTIVE);
                this.guiWidget.setWidgetIconKey(readyIconKey);
            } else {
                this.guiWidget.setWidgetInteractiveState(ENUMS.ElementState.NONE);
            }



            var progress = actionPoint.getActionPointProgress();

            if (progress !== this.lastProgress) {
                this.guiWidget.indicateProgress(0, 1, progress, 1);
                this.lastProgress = actionPoint.getActionPointProgress();
            }

        };

        GuiActionPoint.prototype.removeGuiWidget = function() {
            this.actionPoint = null;
            this.guiWidget.recoverGuiWidget();
        };

        return GuiActionPoint;

    });