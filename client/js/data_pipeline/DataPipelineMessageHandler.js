"use strict";

class DataPipelineMessageHandler {


		okCount = 0;
		failCount = 0;

		generateMsgLevels = function(err) {
			var msg = [];
			if (typeof(err) == "array") {
				for (var i = 0; i < err.length; i++) {
					msg.push(err[i])
				}
			} else {
				msg.push(err);
			}
			return msg;
		};

		handleWorkerError = function(url, err) {

			var msg = this.generateMsgLevels(err);
			msg.push(this.failCount);
			msg.push(url);
			this.failCount += 1;
            this.delayedSend('data_error_channel', msg, 50)
		};

		handleErrorUpdate = function(update, err) {
			var msg = this.generateMsgLevels(err);
			msg.push(update);
            this.delayedSend('data_error_update_channel', msg, 300);


		};


		delayedSend = function(channel, msg, delay) {
			setTimeout(function() {
                console.log("Worker error: ", channel, msg)
			}, delay)
		};

		handleDataUpdated = function(url) {
			this.okCount += 1;
			delayedSend('data_update_channel', url+' '+okCount, 500);
		//	delayedSend('data_update_channel', url+' '+okCount, 500);
		//	delayedSend('data_update_channel', url+' '+okCount, 2500);
		};

		handleValidationPass = function(list) {
			delayedSend('data_validation_update_channel', list, 500);
		//	delayedSend('data_validation_update_channel', list, 600);
		//	delayedSend('data_validation_update_channel', list, 3500);
		};

		handleValidationError = function(msg) {
			delayedSend('data_validation_error_channel', msg, 500);
		//	delayedSend('data_validation_error_channel', msg, 600);
		//	delayedSend('data_validation_error_channel', msg, 3500);
		};


		notifyWorkerReady = function() {
		    console.log("worker ready add event for this?")
		//	ConfigCache.pipelineReady(true)
		};

	}

	export { DataPipelineMessageHandler	}