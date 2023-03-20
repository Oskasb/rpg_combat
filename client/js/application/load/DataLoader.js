import { DomLoadScreen } from '../ui/dom/DomLoadScreen.js';
import { AssetLoader } from './AssetLoader.js';

class DataLoader {
    constructor() {
        this.loadStates= {
            SHARED_FILES:'SHARED_FILES',
            CONFIGS:'CONFIGS',
            THREEDATA:'THREEDATA',
            IMAGES:'IMAGES',
            COMPLETED:'COMPLETED'
        };

        this.loadState = this.loadStates.SHARED_FILES;
        this.loadProgress = new DomLoadScreen();
        this.assetLoader = new AssetLoader();

    }

    loadDataAsset = function(assetType, assetId, callback) {
        this.assetLoader.loadAsset(assetType, assetId, callback)
    };

    getLoadScreen = function() {
        return this.loadProgress
    };

        getStates = function() {
            return this.loadStates;
        };

        setupPipelineCallback = function(loadStateChange) {

        };

        loadData = function(dataPipelineSetup, onPipelineReadyCallback, onErrorCallback) {


            let _this = this;
            let loadScreen = _this.getLoadScreen();
            let loadStates = _this.loadStates;
            let loadingCompleted = function() {
                onPipelineReadyCallback('Loading Completed');
            };

            let loadStateChange = function(state) {
                //    console.log('loadStateChange', state)
                    if (state === _this.getStates().IMAGES) {

                }

                if (state === _this.getStates().COMPLETED) {
                    _this.loadState = _this.loadStates.THREEDATA;
                    loadingCompleted()
                }

            };

            let assetCount = 0;

            function pipelineCallback(started, remaining, loaded, files) {
            //     console.log("SRL", _this.loadState, started, remaining, loaded, [files]);

                PipelineAPI.setCategoryKeyValue("STATUS", "FILE_CACHE", loaded);

                loadScreen.setProgress(loaded / started);

                if (_this.loadState === loadStates.THREEDATA && remaining === 0) {
                    //    console.log( "loadThreeData:", _this.loadState, started, remaining, loaded, [files]);
                    //   loadState = loadStates.COMPLETED;

                       loadStateChange(loadStates.COMPLETED);
                }

                let guiAPIRdyCB = function(msg) {
                    console.log(msg)
                }

                if (_this.loadState === loadStates.CONFIGS && remaining === 0) {
                 //   console.log( "json cached:", PipelineAPI.getCachedConfigs());


                remaining++
                    let loadCallback = function(asset) {
                //        console.log("requestAsset returns: ", asset)
                        assetCount--
                        remaining--
                        if (!assetCount) {
                            _this.loadState = loadStates.COMPLETED;
                            remaining--
                            loadStateChange(_this.loadState);
                        }
                    };

                    let subCallback = function(src, data) {
                        for (let i = 0; i < data.length; i++) {
                            assetCount++
                            remaining++
                            client.dynamicMain.requestAsset(data[i], loadCallback)
                        }
                    }

                    PipelineAPI.subscribeToCategoryKey("ASSETS", "LOAD_MODELS", subCallback);

                    GuiAPI.initGuiApi(guiAPIRdyCB)

                }

                if (_this.loadState === loadStates.SHARED_FILES && remaining === 0) {
                //    console.log( "shared loaded....");
                    _this.loadState = loadStates.CONFIGS;
                    _this.assetLoader.initAssetConfigs();

                    ThreeAPI.initThreeLoaders(_this.assetLoader);
                    ThreeAPI.loadThreeData();

                    loadStateChange(_this.loadState);
                }
            }

            PipelineAPI.addProgressCallback(pipelineCallback);

            let onPipelineInitCallback = function(configCache) {
                console.log("CONFIGS:", configCache.configs)
            };

            PipelineAPI.dataPipelineSetup(dataPipelineSetup.jsonRegUrl, dataPipelineSetup, onPipelineInitCallback, onErrorCallback);

            _this.setupPipelineCallback(loadStateChange);

        };

        notifyCompleted = function() {
            this.loadProgress.removeProgress();
            client.activateGui();

        };
    }

export { DataLoader }