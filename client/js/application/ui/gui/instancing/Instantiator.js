import { ExpandingPool } from "../../../utils/ExpandingPool.js";
import { InstancingBuffers} from "./InstancingBuffers.js";
import { InstancingBufferElement } from "./InstancingBufferElement.js";

class  Instantiator {
    constructor() {

            this.elementPools = {};
            this.elementBuffers = {};

            let elementBuffers = this.elementBuffers;
        let elementPools = this.elementPools;

        let buildElement = function(sysKey, cb) {
            let getElement = function(elem) {
                    elem.initGuiBufferElement(elementBuffers[sysKey]);
                    cb(elem, sysKey);
                };
                if (!elementPools[sysKey]) {
                    console.log("Bad pool", sysKey, [elementPools])
                }

                elementPools[sysKey].getFromExpandingPool(getElement)
            };

        let recoverElement = function(sysKey, elem) {
                elem.releaseElement();
                elementPools[sysKey].returnToExpandingPool(elem)
            };

            this.callbacks = {
                buildElement:buildElement,
                recoverElement:recoverElement,
            }

        };


        addInstanceSystem = function(elementKey, bufferSysKey, assetId, poolSize, renderOrder) {

                this.elementBuffers[elementKey] = new InstancingBuffers(bufferSysKey, assetId, poolSize, renderOrder);

        let addElement = function(poolKey, callback) {
            let element = new InstancingBufferElement();
                    callback(element)
                };
                this.elementPools[elementKey] = new ExpandingPool(elementKey, addElement);
            };

        buildBufferElement = function(sysKey, cb) {
            this.callbacks.buildElement(sysKey, cb);
        };

        recoverBufferElement = function(sysKey, bufferElem) {
            this.callbacks.recoverElement(sysKey, bufferElem);
        };

        updateInstantiatorBuffers = function() {

            for (let key in this.elementBuffers) {
                this.elementBuffers[key].updateGuiBuffer()
            }

        };

        monitorBufferStats = function() {
            InstancingBuffers.monitorBufferStats();
        };

    }

export {Instantiator}