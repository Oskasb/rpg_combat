class PieceAnim {
    constructor(key, animData, animState) {
            this.key = key;
            this.dataKey = 'animations';
            this.animData = animData;
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

        activateNow = function(weight, timeScale, fadeTime) {
            this.currentTime = 0;

        //    console.log(this.animData)

            this.animationState.setAnimationLoop(this.animData['loop']);
            this.animationState.setAnimationClamp(this.animData['clamp']);
            this.animationState.setAnimationSync(this.animData['sync']);
            this.setWeight(weight || 1);
            this.setTimeScale(timeScale || 1);
            this.setFadeTime(fadeTime || timeScale || 1);
            this.setChannel(this.animData['channel'] || 0);
            this.duration = this.animData['duration'] / this.ts || 99999999999;
        };

        setWeight = function(w) {
            this.weight = w;
            this.w = w * this.animData['weight'];
            this.animationState.setAnimationWeight(this.w)
        };

        setTimeScale = function(ts) {
            this.timeScale = ts;
            this.ts = ts* this.animData['time_scale'];
            this.animationState.setAnimationTimeScale(this.ts)
        };

        setFadeTime = function(timeScale) {
            this.fadeTime = this.animData['fade'];
            this.fade = timeScale * this.fadeTime;
            this.animationState.setAnimationFade(this.fade)
        };

        setChannel = function(channel) {
            this.channel = channel;
            this.animationState.setAnimationChannel(this.channel)
        };

        notifyOverwrite = function(fade) {

            if (this.w) {
                this.duration = this.currentTime + fade;
            }
        };

        refreshDuration = function() {
            this.duration = this.currentTime + this.animData['duration'] || 99999999999;
        };

        updateAnimation = function(tpf, time, removes) {
            this.currentTime += tpf;

            if (this.duration < this.currentTime) {

                this.setWeight(0);

                if (this.duration + this.fade < this.currentTime) {
                    this.setFadeTime(0);
                    removes.push(this);
                }

            }
        };

    }

export { PieceAnim }