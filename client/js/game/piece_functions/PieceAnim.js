"use strict";

define([

    ],
    function(

    ) {


        var PieceAnim = function(key, workerData, animState) {
            this.key = key;
            this.dataKey = 'animations';
            this.workerData = workerData;
            this.animationState = animState;
            this.currentTime = 0;
            this.duration = 0;
            this.startTime = 0;
            this.fade = 0.25;
            this.ts = 1;
            this.w = 0.01;
            this.channel = 0;

            this.fadeTime = 0;
            this.timeScale = 0;
            this.weight = 0;
        };

        PieceAnim.prototype.getData = function() {
            return this.workerData.readDataKey(this.dataKey)[this.key];
        };

        PieceAnim.prototype.activateNow = function(weight, timeScale, fadeTime) {
            this.currentTime = 0;
            this.animationState.setAnimationLoop(this.getData()['loop']);
            this.animationState.setAnimationClamp(this.getData()['clamp']);
            this.animationState.setAnimationSync(this.getData()['sync']);
            this.setWeight(weight || 1);
            this.setTimeScale(timeScale || 1);
            this.setFadeTime(fadeTime || timeScale || 1);
            this.setChannel(this.getData()['channel'] || 0);
            this.duration = this.getData()['duration'] / this.ts || 99999999999;
        };

        PieceAnim.prototype.setWeight = function(w) {
            this.weight = w;
            this.w = w * this.getData()['weight'];
            this.animationState.setAnimationWeight(this.w)
        };

        PieceAnim.prototype.setTimeScale = function(ts) {
            this.timeScale = ts;
            this.ts = ts* this.getData()['time_scale'];
            this.animationState.setAnimationTimeScale(this.ts)
        };

        PieceAnim.prototype.setFadeTime = function(timeScale) {
            this.fadeTime = this.getData()['fade'];
            this.fade = timeScale * this.fadeTime;
            this.animationState.setAnimationFade(this.fade)
        };

        PieceAnim.prototype.setChannel = function(channel) {
            this.channel = channel;
            this.animationState.setAnimationChannel(this.channel)
        };

        PieceAnim.prototype.notifyOverwrite = function(fade) {

            if (this.w) {
                this.duration = this.currentTime + fade;
            }
        };

        PieceAnim.prototype.refreshDuration = function() {
            this.duration = this.currentTime + this.getData()['duration'] || 99999999999;
        };

        PieceAnim.prototype.updateAnimation = function(tpf, time, removes) {
            this.currentTime += tpf;

            if (this.duration < this.currentTime) {

                this.setWeight(0);

                if (this.duration + this.fade < this.currentTime) {
                    this.setFadeTime(0);
                    removes.push(this);
                }

            }
        };


        return PieceAnim;

    });

