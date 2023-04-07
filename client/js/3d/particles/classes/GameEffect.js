class GameEffect {
    constructor(activateEffect, recoverEffect) {

        this.effectId = null;
        this.pos = new THREE.Vector3();
        this.normal = new THREE.Vector3();
        this.quat = new THREE.Quaternion();

        this.config = null;

        this.joint = null;

        this.attachParticles = [];
        this.activeParticles = [];

        let addEffectParticle = function(particle, key) {
            EffectAPI.addParticleToEffectOfClass(this.attachParticles.pop(), particle, this)
        }.bind(this);

        let positionUpdated = function(pos) {
            this.setEffectPosition(pos);
        }.bind(this);

        let getConfig = function() {
            return this.config;
        }.bind(this);

        let setConfig = function(config){
            this.config = config;
        }.bind(this);

        let setEffectId = function(effectId) {
            this.effectId = effectId;
        }.bind(this);

        let getEffectId = function() {
            return this.effectId
        }.bind(this);

        this.callbacks = {
            activateEffect : activateEffect,
            recoverEffect : recoverEffect,
            addEffectParticle:addEffectParticle,
            positionUpdated:positionUpdated,
            setConfig:setConfig,
            getConfig:getConfig,
            setEffectId:setEffectId,
            getEffectId:getEffectId
        }

    };

    setConfig = function(config) {
        this.callbacks.setConfig(config);
    };

    setEffectId = function(id) {
        this.callbacks.setEffectId(id);
    };

    getEffectId = function() {
        return this.callbacks.getEffectId();
    };

    attachParticleId = function(particleId) {
        this.attachParticles.push(particleId)
    };

    activateEffectParticle = function() {
        EffectAPI.buildEffect(this.callbacks.addEffectParticle)
    };

    activateEffectFromConfigId = function() {
        this.callbacks.activateEffect(this);
    };

    setEffectPosition = function(pos) {
        this.pos.copy(pos);
        for (let i = 0; i < this.activeParticles.length; i++) {
            this.activeParticles[i].setParticlePos(this.pos)
        }
    };

    scaleEffectSize = function(scale) {
        for (let i = 0; i < this.activeParticles.length; i++) {
            this.activeParticles[i].scaleParticleSize(scale)
        }
    };

    setEffectColorRGBA = function(rgba) {
        for (let i = 0; i < this.activeParticles.length; i++) {
            this.activeParticles[i].setParticleColor(rgba)
        }
    };

    setEffectNormal = function(normal) {
        this.normal.copy(normal);
    };

    setEffectQuaternion = function(quat) {
        this.quat.copy(quat);
        for (var i = 0; i < this.activeParticles.length; i++) {
            this.activeParticles[i].setParticleQuat(this.quat)
        }
    };

    attachToJoint = function(joint) {

        joint.getDynamicPosition(this.pos);
        joint.addPositionUpdateCallback(this.callbacks.positionUpdated);
        this.activateEffectFromConfigId();
        this.joint = joint;
    };

    recoverEffectOfClass = function() {

        if (this.joint) {
            this.joint.removePositionUpdateCallback(this.callbacks.positionUpdated);
            this.joint = null
        }

        while (this.activeParticles.length) {
            let particleEffect = this.activeParticles.pop()
         //   console.log("Recover ", particleEffect)
            EffectAPI.recoverParticleEffect(particleEffect)
        }

        this.callbacks.recoverEffect(this);
    };


}

export { GameEffect };