import {InputState} from './InputState.js';

class PointerCursor {

    constructor (pipelineAPI, gameScreen) {
        this.gameScreen = gameScreen;

        this.inputState = new InputState(gameScreen);

        this.x = 0;
        this.y = 0;
        this.INPUT_STATE = this.inputState.getPointerState();
        pipelineAPI.setCategoryData('INPUT_STATE', this.INPUT_STATE);

        let onInputUpdate = function(pState) {
            this.updatePointerState(pState);
        }.bind(this);

        this.inputState.setupUpdateCallback(onInputUpdate);

    }

    getInputState = function() {
        return this.INPUT_STATE;
    };

    updatePointerState = function(pointerState) {
        this.inputState.updateInputState(pointerState);

        GuiAPI.calls.updateInput(pointerState);
        // console.log(this.INPUT_STATE)
    };

}

export { PointerCursor }