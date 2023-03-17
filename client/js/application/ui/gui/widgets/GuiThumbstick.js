"use strict";

define([
        'client/js/workers/main/ui/elements/GuiWidget'
    ],
    function(
        GuiWidget
    ) {


        var GuiThumbstick = function(options) {

            this.options = {};
            for (var key in options) {
                this.options[key] = options[key];
            }

            this.pos = new THREE.Vector3();
            this.origin = new THREE.Vector3();
            this.offset = new THREE.Vector3();

            this.releaseTime = 0;
            this.releaseProgress = 0;
            this.releaseDuration = 0.25;

            this.maxRange = 0.08;

            this.inputAngle = 0;
            this.inputDistance = 0;

            this.activeInputIndex = null;

            this.applyInputCallbacks = [];

            var onPressStart = function(index, widget) {
                this.handleThumbstickPressStart(index, widget)
            }.bind(this);

            var onStickInputUpdate = function(input, buffer) {
                this.handleThumbstickInputUpdated(input, buffer)
            }.bind(this);

            var onStickReleasedUpdate = function(tpf, time) {
                this.handleThumbstickReleasedUpdate(tpf, time)
            }.bind(this);


            var notifyInputUpdated = function() {
                this.notifyInputUpdated(this.inputAngle, this.inputDistance)
            }.bind(this);

            this.callbacks = {
                onPressStart:onPressStart,
                onStickInputUpdate:onStickInputUpdate,
                onStickReleasedUpdate:onStickReleasedUpdate,
                notifyInputUpdated:notifyInputUpdated
            }

        };


        GuiThumbstick.prototype.initThumbstick = function(widgetConfig, onReady) {

            var widgetRdy = function(widget) {
                widget.attachToAnchor('bottom_left');
                widget.setWidgetIconKey('directional_arrows');
                widget.addOnPressStartCallback(this.callbacks.onPressStart);
                widget.enableWidgetInteraction();
                onReady(this)
            }.bind(this);

            this.guiWidget = new GuiWidget(widgetConfig);
            this.guiWidget.initGuiWidget(null, widgetRdy);

        };

        GuiThumbstick.prototype.setGuiWidget = function(widget) {
            this.guiWidget = widget;
            widget.addOnPressStartCallback(this.callbacks.onPressStart);
            widget.enableWidgetInteraction();
        };


        var camDir;
        GuiThumbstick.prototype.applyPositionOffset = function() {

            camDir = MainWorldAPI.getWorldSimulation().getWorldCameraDirection();

            this.inputAngle = MATH.addAngles(MATH.vectorXYToAngleAxisZ(this.offset), camDir);
            this.inputDistance = this.offset.length() / this.maxRange;
            this.guiWidget.offsetWidgetPosition(this.offset);

        };

        GuiThumbstick.prototype.handleThumbstickPressStart = function(inputIndex, guiWidget) {
            this.activeInputIndex = inputIndex;
            console.log("Thumbstick press start", inputIndex);
            GuiAPI.removeGuiUpdateCallback(this.callbacks.onStickReleasedUpdate);
            GuiAPI.addInputUpdateCallback(this.callbacks.onStickInputUpdate);
            GuiAPI.addGuiUpdateCallback(this.callbacks.notifyInputUpdated);
        };

        var length;

        GuiThumbstick.prototype.handleThumbstickInputUpdated = function(input, buffer) {

            var pressActive = GuiAPI.readInputBufferValue(input, buffer, ENUMS.InputState.ACTION_0);

            if (this.guiWidget.getWidgetSurface().getSurfaceInteractiveState() === ENUMS.ElementState.NONE) {
        //        return;
            }

            if (!pressActive) {

                    GuiAPI.removeInputUpdateCallback(this.callbacks.onStickInputUpdate);
                    GuiAPI.addGuiUpdateCallback(this.callbacks.onStickReleasedUpdate);
                    this.releaseTime = 0;

            } else {
                this.offset.x = GuiAPI.readInputBufferValue(input, buffer, ENUMS.InputState.DRAG_DISTANCE_X);
                this.offset.y = GuiAPI.readInputBufferValue(input, buffer, ENUMS.InputState.DRAG_DISTANCE_Y);

                length = this.offset.length();
                if (length > this.maxRange) {
                    this.offset.normalize();
                    this.offset.multiplyScalar(this.maxRange);
                }

            }

            this.applyPositionOffset();

        };

        GuiThumbstick.prototype.handleThumbstickReleasedUpdate = function(tpf, time) {
            this.releaseTime += tpf;

            this.releaseProgress = MATH.curveSqrt(1 - MATH.calcFraction(-this.releaseDuration, this.releaseDuration, this.releaseTime-this.releaseDuration));

            this.offset.multiplyScalar(this.releaseProgress);

        //    this.offset.multiplyScalar(this.releaseProgress);

            if (this.offset.lengthSq() < 0.0000001) {
                this.offset.set(0, 0, 0);
                GuiAPI.removeGuiUpdateCallback(this.callbacks.onStickReleasedUpdate);
                GuiAPI.removeGuiUpdateCallback(this.callbacks.notifyInputUpdated);
            }

            this.applyPositionOffset();
        };


        GuiThumbstick.prototype.addInputUpdateCallback = function(applyInputUpdate) {
            this.applyInputCallbacks.push(applyInputUpdate)
        };

        GuiThumbstick.prototype.notifyInputUpdated = function(ang, dist) {

            for (var i = 0; i < this.applyInputCallbacks.length; i++) {
                this.applyInputCallbacks[i](ang, dist);
            }
        };

        GuiThumbstick.prototype.removeGuiWidget = function() {
            MATH.emptyArray(this.applyInputCallbacks);
            this.guiWidget.recoverGuiWidget()
        };


        return GuiThumbstick;

    });