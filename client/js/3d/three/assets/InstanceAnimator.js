"use strict";

define([

    ],
    function() {

        var action;
        var animKey;

        var InstanceAnimator = function(instancedModel) {
            this.animationActions = {};
            this.instancedModel = instancedModel;

            this.channels = [];

            this.addMixer(this.instancedModel.getObj3d());
            this.setupAnimations(this.instancedModel.getAnimationMap())
        };

        InstanceAnimator.prototype.addMixer = function(clone) {
            this.mixer = new THREE.AnimationMixer( clone );
        };

        InstanceAnimator.prototype.setupAnimations = function(animMap) {

            this.actionKeys = [];

            for (var key in animMap) {
                var actionClip = this.instancedModel.originalModel.getAnimationClip(animMap[key]);
                var action = this.addAnimationAction(actionClip);
                action.setEffectiveWeight( 1 );
                action.setEffectiveTimeScale( 1 );
            //    action.play();
                this.actionKeys.push(animMap[key]);
                this.animationActions[animMap[key]] = action;
            }
        };

        InstanceAnimator.prototype.initAnimatior = function() {

            for (var key in this.animationActions) {
                var action = this.animationActions[key];
                action.stop();
                action.on = false;
            //    action.setEffectiveWeight( 0 );
            //    action.enabled = false;
            }
        };


        InstanceAnimator.prototype.addAnimationAction = function(actionClip) {
            if (!actionClip) {
                console.log("No Anim Clip", this)
                return;
            }

            return this.mixer.clipAction( actionClip );
        };


        var loopModes = [THREE.LoopOnce, THREE.LoopRepeat, THREE.LoopPingPong];
        var clampModes = [false, true];



        var src;
        InstanceAnimator.prototype.getSyncSource = function(sync) {
            for (var i = 0; i < this.channels.length; i++ ) {
                src = MATH.getFromArrayByKeyValue(this.channels[i], 'sync', sync);
                if (src) {
                    return src;
                }
            }
        };

        InstanceAnimator.prototype.syncAction = function(action) {

            let syncSrc = this.getSyncSource(action.sync);
            if (syncSrc) {

                if (action.channel <= syncSrc.channel ) {

            //        console.log("SyncSlave", syncSrc._clip.name, "Master: ",action._clip.name);

                    syncSrc.setEffectiveTimeScale(action.getEffectiveTimeScale());
                    action.syncWith(syncSrc);

                } else {
            //        console.log("SyncMaster", syncSrc._clip.name, "Slave:", action._clip.name);
                    action.setEffectiveTimeScale(syncSrc.getEffectiveTimeScale());
                    syncSrc.syncWith(action);

                }

            }

        };

        InstanceAnimator.prototype.startChannelAction = function(channel, action, weight, fade, loop, clamp, timeScale, sync) {
    //        console.log("start chan action", action);

                action.reset();
                action.enabled = true;
                action.loop = loopModes[loop];
                action.clampWhenFinished = clampModes[clamp];

                action.setEffectiveWeight( weight );
                action.setEffectiveTimeScale( timeScale );

                action.play();

                action.fadeIn(fade);

                action.sync = sync;

                if (sync !== 0) {
                    this.syncAction(action);
                }

                channel.push(action);

        };

        InstanceAnimator.prototype.fadeinChannelAction = function(channel, toAction, weight, fade, loop, clamp, timeScale, sync) {

            if (channel.indexOf(toAction) === -1) {

                var fromAction = channel.pop();

                this.startChannelAction(channel, toAction, weight, fade, loop, clamp, timeScale, sync);

                if (fromAction.sync && fromAction.sync === sync) {
                    fromAction.syncWith(toAction);
                }
                fromAction.fadeOut(fade);

            } else {
                if (weight !== toAction.getEffectiveWeight()) {
                    toAction._scheduleFading(fade, toAction.getEffectiveWeight(), weight / toAction.getEffectiveWeight());
                }
                toAction.setEffectiveTimeScale( timeScale );
                if (toAction.sync) {
                    this.syncAction(toAction);
                }
            }

        };


        InstanceAnimator.prototype.stopChannelAction = function(channel, action) {

            MATH.quickSplice(channel, action);
            action.stop();
        };


        InstanceAnimator.prototype.updateAnimationAction = function(animationKey, weight, timeScale, fade, chan, loop, clamp, sync) {
            animKey = ENUMS.getKey('Animations', animationKey);
            action = this.animationActions[animKey];
            action.channel = chan;
        //    console.log("anim event:", animationKey, weight, timeScale, fade, chan);

            if (!action) {
                console.log("Bad anim event");
                return;
            }

            if (!this.channels[chan]) {
        //        console.log("Add anim channel", chan);
                this.channels[chan] = [];
            //    return;
            }

            if (weight) {

                if (this.channels[chan].length) {
                    this.fadeinChannelAction(this.channels[chan], action, weight, fade, loop, clamp, timeScale, sync)

                } else {
                    this.startChannelAction(this.channels[chan], action, weight, fade, loop, clamp, timeScale, sync)
                }

            } else {

                if (fade) {
                    action.fadeOut(fade);
                } else  {
                    this.stopChannelAction(this.channels[chan], action)
                }
            }

        };

        InstanceAnimator.prototype.activateAnimator = function() {
        //    this.initAnimatior()
            ThreeAPI.activateMixer(this.mixer);
        };

        InstanceAnimator.prototype.deActivateAnimator = function() {
            ThreeAPI.deActivateMixer(this.mixer);
        };

        return InstanceAnimator;

    });