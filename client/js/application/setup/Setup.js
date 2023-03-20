import { ThreeAPI } from '../../3d/three/ThreeAPI.js';
import { EffectAPI } from "../../3d/particles/EffectAPI.js";
import { GuiAPI} from "../ui/gui/GuiAPI.js";
import { UiSetup } from "../ui/gui/UiSetup.js";
import { InstanceAPI } from '../../3d/three/instancer/InstanceAPI.js';
import { DomUtils } from '../ui/dom/DomUtils.js';
import { DataLoader } from '../load/DataLoader.js';


class Setup {

    constructor() {
        window.DomUtils = new DomUtils();
        this.dataLoader = new DataLoader();
        this.uiSetup = new UiSetup();
    }

    initDefaultUi = function() {

        this.uiSetup.setupDefaultUi()
    };

    initUiSetup(callback) {
        this.uiSetup.initUiSetup(callback)
    }

    initGlobalAPIs(pipelineAPI) {
        window.EffectAPI = new EffectAPI();
        window.PipelineAPI = pipelineAPI;
        window.InstanceAPI = new InstanceAPI();
        window.ThreeAPI = new ThreeAPI();
        window.GuiAPI = new GuiAPI();
        window.evt = client.evt;
    }

    initDataPipeline(pipelineAPI, pipelineReadyCB) {
        let dataLoader = this.dataLoader;
        let ready = {
            JSON_PIPE:false,
            IMAGE_PIPE:false
        };

        let pipeReady = function(msg, pipeName) {
            //    console.log('pipeReady', msg, pipeName)
            ready[pipeName] = true;
            if (ready.JSON_PIPE && ready.IMAGE_PIPE) {
                pipelineReadyCB();
            }
        };

        let pipeMsgCB = function(src, channel, msg) {
        //    console.log(src, channel, msg)
            dataLoader.getLoadScreen().logMessage(msg, '#af8', channel);
        };

        pipelineAPI.initConfigCache(pipeReady, pipeMsgCB);

    };

    initConfigCache(pipelineAPI, dataPipelineSetup) {
        let dataLoader = this.dataLoader;
        let onErrorCallback = function(err) {
            console.log("Data Pipeline Error:", err);
        };

        let onPipelineReadyCallback = function(msg) {
            console.log("Pipeline:", msg)
            dataLoader.notifyCompleted();
        };

        dataLoader.loadData(dataPipelineSetup, onPipelineReadyCallback, onErrorCallback);
    }

}

export { Setup }
