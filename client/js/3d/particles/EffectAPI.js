import { ExpandingPool } from "../../application/utils/ExpandingPool.js";
import { PipelineObject } from "../../application/load/PipelineObject.js";
import { EffectSpawner } from "./EffectSpawner.js";
import { ParticleEffect } from "./ParticleEffect.js";
import { EffectBuilder } from "./EffectBuilder.js";

class EffectAPI {
    constructor() {


        let createEffect = function (key, cb) {
            cb(key, new ParticleEffect());
        };

        let rebuildFx = function () {
            let rebuild = {};

            for (let key in activeEffects) {
                rebuild[key] = [];

                while (activeEffects[key].length) {
                    let fx = activeEffects[key].pop();
                    fx.bufferElement.releaseElement();
                    rebuild[key].push(fx)
                }

                while (rebuild[key].length) {
                    EffectAPI.activateParticleEffect(rebuild[key].pop())
                }
            }

        };

        this.effectPool = new ExpandingPool('effect', createEffect);
        this.effectBuilders = {};
        this.effectSpawners = {};
        this.particleConfigs = {};
        this.activeEffects = {};
        this.activateEffects = {};

        this.callbacks = {
            rebuildFx:rebuildFx
        }
    }


    initEffectAPI = function(onReady) {

        let callbacks = this.callbacks;
        let onParticlesReady = function(data) {

            for (let i = 0; i < data.length; i++) {
                EffectAPI.applyParticleConfigs(data[i].data);
                if (!this.effectBuilders[data[i].id]) {
                    this.effectBuilders[data[i].id] = new EffectBuilder(data[i].id)
                }
                let effectBuilder = this.effectBuilders[data[i].id];
                effectBuilder.initEffectBuilder(data[i].id, onReady, callbacks.rebuildFx)
            }
        };

        let onDataReady = function(src, data) {
            console.log("Particle BUFFER data:", data, src)
            for (let i = 0; i < data.length; i++) {
                EffectAPI.applyEffectConfigs(data[i].data);
            }
            new PipelineObject('EFFECT', 'PARTICLES', onParticlesReady);
        };

        new PipelineObject('EFFECT', 'BUFFERS', onDataReady);
    };

    applyEffectConfigs = function(data) {

        let effectSpawners =  this.effectSpawners;

        for (let i in data) {
            let spawner = data[i].spawner;

            if (effectSpawners[spawner]) {
                effectSpawners[spawner].resetEffectSpawner()
            }

            effectSpawners[spawner] = new EffectSpawner();
            effectSpawners[spawner].applyConfig(data[i]);
            effectSpawners[spawner].setupInstantiator()
        }
        this.callbacks.rebuildFx()
    };

    applyParticleConfigs = function(data) {

        console.log(data)

        let particleConfigs = this.particleConfigs;

        for (let i in data) {

            let particleId = data[i].particle_id;

            if (!particleConfigs[particleId]) {
                particleConfigs[particleId] = {}
            }

            for (let key in data[i]) {
                particleConfigs[particleId][key] = data[i][key]
            }

        }

        this.callbacks.rebuildFx()


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


    buildEffectClassByConfigId = function(configId, callback) {
        this.effectBuilder.buildEffectByConfigId(configId, callback)
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