

"use strict";

define([],
    function() {

        var buffer;
        var attribIdx;

        function buffer1DEqualsValue(buffer, index, value) {
            if (buffer[index] === value) {
                return true;
            }
        }

        function buffer2DEqualsValues(buffer, index, value1, value2) {
            if (buffer[index] === value1 && buffer[index+1] === value2) {
                return true;
            }
        }

        function buffer3DEqualsValues(buffer, index, value1, value2, value3) {
            if (buffer[index] === value1 && buffer[index+1] === value2 && buffer[index+2] === value3) {
                return true;
            }
        }

        function buffer4DEqualsValues(buffer, index, value1, value2, value3, value4) {
            if (buffer[index] === value1 && buffer[index+1] === value2 && buffer[index+2] === value3 && buffer[index+3] === value4) {
                return true;
            }
        }

        var Particle = function(particleIndex) {
            this.usedCount = 0;
            this.particleIndex = particleIndex;
            this.buffers = {};
            this.attributes = {};
            this.scale = 1;

            this.posOffset = new THREE.Vector3();
            this.velVec = new THREE.Vector4();
            this.posVec = new THREE.Vector4();

            this.quat = new THREE.Quaternion();

            this.systemTime = {value:0};

            this.params = {
                position:this.posVec,
                velocity:this.velVec,
                quaternion:this.quat,
                systemTime:this.systemTime
            };

            this.progress = 0;
            this.dead = false;
            this.attributeBuffers = {};
        };

        Particle.prototype.setStartTime = function(systemTime) {
            this.progress = 0;
            this.params.systemTime.value = systemTime;
        };

        Particle.prototype.initToSimulation = function(systemTime, vel) {
            this.dead = false;
            this.usedCount++;
            this.addVelocity(vel);
            this.setStartTime(systemTime);
        };

        Particle.prototype.applyDead = function() {
            this.params.position.x = 0;
            this.params.position.y = 0;
            this.params.position.z = 0;
            this.params.position.w = 0;
            this.params.lifeTime.value = 0;
        };

        Particle.prototype.getProgress = function() {
            return this.progress;
        };

        Particle.prototype.getLifeTime = function() {
            return this.params.lifeTime.value;
        };

        Particle.prototype.getParamValue = function(param) {
            return this.params[param].value;
        };

        Particle.prototype.addPosition = function(pos) {
            this.params.position.x += pos.x;
            this.params.position.y += pos.y;
            this.params.position.z += pos.z;
        };

        Particle.prototype.setPosition = function(pos) {
            this.params.position.x = pos.x;
            this.params.position.y = pos.y;
            this.params.position.z = pos.z;
        };

        Particle.prototype.setSize = function(size) {
            this.params.position.w = size;
        };

        Particle.prototype.setQuaternion = function(quat) {
            this.params.quaternion.x = quat.x;
            this.params.quaternion.y = quat.y;
            this.params.quaternion.z = quat.z;
            this.params.quaternion.w = quat.w;
        };

        Particle.prototype.setVelocity = function(vel) {
            this.params.velocity.x = vel.x;
            this.params.velocity.y = vel.y;
            this.params.velocity.z = vel.z;
        };

        Particle.prototype.addVelocity = function(vel) {
            this.params.velocity.x += vel.x;
            this.params.velocity.y += vel.y;
            this.params.velocity.z += vel.z;
        };



        Particle.prototype.bindAttribute = function(name, dimensions, attributeBuffer) {
            this.buffers[name] = attributeBuffer.array;
            this.attributeBuffers[name] = attributeBuffer;
            this.attributes[name] = this.particleIndex*dimensions;
        };
                
        Particle.prototype.setAttribute1D = function(name, value) {
            this.buffers[name][this.attributes[name]] = value;
            this.setAttributeNeedsUpdate(this.attributeBuffers[name])
        };

        Particle.prototype.setAttribute2D = function(name, value1, value2) {

            buffer = this.buffers[name];
            attribIdx = this.attributes[name];
            buffer[attribIdx]   = value1;
            buffer[attribIdx+1] = value2;
            this.setAttributeNeedsUpdate(this.attributeBuffers[name])
        };

        Particle.prototype.setAttribute3D = function(name, value1, value2, value3) {
            buffer = this.buffers[name];
            attribIdx = this.attributes[name];

            buffer[attribIdx]   = value1;
            buffer[attribIdx+1] = value2;
            buffer[attribIdx+2] = value3;
            this.setAttributeNeedsUpdate(this.attributeBuffers[name])
        };

        Particle.prototype.setAttribute4D = function(name, value1, value2, value3, value4) {
            buffer = this.buffers[name];
            attribIdx = this.attributes[name];
            buffer[attribIdx]   = value1;
            buffer[attribIdx+1] = value2;
            buffer[attribIdx+2] = value3;
            buffer[attribIdx+3] = value4;
            this.setAttributeNeedsUpdate(this.attributeBuffers[name])
        };

        Particle.prototype.setAttributeNeedsUpdate = function(attribBuffer) {
            attribBuffer.array[attribBuffer.array.length -1] = 1;
        };

        return Particle;

    });