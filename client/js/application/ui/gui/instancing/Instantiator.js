"use strict";

var GuiAPI;

define([
        'application/ExpandingPool',
        'workers/main/instancing/InstancingBuffers',
        'workers/main/instancing/InstancingBufferElement'
    ],
    function(
        ExpandingPool,
        InstancingBuffers,
        InstancingBufferElement
    ) {


        var Instantiator = function() {

            this.elementPools = {};
            this.elementBuffers = {};

            var elementBuffers = this.elementBuffers;
            var elementPools = this.elementPools;

            var buildElement = function(sysKey, cb) {
                var getElement = function(elem) {
                    elem.initGuiBufferElement(elementBuffers[sysKey]);
                    cb(elem, sysKey);
                };
                if (!elementPools[sysKey]) {
                    console.log("Bad pool", sysKey, [elementPools])
                }

                elementPools[sysKey].getFromExpandingPool(getElement)
            };

            var recoverElement = function(sysKey, elem) {
                elem.releaseElement();
                elementPools[sysKey].returnToExpandingPool(elem)
            };

            this.callbacks = {
                buildElement:buildElement,
                recoverElement:recoverElement,
            }

        };


        Instantiator.prototype.addInstanceSystem = function(elementKey, bufferSysKey, assetId, poolSize, renderOrder) {

                this.elementBuffers[elementKey] = new InstancingBuffers(bufferSysKey, assetId, poolSize, renderOrder);

                var addElement = function(poolKey, callback) {
                    var element = new InstancingBufferElement();
                    callback(element)
                };
                this.elementPools[elementKey] = new ExpandingPool(elementKey, addElement);
            };

        Instantiator.prototype.buildBufferElement = function(sysKey, cb) {
            this.callbacks.buildElement(sysKey, cb);
        };

        Instantiator.prototype.recoverBufferElement = function(sysKey, bufferElem) {
            this.callbacks.recoverElement(sysKey, bufferElem);
        };

        Instantiator.prototype.updateInstantiatorBuffers = function() {

            for (var key in this.elementBuffers) {
                this.elementBuffers[key].updateGuiBuffer()
            }

        };

        Instantiator.prototype.monitorBufferStats = function() {
            InstancingBuffers.monitorBufferStats();
        };

        return Instantiator;

    });