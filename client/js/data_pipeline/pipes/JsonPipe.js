"use strict";
import { DataWorker } from '../DataWorker.js';


class JsonPipe {

    constructor(pipeReadyCB, pipelineMessageCB) {
        this.dataWorker = new DataWorker(ENUMS.Worker.JSON_PIPE, pipeReadyCB, pipelineMessageCB);
    }

		pollDelay = 0.2;
		pollCountdown = this.pollDelay;
		loadedData = {};
		lastPolledIndex = 0;
		pollIndex = [];
		pollCallbacks = {};
		errorCallback = function() {};

		options = {
			"polling":{
				"enabled":false,
				"frequency":5
			}
		};

		registerPollCallback = function(url, onUpdateCallback) {
            this.pollCallbacks[url] = onUpdateCallback;
            this.pollIndex.push(url);
		};

        pollUrl = function(url) {
            if (!this.pollCallbacks[url]) return;
            if (this.pollIndex.indexOf(url) === -1) {
                this.pollIndex.push(url);
            }
        };

        removeUrlPoll = function(url) {
            if (this.pollIndex.indexOf(url) !== -1) {
                this.pollIndex.splice(pollIndex.indexOf(url));
            }
        };

		storeConfig = function(url, config, success) {
			this.loadedData[url] = config;
			success(url, config);
		};

		loadJsonFromUrl = function(url, dataUpdated, fail) {
		    let _this = this;
			var onLoaded = function(config, fileUrl) {
                _this.storeConfig(fileUrl, config, dataUpdated);
                _this.registerPollCallback(fileUrl, dataUpdated);
			};

			var onWorkerOk = function(resUrl, res) {
				onLoaded(res, resUrl);

			};
			var onWorkerFail = function(res) {
				fail("Worker fail: "+ res)
			};

            this.dataWorker.fetchJsonData(url, onWorkerOk, onWorkerFail);
		};

		saveJsonToUrl = function(json, url) {
            this.dataWorker.saveJsonData(json, url);
		};
		
		tickJsonPipe = function(tpf) {
			if (!this.options.polling.enabled) return;
            this.pollDelay = 1/this.options.polling.frequency;
            this.pollCountdown -= this.pollIndex.length*tpf/(this.pollIndex.length+1);
			if (this.pollCountdown < 0) {
                this.lastPolledIndex += 1;
				if (this.lastPolledIndex >= this.pollIndex.length) {
                    this.lastPolledIndex = 0;
				}
				var pollFail = function(err) {
                    this.errorCallback("Json: ", err);
				};
				this.loadJsonFromUrl(this.pollIndex[this.lastPolledIndex], this.pollCallbacks[this.pollIndex[this.lastPolledIndex]], pollFail, false);
                this.pollCountdown = this.pollDelay;
			}
		};

		setJsonPipeOpts = function(opts, pipelineErrorCb, ConfigCache) {
            this.options = opts;
            this.errorCallback = pipelineErrorCb;
			
			var statusUpdate = function(key, value) {
				if (value) {

				} else {

				}

                opts.polling.enabled = value;
			};
			ConfigCache.subscribeToCategoryKey('STATUS', "PIPELINE", statusUpdate)
		};


	}

export { JsonPipe }