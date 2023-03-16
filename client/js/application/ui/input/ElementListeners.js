import {InputActionListener} from './InputActionListener.js';

class ElementListeners {

    constructor(P_STATE, gameScreen) {
        this.gameScreen = gameScreen;
        this.POINTER_STATE = P_STATE;
        this.actionListener = new InputActionListener();
        this.x = 0;
        this.y = 0;
        this.dx = 0;
        this.dy = 0;
        this.wheelDelta = 0;
        this.inputUpdateCallbacks = [];
        this.setupInputListener(this);
    }


    setupInputListener = function(_this) {

        let callInputUpdate = function(pState) {

            for (let i = 0; i < _this.inputUpdateCallbacks.length; i++) {
                _this.inputUpdateCallbacks[i](pState);
            }
        };

        this.actionListener.setupElementInputListener(this.gameScreen.getElement(), callInputUpdate, this.POINTER_STATE);

        this.gameScreen.getElement().addEventListener('mousemove', function(e) {
            //	e.stopPropagation();
            _this.x = (e.clientX);
            _this.y = (e.clientY);
            _this.dx = 2 * ((_this.x) - _this.gameScreen.getWidth() / 2) / _this.gameScreen.getWidth();
            _this.dy = 2 * ((_this.y) - _this.gameScreen.getHeight() / 2) / _this.gameScreen.getHeight();
            callInputUpdate(_this.POINTER_STATE.mouse);
        });

        this.gameScreen.getElement().addEventListener('mouseout', function(e) {
            //	e.stopPropagation();
            _this.dx = 0;
            _this.dy = 0;
            callInputUpdate(_this.POINTER_STATE.mouse);
        });

        let zoomTimeout;

        this.gameScreen.getElement().addEventListener('mousewheel', function(e) {
            //	e.stopPropagation();
            if (zoomTimeout) return;
            _this.wheelDelta = e.wheelDelta / 1200;
            setTimeout(function() {
                zoomTimeout = false;
            }, 100);
            zoomTimeout = true;
            _this.POINTER_STATE.mouse.wheelDelta = _this.wheelDelta;
            callInputUpdate(POINTER_STATE.mouse);
        });

        this.gameScreen.getElement().addEventListener('touchstart', function(e) {
            //	e.preventDefault();

            for (let i = 0; i < e.touches.length; i++) {
                _this.x = (e.touches[i].clientX);
                _this.y = (e.touches[i].clientY);
                _this.dx = 0;
                _this.dy = 0;

                _this.POINTER_STATE.touches[i].action[0] = 1;
                callInputUpdate(_this.POINTER_STATE.touches[i]);
            }

        });

        this.gameScreen.getElement().addEventListener('touchmove', function(e) {
            //	e.preventDefault();
            for (let i = 0; i < e.touches.length; i++) {
                _this.x = (e.touches[0].clientX);
                _this.y = (e.touches[0].clientY);
                _this.dx = 2 * ((_this.x) - _this.gameScreen.getWidth() / 2) / _this.gameScreen.getWidth();
                _this.dy = 2 * ((_this.y) - _this.gameScreen.getHeight() / 2) / _this.gameScreen.getHeight();
                callInputUpdate(_this.POINTER_STATE.touches[i]);
            }
        });

        let touchend = function(e) {
            //	e.preventDefault();
            for (let i = 0; i < _this.POINTER_STATE.touches.length; i++) {

                if (!e.touches[i]) {

                    if (_this.POINTER_STATE.touches[i].action[0]) {
                        _this.dx = 0;
                        _this.dy = 0;
                        _this.POINTER_STATE.touches[i].action[0] = 0;
                        callInputUpdate(_this.POINTER_STATE.touches[i]);
                    }
                }
            }
        };


        this.gameScreen.getElement().addEventListener('touchend', touchend, false);
        this.gameScreen.getElement().addEventListener('touchcancel', touchend, false);

        window.addEventListener('resize', function() {
            callInputUpdate(_this.POINTER_STATE.mouse);
        });
    };

    sampleMouseState = function(inputState) {

        if (inputState.action[0]) {
            inputState.pressFrames++;
        } else {
            inputState.pressFrames = 0;
        }

        inputState.x = this.x;
        inputState.y = this.y;
        inputState.dx = this.dx;
        inputState.dy = this.dy;
        inputState.wheelDelta = this.wheelDelta;

        this.wheelDelta = 0;
        this.dx = 0;
        this.dy = 0;
    };

    attachUpdateCallback = function(callback) {
        this.inputUpdateCallbacks.push(callback);
    }

}

export { ElementListeners }