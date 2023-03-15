"use strict";
import { DataWorker } from '../DataWorker.js';


class JsonPipe {

		dataWorker = new DataWorker();

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
			pollCallbacks[url] = onUpdateCallback;
			pollIndex.push(url);
		};

        pollUrl = function(url) {
            if (!pollCallbacks[url]) return;
            if (pollIndex.indexOf(url) === -1) {
            	pollIndex.push(url);
            }
        };

        removeUrlPoll = function(url) {
            if (pollIndex.indexOf(url) !== -1) {
                pollIndex.splice(pollIndex.indexOf(url));
            }
        };

		storeConfig = function(url, config, success) {
			loadedData[url] = config;
			success(url, config);
		};

		loadJsonFromUrl = function(url, dataUpdated, fail) {
			var onLoaded = function(config, fileUrl) {
				JsonPipe.storeConfig(fileUrl, config, dataUpdated);
				JsonPipe.registerPollCallback(fileUrl, dataUpdated);
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
			if (!options.polling.enabled) return;
			pollDelay = 1/options.polling.frequency;
			pollCountdown -= pollIndex.length*tpf/(pollIndex.length+1);
			if (pollCountdown < 0) {
				lastPolledIndex += 1;
				if (lastPolledIndex >= pollIndex.length) {
					lastPolledIndex = 0;
				}
				var pollFail = function(err) {
					errorCallback("Json: ", err);
				};
				JsonPipe.loadJsonFromUrl(pollIndex[lastPolledIndex], pollCallbacks[pollIndex[lastPolledIndex]], pollFail, false);
				pollCountdown = pollDelay;
			}
		};

		setJsonPipeOpts = function(opts, pipelineErrorCb, ConfigCache) {
			options = opts;
			errorCallback = pipelineErrorCb;
			
			var statusUpdate = function(key, value) {
				if (value) {

				} else {

				}

				options.polling.enabled = value;
			};
			ConfigCache.subscribeToCategoryKey('STATUS', "PIPELINE", statusUpdate)
		};


	}

export { JsonPipe }