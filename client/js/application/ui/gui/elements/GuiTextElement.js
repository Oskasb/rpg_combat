"use strict";

define([
        'application/ExpandingPool',
        'client/js/workers/main/ui/elements/GuiString'
    ],
    function(
        ExpandingPool,
        GuiString
    ) {

    var tempVec1 = new THREE.Vector3();

        var GuiTextElement = function() {

            this.guiStrings = [];

            this.minXY = new THREE.Vector3();
            this.maxXY = new THREE.Vector3();

            this.textLayout = {"x": 0.5, "y": 0.5, "fontsize": 15};
            this.maxRows = 1;

            var addElement = function(sysKey, callback) {
                var element = new GuiString();
                callback(element)
            };

            this.guiStringPool = new ExpandingPool('strings', addElement);
        };

        GuiTextElement.prototype.removeGuiString = function(guiString) {

            guiString.recoverGuiString();
            this.guiStringPool.returnToExpandingPool(guiString);

        };

        GuiTextElement.prototype.drawTextString = function(uiSysKey, string, cb) {

            this.uiSysKey = uiSysKey;

            var initString = function(guiString) {

                guiString.setString(string, uiSysKey);
                this.guiStrings.unshift(guiString);
                cb();
            }.bind(this);

                while (this.guiStrings.length > this.getTextMaxRows()-1) {
                    this.removeGuiString(this.guiStrings.pop())
                }


                var getElement = function(elem) {
                    initString(elem)
                }.bind(this);

                this.guiStringPool.getFromExpandingPool(getElement)

        };

        GuiTextElement.prototype.setFeedbackConfigId = function(feedbackConfigId) {
            this.feedbackConfigId = feedbackConfigId;
        };

        GuiTextElement.prototype.getFeedbackConfigId = function() {
            return this.feedbackConfigId;
        };


        GuiTextElement.prototype.setElementDataKeys = function(uiKey, dataKey, dataId) {
            this.uiKey = uiKey;
            this.dataKey = dataKey;
            this.dataId = dataId;
            var config = GuiAPI.getGuiSettingConfig(this.uiKey, this.dataKey, this.dataId);
            this.setElementConfig(config);
        };

        GuiTextElement.prototype.setElementConfig = function(config) {
            this.config = config;
        };


        GuiTextElement.prototype.setTextLayout = function(fontSize) {
            this.textLayout = fontSize;
        };

        GuiTextElement.prototype.getTextLayout = function() {
            return this.textLayout;
        };

        GuiTextElement.prototype.getTextMaxRows = function() {
            return this.maxRows;
        };

        GuiTextElement.prototype.getMaxCharCount = function() {
            var txtLayout = this.getTextLayout();
            var letterW = this.config['letter_width']  * txtLayout.fontsize;
            return Math.floor((this.maxXY.x - this.minXY.x) / letterW)
        };

        var parentPos = new THREE.Vector3();
        var parentSize= new THREE.Vector3();

        GuiTextElement.prototype.updateTextMinMaxPositions = function(guiSurface) {


            this.config = GuiAPI.getGuiSettingConfig(this.uiKey, this.dataKey, this.dataId);

            this.minXY.copy(guiSurface.minXY);
            this.maxXY.copy(guiSurface.maxXY);

            if (guiSurface.config) {
                guiSurface.applyPadding(this.minXY, this.maxXY);
            }

            parentPos.copy(this.minXY);
            parentSize.subVectors(this.maxXY, this.minXY);

            var txtLayout = this.getTextLayout();

                var letterW = this.config['letter_width']  * txtLayout.fontsize;
                var letterH = this.config['letter_height'] * txtLayout.fontsize;

                var maxW = -1;
                var maxH = -1;

                var rowSpacing = this.config['row_spacing'];

            var maxRows = Math.max(Math.floor((parentSize.y + rowSpacing) / (letterH + rowSpacing)), 1);

                var useRows = Math.min(maxRows, this.guiStrings.length);

            var stringHeight = useRows * (letterH + rowSpacing) - rowSpacing;
            var marginH = parentSize.y - stringHeight;
            var offsetY = marginH * txtLayout.y;

            this.maxRows = maxRows;

            for (var i = 0; i < useRows; i++) {

                if (maxH + letterH > parentPos.y + parentSize.y) {
                    continue;
                }

                tempVec1.copy(parentPos);

                var stringLength = Math.min(Math.floor(parentSize.x / letterW), this.guiStrings[i].getLetterCount());
                var stringWidth = stringLength*letterW;
                var margin = parentSize.x - stringWidth;
                var offsetX = margin * txtLayout.x;
                tempVec1.x += offsetX;
                tempVec1.y += offsetY;

                this.guiStrings[i].setStringPosition(tempVec1, letterW, letterH, rowSpacing, i,  parentPos.x + parentSize.x);

                if (this.guiStrings[i].maxXY.x > maxW) {
                    maxW = this.guiStrings[i].maxXY.x;
                }

                maxH = this.guiStrings[i].maxXY.y

            }

            this.maxXY.x = maxW;
            this.maxXY.y = maxH ;

        };

        GuiTextElement.prototype.clearTextContent = function() {

            while (this.guiStrings.length) {
                var guiString = this.guiStrings.shift();
                guiString.recoverGuiString();
                this.guiStringPool.returnToExpandingPool(guiString);
            }
        };

        GuiTextElement.prototype.recoverTextElement = function() {
            this.clearTextContent();
        };

        return GuiTextElement;

    });