import { ExpandingPool} from "../../../utils/ExpandingPool.js";
import { GuiLetter} from "../elements/GuiLetter.js";


class GuiString {
    constructor() {

        this.sprite = {x:7, y:0, z:0.0, w:0.0};
        this.lifecycle = {x:0, y:0, z:0, w:0.25};
        this.letterPools = {};
        this.string = '';
        this.letters = [];
        this.minXY = new THREE.Vector3();
        this.maxXY = new THREE.Vector3();
        this.centerXY = new THREE.Vector3();

        let _this = this;
        let addLetter = function(guiLetter, letter, index, guiSysId) {
            guiLetter.setGuiSysId(guiSysId);
        //    let bufferElem = GuiAPI.getBufferElementByUiSysKey(guiSysId);
        //    guiLetter.initLetterBuffers(bufferElem);
            _this.hideLetter(guiLetter);
            _this.letters[index] = guiLetter;
            guiLetter.setLetter(letter);
            this.adds--;
            if (!_this.adds) {
                _this.applyStringData();
            }
        }.bind(this);

        this.calls = {
            addLetter:addLetter
        }
    }



    setString = function(string, guiSysId) {
        let _this = this;
        if (!string) {
            _this.recoverGuiString();
            return;
        }


        if (typeof(string) === 'number') {
            string = ''+string;
        } else {

        }

        if (this.string === string) {
            return;
        }

        _this.recoverGuiString();

        if (!this.letterPools[guiSysId]) {

            let fetch = function(sysKey, cb) {

                let addLetterCb = function(bufferElem) {

                    let guiLetter = new GuiLetter();
                    guiLetter.initLetterBuffers(bufferElem);
                    cb(guiLetter)
                };

                GuiAPI.buildBufferElement(sysKey, addLetterCb)
            };

            this.letterPools[guiSysId] = PipelineAPI.addExpandingPool(guiSysId, fetch)
        }

        _this.setupLetters(string, guiSysId);

    };

    setupLetters = function(string, guiSysId) {
        let letterPools = this.letterPools;
        let createLetter = function(guiSysId, letter, index, cb) {

            let getLetter = function(guiLetter) {
                cb(guiLetter, letter, index, guiSysId);
            };

            letterPools[guiSysId].getFromExpandingPool(getLetter);

        };

        this.adds = string.length;

        for (let idx = 0; idx < string.length; idx++) {
            createLetter(guiSysId, string[idx], idx, this.calls.addLetter);
        }

    };

    recoverGuiString = function() {

        while (this.letters.length) {
            let letter = this.letters.pop()
        //    letter.releaseGuiLetter();
            this.letterPools[letter.getGuiSysId()].returnToExpandingPool(letter);
        }
    };


    applyStringData = function() {

        let spriteKey   = GuiAPI.getTextSystem().getSpriteKey();
        let fontSprites = GuiAPI.getUiSprites(spriteKey);


        for (let il = 0; il < this.letters.length; il++) {
            let guiLetter = this.letters[il];

            let letter = guiLetter.getLetter();

            let letterSprite = fontSprites[letter];
            if (!letterSprite) {
                this.sprite.x = 1;
                this.sprite.y = 1;
            } else {
                this.sprite.x = letterSprite[0];
                this.sprite.y = letterSprite[1];
            }

            guiLetter.setLetterSprite(this.sprite);
        }

        //    this.setStringPosition(this.rootPosition)
    };


    getLetterCount = function() {
        return this.letters.length
    };

    setStringPosition = function(vec3, letterWidth, letterHeight, rowSpacing, row, maxW) {
        this.minXY.copy(vec3);
        this.minXY.y += row*rowSpacing + row*letterHeight;
        this.maxXY.copy(this.minXY);


        for (let i = 0; i < this.letters.length; i++) {

            let guiLetter = this.letters[i];
            if (this.maxXY.x + letterWidth > maxW) {
                this.hideLetter(guiLetter);
                continue;
            }


            this.applyRootPositionToLetter(i, guiLetter, letterWidth, letterHeight, rowSpacing, row);
        }
        this.maxXY.x += letterWidth*0.5;
    };


    applyRootPositionToLetter = function(index, guiLetter, letterWidth, letterHeight, rowSpacing, row) {


        guiLetter.applyLetterHeight(letterHeight);

        this.maxXY.x = this.minXY.x + index * letterWidth + letterWidth*0.5;

        this.maxXY.y = this.minXY.y + letterHeight;

        this.centerXY.addVectors(this.minXY, this.maxXY).multiplyScalar(0.5);

        guiLetter.setLetterPositionXYZ(this.maxXY.x, this.centerXY.y, this.minXY.z);

        //    GuiAPI.debugDrawGuiPosition(guiLetter.pos.x, guiLetter.pos.y );

        guiLetter.applyLetterPosition()
    };

    hideLetter = function(guiLetter) {
        guiLetter.applyLetterHeight(0);
        guiLetter.setLetterPositionXYZ(0, 0, 1);
        guiLetter.applyLetterPosition()

    };


    setStringColorRGBA = function(rgba, lutColor) {

        for (let i = 0; i < this.letters.length; i++) {
            let guiLetter = this.letters[i];
            guiLetter.setLetterColorRGBA(rgba);
            guiLetter.setLetterLutColor(ENUMS.ColorCurve[lutColor]);
        }

    };

}

export { GuiString }