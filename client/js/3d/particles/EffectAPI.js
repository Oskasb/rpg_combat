import { ExpandingPool } from "../../application/utils/ExpandingPool.js";
import { PipelineObject } from "../../application/load/PipelineObject.js";
import { EffectSpawner } from "./EffectSpawner.js";
import { ParticleEffect } from "./ParticleEffect.js";
import { EffectBuilder } from "./EffectBuilder.js";

class EffectAPI {
    constructor() {

        let rebuildFx = function () {
            let rebuild = {};

            for (let key in this.activeEffects) {
                rebuild[key] = [];

                while (activeEffects[key].length) {
                    let fx = activeEffects[key].pop();
                    fx.bufferElement.releaseElement();
                    rebuild[key].push(fx)
                }

                while (rebuild[key].length) {
                    this.activateParticleEffect(rebuild[key].pop())
                }
            }

        }.bind(this);

        let createEffect = function (key, cb) {
            cb(key, new ParticleEffect());
        };

        this.effectPool = new ExpandingPool('effect', createEffect);
        this.effectBuilders = {};
        this.effectSpawners = {};
        this.particleConfigs = {};
        this.activeEffects = {};
        this.activateEffects = {};

        this.callbacks = {
            rebuildFx:rebuildFx,
        }
    }

    initEffectAPI = function(onReady) {

        let callbacks = this.callbacks;
        let effectSpawners =  this.effectSpawners;
        let particleConfigs = this.particleConfigs;
        let effectBuilders = this.effectBuilders;

        let onParticlesReady = function(src, data) {
            //    console.log(src, data)
            for (let i = 0; i < data.length; i++) {
                applyParticleConfigs(data[i]);
                if (!effectBuilders[data[i].id]) {
                    effectBuilders[data[i].id] = new EffectBuilder(data[i].id)
                }
                let effectBuilder = effectBuilders[data[i].id];
                effectBuilder.initEffectBuilder(data[i].id, onReady, callbacks.rebuildFx)
            }
        };

        let applyParticleConfigs = function(data) {
            //    console.log(data)
            for (let i in data) {

                let particleId = data[i].particle_id;
                if (!particleConfigs[particleId]) {
                    particleConfigs[particleId] = {}
                }

                for (let key in data[i]) {
                    particleConfigs[particleId][key] = data[i][key]
                }

            }

            callbacks.rebuildFx()

        };

        let applyEffectConfigs = function(data) {
            //    console.log(data)
            for (let i in data) {
                let spawner = data[i].spawner;

                if (effectSpawners[spawner]) {
                    effectSpawners[spawner].resetEffectSpawner()
                }

                effectSpawners[spawner] = new EffectSpawner();
                effectSpawners[spawner].applyConfig(data[i]);
                effectSpawners[spawner].setupInstantiator()
            }
            callbacks.rebuildFx()
        };

        let onDataReady = function(src, data) {
            console.log("Particle BUFFER data:", data, src)
            for (let i = 0; i < data.length; i++) {
                applyEffectConfigs(data[i]);
            }
            new PipelineObject('EFFECT', 'PARTICLES', onParticlesReady);
        };

        new PipelineObject('EFFECT', 'BUFFERS', onDataReady);
    };

    setupParticleEffect = function(bufferElement, spawnerId) {
        let effect = this.activateEffects[spawnerId].pop();
        effect.setBufferElement(bufferElement);

        if (!this.activeEffects[spawnerId]) {
            this.activeEffects[spawnerId] = []
        }

        this.activeEffects[spawnerId].push(effect);
    };

    activateParticleEffect = function(effect) {
        effect.setConfig(this.getEffectConfig( effect.getParticleId()));
        effect.applyConfig();
        let spawnerId = effect.getSpawnerId();

        if (!this.activateEffects[spawnerId]) {
            this.activateEffects[spawnerId] = []
        }
        this.activateEffects[spawnerId].push(effect);

        this.effectSpawners[spawnerId].buildBufferElement(spawnerId, this.etupParticleEffect)
    };

    getEffectConfig = function(particleId) {
        return this.particleConfigs[particleId]
    };

    getParticleEffect = function(callback) {
        this.effectPool.getFromExpandingPool(callback)
    };

    recoverParticleEffect = function(effect) {
        let spawner = effect.getSpawnerId();
        MATH.quickSplice(this.activeEffects[spawner], effect);
        this.effectSpawners[spawner].deactivateEffect(effect)
    };

    buildEffect = function(callback) {
        this.effectPool.getFromExpandingPool(callback)
    };

    buildEffectClassByConfigId = function(builderId, effectName, callback) {
        console.log("buildEffectClassByConfigId",builderId, effectName )
        let builder = this.effectBuilders[builderId];
        console.log("buildEffectClassByConfigId",builder, effectName )
        builder.buildEffectByConfigId(effectName, callback)
    };

    addParticleToEffectOfClass = function(particleId, particleEffect, effectOfClass) {
        particleEffect.setParticleId(particleId);
        this.effectBuilders[particleEffect.getSpawnerId()].addParticle(particleEffect, effectOfClass)
    };

    setupJointEffect = function(joint, configId) {
        console.log("setupJointEffect", joint, configId)
        this.effectBuilders[configId].buildEffectByConfigId(configId, joint.getAttachEffectCallback());
    };

    updateEffectAPI = function() {
        for (let spn in this.effectSpawners) {
            this.effectSpawners[spn].updateEffectSpawner()
        }
    };

}

export { EffectAPI };