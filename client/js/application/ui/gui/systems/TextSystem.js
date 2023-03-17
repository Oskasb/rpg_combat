"use strict";

define([
        'application/ExpandingPool',
        'client/js/workers/main/ui/elements/GuiTextElement'
    ],
    function(
        ExpandingPool,
        GuiTextElement
    ) {

        var tempVec1 = new THREE.Vector3();

        var TextSystem = function(spriteKey) {
            this.elements = [];

            this.spriteKey = spriteKey;

            var addElement = function(sysKey, callback) {
                var element = new GuiTextElement();
                callback(element)
            };

            this.expandingPool = new ExpandingPool('text_elements', addElement);
        };


        TextSystem.prototype.initTextSystem = function(callback) {

            var textSystem = this;

            var onTextSetting = function(src, data) {
            //    console.log("UI TXT DATA", src, data.config);
                textSystem.spriteKey = data.config["sprite_atlas"];
                GuiAPI.addUiSystem(src, data.config["sprite_atlas"],  data.config["mesh_asset"],   data.config["pool_size"], data.config["render_order"]);
                callback();


            };

            GuiAPI.getGuiSettings().initGuiSettings(["UI_TEXT_MAIN"], onTextSetting)

        };



        TextSystem.prototype.getSpriteKey = function() {
            return this.spriteKey;
        };



        TextSystem.prototype.addTextElement = function(element) {
            this.elements.unshift(element);
        };


        TextSystem.prototype.removeTextElement = function(element) {

            element.recoverTextElement();
            this.expandingPool.returnToExpandingPool(element);

        };


        TextSystem.prototype.buildTextElement = function(cb, dataId) {

            var getElement = function(elem) {

                elem.setElementDataKeys('SPRITE_FONT', this.spriteKey, dataId);

                cb(elem);
            }.bind(this);

            this.expandingPool.getFromExpandingPool(getElement)

        };



        return TextSystem;

    });