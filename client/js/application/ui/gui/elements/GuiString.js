"use strict";

define([
        'application/ExpandingPool',
        'client/js/workers/main/ui/elements/GuiLetter'
    ],
    function(
        ExpandingPool,
        GuiLetter
    ) {

        var letterPools = {};

        var fetch = function(sysKey, cb) {

            var addLetterCb = function(bufferElem) {

                var letter = new GuiLetter();
                letter.initLetterBuffers(bufferElem);
                cb(letter)
            };

            GuiAPI.buildBufferElement(sysKey, addLetterCb)
        };


        var createLetter = function(guiSysId, letter, index, cb) {

            var getLetter = function(guiLetter) {
                cb(guiLetter, letter, index);
            };

            letterPools[guiSysId].getFromExpandingPool(getLetter);

        };


        var GuiString = function() {
            this.string = '';
            this.letters = [];
            this.minXY = new THREE.Vector3();
            this.maxXY = new THREE.Vector3();
            this.centerXY = new THREE.Vector3();


            var addLetter = function(guiLetter, letter, index) {
                this.hideLetter(guiLetter);
                this.letters[index] = guiLetter;
                guiLetter.setLetter(letter);
                this.adds--;
                if (!this.adds) {
                    this.applyStringData();
                }
            }.bind(this);

            this.calls = {
                addLetter:addLetter
            }
        };

        GuiString.prototype.setString = function(string, guiSysId) {

            if (!string) {
                this.recoverGuiString();
                return;
            }


            if (typeof(string) === 'number') {
                string = ''+string;
            } else {

            }

            if (this.string === string) {
                return;
            }

            this.recoverGuiString();

            if (!letterPools[guiSysId]) {
                letterPools[guiSysId] = new ExpandingPool(guiSysId, fetch)
            }

            this.setupLetters(string, guiSysId);

        };


        var sprite = {x:7, y:0, z:0.0, w:0.0};

        var lifecycle = {x:0, y:0, z:0, w:0.25};

        var idx;



        GuiString.prototype.setupLetters = function(string, guiSysId) {

            this.adds = string.length;

            for (idx = 0; idx < string.length; idx++) {
                createLetter(guiSysId, string[idx], idx, this.calls.addLetter);
            }

        };

        GuiString.prototype.recoverGuiString = function() {

            while (this.letters.length) {
                this.letters.pop().releaseGuiLetter();
            //    this.expandingPool.returnToExpandingPool(letter);
            }
        };

        var spriteKey;
        var fontSprites;
        var letterSprite;
        var il;
        var guiLetter;
        var letter;


        GuiString.prototype.applyStringData = function() {

            spriteKey   = GuiAPI.getTextSystem().getSpriteKey();
            fontSprites = GuiAPI.getUiSprites(spriteKey);


            for (il = 0; il < this.letters.length; il++) {
                guiLetter = this.letters[il];

                letter = guiLetter.getLetter();

                letterSprite = fontSprites[letter];
                if (!letterSprite) {
                    sprite.x = 1;
                    sprite.y = 1;
                } else {
                    sprite.x = letterSprite[0];
                    sprite.y = letterSprite[1];
                }

                guiLetter.setLetterSprite(sprite);
            }

        //    this.setStringPosition(this.rootPosition)
        };


        GuiString.prototype.getLetterCount = function() {
            return this.letters.length
        };

        GuiString.prototype.setStringPosition = function(vec3, letterWidth, letterHeight, rowSpacing, row, maxW) {
            this.minXY.copy(vec3);
            this.minXY.y += row*rowSpacing + row*letterHeight;
            this.maxXY.copy(this.minXY);


            for (var i = 0; i < this.letters.length; i++) {

                var guiLetter = this.letters[i];
                if (this.maxXY.x + letterWidth > maxW) {
                    this.hideLetter(guiLetter);
                    continue;
                }


                this.applyRootPositionToLetter(i, guiLetter, letterWidth, letterHeight, rowSpacing, row);
            }
            this.maxXY.x += letterWidth*0.5;
        };


        GuiString.prototype.applyRootPositionToLetter = function(index, guiLetter, letterWidth, letterHeight, rowSpacing, row) {


            guiLetter.applyLetterHeight(letterHeight);

            this.maxXY.x = this.minXY.x + index * letterWidth + letterWidth*0.5;

            this.maxXY.y = this.minXY.y + letterHeight;

            this.centerXY.addVectors(this.minXY, this.maxXY).multiplyScalar(0.5);

            guiLetter.setLetterPositionXYZ(this.maxXY.x, this.centerXY.y, this.minXY.z);

        //    GuiAPI.debugDrawGuiPosition(guiLetter.pos.x, guiLetter.pos.y );

            guiLetter.applyLetterPosition()
        };

        GuiString.prototype.hideLetter = function(guiLetter) {
            guiLetter.applyLetterHeight(0);
            guiLetter.setLetterPositionXYZ(0, 0, 1);
            guiLetter.applyLetterPosition()

        };


        GuiString.prototype.setStringColorRGBA = function(rgba, lutColor) {

            for (var i = 0; i < this.letters.length; i++) {
                var guiLetter = this.letters[i];
                guiLetter.setLetterColorRGBA(rgba);
                guiLetter.setLetterLutColor(ENUMS.ColorCurve[lutColor]);
            }

        };


        return GuiString;

    });