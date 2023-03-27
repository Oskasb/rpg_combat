import {InputActionListener} from './InputActionListener.js';

class ElementListeners {

    constructor(P_STATE, gameScreen) {
        this.gameScreen = gameScreen;
        this.POINTER_STATE = P_STATE;
        this.actionListener = new InputActionListener();
        this.tempVec = new THREE.Vector3();
        this.x = 0;
        this.y = 0;
        this.dx = 0;
        this.dy = 0;
        this.wheelDelta = 0;
        this.inputUpdateCallbacks = [];
        this.setupInputListener(this);
    }


    setupInputListener = function(_this) {
        let touch;
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
            callInputUpdate(_this.POINTER_STATE.touches[10]);
        });

        this.gameScreen.getElement().addEventListener('mouseout', function(e) {
            //	e.stopPropagation();
            _this.dx = 0;
            _this.dy = 0;
            callInputUpdate(_this.POINTER_STATE.touches[10]);
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
            _this.POINTER_STATE.touches[10].wheelDelta = _this.wheelDelta;
            callInputUpdate(_this.POINTER_STATE.touches[10]);
        });

        this.gameScreen.getElement().addEventListener('touchstart', function(e) {
            //	e.preventDefault();

            for (let i = 0; i < e.changedTouches.length; i++) {
                touch = e.changedTouches[i];
                _this.x = touch.clientX;
                _this.y = touch.clientY;
                _this.dx = 0;
                _this.dy = 0;
                _this.POINTER_STATE.touches[touch.identifier].lastAction[0] = 0;
                _this.POINTER_STATE.touches[touch.identifier].action[0] = 1;
                callInputUpdate(_this.POINTER_STATE.touches[touch.identifier]);
            }

        });

        this.gameScreen.getElement().addEventListener('touchmove', function(e) {
            //	e.preventDefault();

            for (let i = 0; i < e.changedTouches.length; i++) {
                touch = e.changedTouches[i];
            //    console.log(touch.identifier)
                _this.x = touch.clientX;
                _this.y = touch.clientY;
                _this.dx = 2 * ((_this.x) - _this.gameScreen.getWidth() / 2) / _this.gameScreen.getWidth();
                _this.dy = 2 * ((_this.y) - _this.gameScreen.getHeight() / 2) / _this.gameScreen.getHeight();

                _this.POINTER_STATE.touches[touch.identifier].action[0] = 1;
                callInputUpdate(_this.POINTER_STATE.touches[touch.identifier]);
            }
        });

        let touchend = function(e) {
            //	e.preventDefault();


            for (let i = 0; i < e.changedTouches.length; i++) {
            //    console.log(e)
                touch = e.changedTouches[i];
                _this.x = touch.clientX;
                _this.y = touch.clientY;
                _this.dx = 2 * ((_this.x) - _this.gameScreen.getWidth() / 2) / _this.gameScreen.getWidth();
                _this.dy = 2 * ((_this.y) - _this.gameScreen.getHeight() / 2) / _this.gameScreen.getHeight();
                _this.POINTER_STATE.touches[touch.identifier].lastAction[0] = 1;
                _this.POINTER_STATE.touches[touch.identifier].action[0] = 0;

                callInputUpdate(_this.POINTER_STATE.touches[touch.identifier]);
            }

        };


        this.gameScreen.getElement().addEventListener('touchend', touchend, false);
        this.gameScreen.getElement().addEventListener('touchcancel', touchend, false);

        window.addEventListener('resize', function() {
            callInputUpdate(_this.POINTER_STATE.touches[10]);
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



        let width = this.gameScreen.getWidth();
        let height = this.gameScreen.getHeight();
        this.tempVec.x = ((this.x) - width / 2) / width;
        this.tempVec.y = -((this.y) - height / 2) / height;
        GameScreen.fitView(this.tempVec);
        inputState.posX = this.tempVec.x;
        inputState.posY = this.tempVec.y;
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