class ParticleEffect {
    constructor() {
        this.particle_id = null;
        this.pos = new THREE.Vector3();
        this.offset = new THREE.Vector3();
        this.quat = new THREE.Quaternion();
        this.normal = new THREE.Vector3(0, 1, 0);
        this.rotZ = 0;
        this.size = 2+Math.random()*3;
        this.attackTime = 1;
        this.releaseTime = 1;
        this.colorRgba = {r:1, g:1, b:1, a: 1};

        this.config = {
            particle_id: "additive",
            spawner_id: "additive_particles_6x6",
            "size_min": 7,
            "size_max": 22,
            "color_min": [0.95, 0.95, 0.95, 1],
            "color_max": [1, 1, 1, 1],
            "sprite": [0, 0, 1, 0]
        };

        this.sprite = [0, 7];

        this.isActive = false;

        let setConfig = function(config){
            this.config = config;
        }.bind(this);

        let setParticleId = function(particle_id) {
            this.particle_id = particle_id;
        }.bind(this);

        let getParticleId = function() {
            return this.particle_id
        }.bind(this);


        let getSpawnerId = function() {
            return this.config.spawner_id
        }.bind(this)

        this.callbacks = {
            setConfig:setConfig,
            getParticleId:getParticleId,
            setParticleId:setParticleId,
            getSpawnerId:getSpawnerId
        };

        this.bufferElement;
    };

    setParticleId = function(id) {
        this.callbacks.setParticleId(id);
    };

    getParticleId = function() {
        return this.callbacks.getParticleId();
    };

    setConfig = function(config) {
        this.callbacks.setConfig(config);
    };

    getSpawnerId = function() {
        return this.callbacks.getSpawnerId();
    };

    setParticlePos = function(pos) {
        this.pos.copy(pos);
        this.pos.add(this.offset);
        if (this.bufferElement) {
            this.bufferElement.setPositionVec3(this.pos);
        }
    };

    setParticleNormal = function(normal) {
        this.normal.copy(normal);
    };

    setParticleQuat = function(quat) {
        this.quat.copy(quat);
        if (this.bufferElement) {
            this.bufferElement.setQuat(this.quat);
        }
    };

    setParticleDuration = function(duration) {
        this.duration = duration;
    };

    applyConfig = function() {

        this.size = MATH.randomBetween(this.config.size_min, this.config.size_max) || 5;

        this.colorRgba.r = MATH.randomBetween(this.config.color_min[0], this.config.color_max[0]) || 1;
        this.colorRgba.g = MATH.randomBetween(this.config.color_min[1], this.config.color_max[1]) || 1;
        this.colorRgba.b = MATH.randomBetween(this.config.color_min[2], this.config.color_max[2]) || 1;
        this.colorRgba.a = MATH.randomBetween(this.config.color_min[3], this.config.color_max[3]) || 1;
        this.sprite[0] = this.config.sprite[0] || 0;
        this.sprite[1] = this.config.sprite[1] || 7;
        this.sprite[2] = this.config.sprite[2] || 1;
        this.sprite[3] = this.config.sprite[3] || 0;

        this.attackTime = this.config.attack_time   || 1;
        this.releaseTime =this.config.release_time  || 1;

        if (this.config.surface) {

            if (this.pos.y < 0) {
                this.pos.y = 0;
                this.normal.set(0, 1, 0)
            }
        }

    };

    getParticleEffectBuffer = function() {
        return this.bufferElement;
    };

    setBufferElement = function(bufferElement) {

        this.bufferElement = bufferElement;
        this.bufferElement.setPositionVec3(this.pos);
        this.bufferElement.setQuat(this.quat);

        this.bufferElement.scaleUniform(this.size);
        this.bufferElement.sprite.x = this.sprite[0];
        this.bufferElement.sprite.y = this.sprite[1];
        this.bufferElement.sprite.z = this.sprite[2];
        this.bufferElement.sprite.w = this.sprite[3];

        this.bufferElement.setSprite(this.bufferElement.sprite);
        this.bufferElement.setColorRGBA(this.colorRgba);

        this.bufferElement.setAttackTime(this.attackTime);
        if (this.duration) {
        //    console.log("Duration: ", this.duration);
            this.bufferElement.applyDuration(this.duration);
        }

        this.bufferElement.setReleaseTime(this.releaseTime);
        this.bufferElement.startLifecycleNow();


    };


}
export { ParticleEffect }