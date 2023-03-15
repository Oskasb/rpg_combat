"use strict";

define([
        '3d/effects/particles/ParticleRendererState',
        '3d/effects/particles/ParticleMaterial',
        '3d/effects/particles/ParticleMesh',
        '3d/effects/particles/ParticleBuffer',
        '3d/effects/particles/RendererAttributes',
        '3d/effects/particles/Particle',
        'application/PipelineObject'

    ],
    function(
        ParticleRendererState,
        ParticleMaterial,
        ParticleMesh,
        ParticleBuffer,
        RendererAttributes,
        Particle,
        PipelineObject
    ) {

        var req;
        var i;
        var color;
        var tempVec = new THREE.Vector3();
        var key;

        var ParticleRenderer = function(rendererConfig, rendererReady, idx) {
            this.id = rendererConfig.id;
            this.setIndexOfRenderer(idx);

            var rendererStateReady = function() {
                this.setUpdateRender(1);
                rendererReady(this);
            }.bind(this);

            var renderMaterialReady = function() {
                this.particleRendererState = new ParticleRendererState(this.id, this.index);
                this.particleRendererState.setupRenderStateData(rendererStateReady);
            }.bind(this);

            this.setupRendererMaterial(rendererConfig, renderMaterialReady);
        };

        ParticleRenderer.prototype.setIndexOfRenderer = function(index) {
            this.index = index;
        };

        ParticleRenderer.prototype.getRendererKey = function() {
            this.rendererAttributes.getDataKey();
        };

        ParticleRenderer.prototype.setupRendererMaterial = function(rendererConfig, rendererReady) {

            this.isRendering = false;

            this.config = rendererConfig;
            this.poolSize = rendererConfig.particle_pool * 1;
            this.particleGeometry = rendererConfig.particle_geometry;

            this.isScreenspace = rendererConfig.is_screenspace || false;
            this.renderOrder = rendererConfig.render_order || null;

            this.biggestRequest = 5;

            this.material = {uniforms:{}};
            this.particles = [];
            this.drawingParticles = [];
            this.rendererAttributes = new RendererAttributes(this.id, this.index);
            this.attributeConfigs = {};

            this.systemTime = 0;

            var particleMaterialData = function(src, data) {
            //    console.log("particleMaterialData", src, data);
                if (this.particles.length) return;
                this.applyRendererMaterialData(data, rendererReady)
            }.bind(this);

            this.materialPipe = new PipelineObject("PARTICLE_MATERIALS", "THREE", particleMaterialData)
        };

        ParticleRenderer.prototype.setMaterial = function(material, rendererReady) {
            this.material = material;
            this.setupRendererBuffers(rendererReady);
        };

        ParticleRenderer.prototype.applyRendererMaterialData = function(data, rendererReady) {

            var materialReady = function(material) {
               this.setMaterial(material, rendererReady);
            }.bind(this);

            var attributesReady = function(data) {
                this.buildParticleMaterial(data, materialReady);
            }.bind(this);

            var dataMath = function(data) {
                this.setupBufferAttributes(data, attributesReady);
            }.bind(this);

            for (i = 0; i < data.length; i++) {
                if (data[i].id === this.config.material_id) {
                    dataMath(data[i]);
                }
            }
        };

        ParticleRenderer.prototype.setupRendererBuffers = function(rendererReady) {

            var bufferReady = function() {
                this.attachMaterial();
                this.createParticles(rendererReady);
            }.bind(this);

            this.buildMeshBuffer(bufferReady);
        };

        ParticleRenderer.prototype.createParticles = function(rendererReady) {
            if (this.particles.length) {
                console.error("Replace added particles wantes... bailing");
                return;
                this.particles = [];
            }

            for (i = 0; i < this.poolSize; i++) {
                var newParticle = new Particle(i);
                this.rendererAttributes.bindParticleAttributes(newParticle);
                this.particles.push(newParticle);
            }
            rendererReady(this);
        };

        ParticleRenderer.prototype.buildParticleMaterial = function(material_config, materialReady) {
            new ParticleMaterial(this.config.material_options, material_config, materialReady);

        };

        ParticleRenderer.prototype.buildMeshBuffer = function(bufferReady) {
            if (this.particleBuffer) {
                this.particleBuffer.dispose();
            }

            var geomCB = function(geom) {
                this.particleBuffer = new ParticleBuffer(geom.verts, geom.uvs, geom.indices, geom.normals);

                this.rendererAttributes.attachParticleBuffer(this.particleBuffer);

                for (key in this.particleBuffer.geometry.attributes) {
                    this.rendererAttributes.setRendererAttribute(key, this.particleBuffer.geometry.attributes[key]);
                }

                this.particleBuffer.addToScene(this.isScreenspace);

                if (this.renderOrder) {
                    this.particleBuffer.mesh.renderOrder = this.renderOrder;
                }

                bufferReady()

            }.bind(this);


            if (typeof(this.particleGeometry) === 'string') {
                geomCB(ParticleMesh[this.particleGeometry]())
            } else  {
                ParticleMesh.modelGeometry(this.particleGeometry, geomCB)
            }

        //    this.particleBuffers.push(this.particleBuffer);
        };

        ParticleRenderer.prototype.attachMaterial = function() {
            this.particleBuffer.mesh.material = this.material;
        };


        ParticleRenderer.prototype.setupBufferAttributes = function(data, attributesReady) {
            this.rendererAttributes.applyAttributesConfig(data, this.poolSize, attributesReady)
        };


        ParticleRenderer.prototype.calculateAllowance = function(requestSize) {

            if (this.biggestRequest < requestSize) {
                this.biggestRequest = requestSize;
            }

            if (this.particles.length - requestSize > this.biggestRequest) {
                return requestSize;
            } else {
                req = Math.round( (this.poolSize / this.particles.length) * requestSize) || 1;
                if (this.particles.length > req) {
                    return  req;
                } else if (this.particles.length) {

                    return 1;
                }
                console.log("zero particles.. ", requestSize);
                return null;
            }
        };

        var reqParticle;
        var retParticle;

        ParticleRenderer.prototype.requestParticle = function() {
            if (!this.particles.length) {
                console.log("Particles ran out...", this)
                return;
            }

            reqParticle = this.particles.shift();

            if (reqParticle.particleIndex > this.getHighestRenderingIndex()) {
                this.setHighestRenderingIndex(reqParticle.particleIndex);
                this.updateInstancedCount();
            }

            reqParticle.dead = false;
            this.drawingParticles.push(reqParticle);
            return reqParticle;
        };


        ParticleRenderer.prototype.computeHighestRenderingIndex = function() {
            this.setHighestRenderingIndex(-1);

            if (!this.particles.length) {
                return this.poolSize -1;
            }

            for (i = 0; i < this.drawingParticles.length; i++) {
                if(this.drawingParticles[i].particleIndex > this.getHighestRenderingIndex()) {
                    this.setHighestRenderingIndex(this.drawingParticles[i].particleIndex);
                }
            }

        };

        ParticleRenderer.prototype.discountDrawingParticle = function(particle) {
            this.drawingParticles.splice(this.drawingParticles.indexOf(particle), 1);
        };

        ParticleRenderer.prototype.returnParticle = function(prtcl) {
            this.discountDrawingParticle(prtcl);
            this.setUpdateRender(1);
            this.particles.unshift(prtcl);
        };


        ParticleRenderer.prototype.enableParticleRenderer = function() {
            this.isRendering = true;
            this.particleBuffer.addToScene(this.isScreenspace);
        };


        ParticleRenderer.prototype.disableParticleRenderer = function() {
            this.isRendering = false;
            this.particleBuffer.removeFromScene();
        };

        ParticleRenderer.prototype.applyUniformEnvironmentColor = function(uniform, worldProperty) {
            color = ThreeAPI.readEnvironmentUniform(worldProperty, 'color');
            uniform.value.r = color.r;
            uniform.value.g = color.g;
            uniform.value.b = color.b;
        };

        var quat;

        ParticleRenderer.prototype.applyUniformEnvironmentQuaternion = function(uniform, worldProperty) {
            quat = ThreeAPI.readEnvironmentUniform(worldProperty, 'quaternion');
            tempVec.set(0, 0, -1);
            tempVec.applyQuaternion(quat);
            uniform.value.x = tempVec.x;
            uniform.value.y = tempVec.y;
            uniform.value.z = tempVec.z;
        };


        ParticleRenderer.prototype.notifyRendererCloneRequested = function(targetIndex) {
        //    console.log("notifyRendererCloneRequested ...", targetIndex);
            this.particleRendererState.setRequestRendererAtIndex(targetIndex);
        };

        ParticleRenderer.prototype.checkRendererCloneRequested = function() {
            return this.particleRendererState.getRequestRendererAtIndex();
        };

        ParticleRenderer.prototype.setHighestRenderingIndex = function(highestIndex) {
            this.particleRendererState.setHighestActiveIndex(highestIndex);
        };

        ParticleRenderer.prototype.getHighestRenderingIndex = function() {
            return this.particleRendererState.getHighestActiveIndex()
        };

        ParticleRenderer.prototype.setUpdateRender = function(bool) {
            this.particleRendererState.setNeedsUpdate(bool)
        };


        ParticleRenderer.prototype.getUpdateRender = function() {
            return this.particleRendererState.getNeedsUpdate()
        };

        ParticleRenderer.prototype.updateInstancedCount = function() {
            this.particleBuffer.setInstancedCount( this.getHighestRenderingIndex() + 1);
        };

        ParticleRenderer.prototype.updateParticleRenderer = function(systemTime) {

            this.systemTime = systemTime;


            if (window.outerWidth) {

                this.rendererAttributes.updateNeedsUpdate();
                this.updateParticleRendererMaterial();

            //    if (this.getUpdateRender()) {
                //    this.computeHighestRenderingIndex();
                    this.updateInstancedCount();

            //    }

            } else {

                if (this.getUpdateRender()) {
                    this.computeHighestRenderingIndex();
                    this.updateInstancedCount();
                    this.setUpdateRender(0);
                }
                // Main thread gets attribute update from lastIndex of attributeBuffer
            }

        };

        ParticleRenderer.prototype.updateParticleRendererMaterial = function() {

            if (this.material.uniforms.systemTime) {
                this.material.uniforms.systemTime.value = this.systemTime;
            } else {
                console.log("no uniform yet...")
            }

            if (this.material.uniforms.fogColor) {
                this.applyUniformEnvironmentColor(this.material.uniforms.fogColor, 'fog')
            }

            if (this.material.uniforms.fogDensity) {
                this.material.uniforms.fogDensity.value = ThreeAPI.readEnvironmentUniform('fog', 'density');
            }

            if (this.material.uniforms.ambientLightColor) {
                this.applyUniformEnvironmentColor(this.material.uniforms.ambientLightColor, 'ambient');
            }

            if (this.material.uniforms.sunLightColor) {
                this.applyUniformEnvironmentColor(this.material.uniforms.sunLightColor, 'sun');
            }

            if (this.material.uniforms.sunLightDirection) {
                this.applyUniformEnvironmentQuaternion(this.material.uniforms.sunLightDirection, 'sun');
            }

        };

        ParticleRenderer.prototype.dispose = function() {
            this.particles = [];
            this.particleBuffer.dispose();
            this.materialPipe.removePipelineObject();
            delete this;
        };

        return ParticleRenderer;

    });