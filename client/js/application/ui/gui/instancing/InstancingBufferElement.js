"use strict";

define([

    ],
    function(

    ) {

    var tempObj = new THREE.Object3D();

        var InstancingBufferElement = function() {
            this.position = new THREE.Vector3();
            this.quaternion = new THREE.Quaternion();
            this.scale = new THREE.Vector3();
        };

        InstancingBufferElement.prototype.initGuiBufferElement = function(guiBuffers) {
            this.guiBuffers = guiBuffers;
            this.index = this.guiBuffers.getAvailableIndex();
            this.guiBuffers.registerElement(this);
            this.endTime = 0;
            // negative r inverts lut gradient direction
            this.rgba =     {r:1, g:1, b:1, a:1};
            this.pos =      {x:1, y:1, z:-1};
            this.initScale =    {x:1, y:1, z:1};
            this.quat =     {x:0, y:0, z:0, w:1};
            this.sprite =   {x:7, y:0, z:0.06, w:0.06};// z for nineslice expand y, w for expand x (axis x for width 2d)

            this.lifecycle = {x:0, y:0.3, z:0, w:0.45}; // x = startTime, y = attackTime, z = endTime, w = decayTime

            // x:lutColor, y:lutAlpha
            this.texelRowSelect = {x:105, y:42, z:42, w:42}; // 42 = fullWhite;

            this.setDefaultBuffers();

        };

        InstancingBufferElement.prototype.setAttackTime = function(time) {
            this.lifecycle.y = time;
        };

        InstancingBufferElement.prototype.setEndTime = function(time) {
            this.lifecycle.z = time;
        };

        InstancingBufferElement.prototype.setReleaseTime = function(time) {
            this.lifecycle.w = time;
        };

        InstancingBufferElement.prototype.setLutColor = function(value) {
            this.texelRowSelect.x = value;
        };

        InstancingBufferElement.prototype.setIndex = function(index) {
            this.index = index;
        };

        InstancingBufferElement.prototype.setAttribX = function(name, index, x) {

        };

        InstancingBufferElement.prototype.setTileXY = function(xy) {
            this.sprite.x = xy.x;
            this.sprite.y = xy.y;
            this.setSprite(this.sprite);
        };

        InstancingBufferElement.prototype.setSprite = function(xyzw) {
            this.guiBuffers.setAttribXYZW('sprite', this.index, xyzw.x, xyzw.y, xyzw.z, xyzw.w)
        };

        InstancingBufferElement.prototype.setPositionVec3 = function(vec3) {
            this.position.copy(vec3);
            this.guiBuffers.setAttribXYZ('offset', this.index, vec3.x, vec3.y, vec3.z)
        };

        InstancingBufferElement.prototype.setScaleVec3 = function(vec3) {
            this.scale.copy(vec3);
            this.guiBuffers.setAttribXYZ('scale3d', this.index, vec3.x, vec3.y, vec3.z)
        };

        InstancingBufferElement.prototype.setQuat = function(q) {
            this.quaternion.copy(q);
            this.guiBuffers.setAttribXYZW('orientation', this.index, q.x, q.y, q.z, q.w)
        };

        InstancingBufferElement.prototype.setColorRGBA = function(color) {
            this.guiBuffers.setAttribXYZW('vertexColor', this.index, color.r, color.g, color.b, color.a)
        };


        InstancingBufferElement.prototype.applyDataTexture = function() {
            this.guiBuffers.setAttribXYZW('texelRowSelect',
                this.index,
                this.texelRowSelect.x,
                this.texelRowSelect.y,
                this.texelRowSelect.z,
                this.texelRowSelect.w
            )
        };

        InstancingBufferElement.prototype.applyLifecycle = function() {
            this.guiBuffers.setAttribXYZW('lifecycle',
                this.index,
                this.lifecycle.x,
                this.lifecycle.y,
                this.lifecycle.z,
                this.lifecycle.w
            );
        };

        InstancingBufferElement.prototype.applyDuration = function(duration) {
           this.endTime = duration + this.guiBuffers.getSystemTime();
        };

        InstancingBufferElement.prototype.startLifecycleNow = function() {
            this.lifecycle.x = this.guiBuffers.getSystemTime();
            this.lifecycle.z = this.endTime;
            this.applyLifecycle();
        };

        InstancingBufferElement.prototype.endLifecycleNow = function() {
            this.lifecycle.z = this.guiBuffers.getSystemTime();
            this.applyLifecycle();
        };

        InstancingBufferElement.prototype.setDefaultBuffers = function() {
            this.setPositionVec3(this.pos);
            this.setScaleVec3(this.initScale);
            this.setQuat(this.quat);
            this.setColorRGBA(this.rgba);
            this.setSprite(this.sprite);
            this.lifecycle.x = this.guiBuffers.getSystemTime();
            this.applyLifecycle();
            this.applyDataTexture();
        };


        InstancingBufferElement.prototype.lookAtVec3 = function(vec3) {
            tempObj.position.set(0, 0, 0);
            tempObj.lookAt(vec3);
            this.setQuat(tempObj.quaternion);
        };

        InstancingBufferElement.prototype.scaleUniform = function(scale) {
            this.guiBuffers.setAttribXYZ('scale3d', this.index, scale, scale, scale)
        };

        InstancingBufferElement.prototype.releaseElement = function() {
            this.guiBuffers.setElementReleased(this);
        };

        InstancingBufferElement.prototype.testLifetimeIsOver = function(systemTime) {

            if ((this.lifecycle.z + this.lifecycle.w) < systemTime) {
                return true;
            }

        };


        return InstancingBufferElement;

    });