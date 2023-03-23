import { ExpandingPool } from "../../../application/utils/ExpandingPool.js";
import { InstancingBuffers} from "./InstancingBuffers.js";
import { InstancingBufferElement } from "./InstancingBufferElement.js";

class  Instantiator {
    constructor(name) {


        this.name = name;
    //    console.log("Instantiator ", name)
        this.elementPools = {};
        this.elementBuffers = {};

        let elementBuffers = this.elementBuffers;
        let elementPools = this.elementPools;

        let getElementBuffers = function() {
            return elementBuffers;
        };


        let getEelementPools = function() {
            return elementPools;
        };

        let buildElement = function(sysKey, cb) {
        //    console.log("Build Instantiator elem:", sysKey)
            let getElement = function(elem) {
                elem.initGuiBufferElement(getElementBuffers()[sysKey]);
                elem.setDefaultBuffers();
                cb(elem, sysKey);
            };
            if (!getEelementPools()[sysKey]) {
                console.log("Bad pool", name, sysKey, [getEelementPools()])
            }

            getEelementPools()[sysKey].getFromExpandingPool(getElement)
        };

        let recoverElement = function(sysKey, elem) {
            elem.releaseElement();
            elementPools[sysKey].returnToExpandingPool(elem)
        };

        this.callbacks = {
            buildElement:buildElement,
            recoverElement:recoverElement,
            getElementBuffers:getElementBuffers
        }
    };

    getElementBufferByKey = function(key) {
        return this.callbacks.getElementBuffers()[key];
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

    updateInstantiatorBuffers = function(systemTime) {

        for (let key in this.elementBuffers) {
            this.elementBuffers[key].updateGuiBuffer(systemTime)
        }

    };

    monitorBufferStats = function() {
        InstancingBuffers.monitorBufferStats();
    };

}

export {Instantiator}