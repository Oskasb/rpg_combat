class GameEffect {
    constructor(activateEffect, recoverEffect) {


            this.pos = new THREE.Vector3();
            this.normal = new THREE.Vector3();
            this.quat = new THREE.Quaternion();

            this.config = null;

            this.joint = null;

            this.attachParticles = [];
            this.activeParticles = [];

            let addEffectParticle = function(key, particle) {
                EffectAPI.addParticleToEffectOfClass(this.attachParticles.pop(), particle, this)
            }.bind(this);

            let positionUpdated = function(pos) {
                this.setEffectPosition(pos);
            }.bind(this);

            this.callbacks = {
                activateEffect : activateEffect,
                recoverEffect : recoverEffect,
                addEffectParticle:addEffectParticle,
                positionUpdated:positionUpdated
            }

        };

        setConfig = function(config) {
            this.config = config;
        };

        setEffectId = function(id) {
            this.effectId = id;
        };

        getEffectId = function() {
            return this.effectId;
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
            for (var i = 0; i < this.activeParticles.length; i++) {
                this.activeParticles[i].setParticlePos(this.pos)
            }
        };

        setEffectNormal = function(normal) {
            this.normal.copy(normal);
        };

        setEffectQuaternion = function(quat) {
            this.quat.copy(quat);
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
                EffectAPI.recoverParticleEffect(this.activeParticles.pop())
            }

            this.callbacks.recoverEffect(this);
        };


    }

export { GameEffect };