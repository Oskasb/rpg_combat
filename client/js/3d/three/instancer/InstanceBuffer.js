"use strict";

define([

    ],
    function(

    ) {

        var InstanceBuffer = function(verts, uvs, indices, normals) {
            this.attributes = {};
            this.buffers = {};
           this.buildGeometry(verts, uvs, indices, normals);
        };

        InstanceBuffer.prototype.buildGeometry = function(verts, uvarray, indices, normals) {

            var geometry = new THREE.InstancedBufferGeometry();

            var posBuffer   =     verts;
            var uvBuffer    =     uvarray;

            // per mesh data

            if (indices) {
                posBuffer   =      new Float32Array( verts );
                uvBuffer    =      new Float32Array( uvarray );
            } else {
                indices = [];
                for ( var i = 0; i < verts.length / 3; i ++ ) {
                    indices[ i ] = i;
                }
            }

            if (normals) {
                var normal = new THREE.BufferAttribute(normals , 3 );
                geometry.addAttribute( 'normal', normal );
            }


            var indexBuffer =   new Uint16Array( indices );
            geometry.setIndex( new THREE.BufferAttribute( indexBuffer , 1 ) );

            geometry.index.needsUpdate = true;

            var vertices = new THREE.BufferAttribute(posBuffer , 3 );
            geometry.addAttribute( 'vertexPosition', vertices );
            geometry.addAttribute( 'position', vertices );
            var uvs = new THREE.BufferAttribute( uvBuffer , 2 );
            geometry.addAttribute( 'uv', uvs );


            this.geometry = geometry;

            var mesh = new THREE.Mesh(geometry);
            mesh.matrixAutoUpdate = false;
            mesh.frustumCulled = false;
            //    mesh.scale.set(1, 1, 1);
            this.mesh = mesh;

        };

        InstanceBuffer.prototype.setRenderOrder = function(order) {
            this.mesh.renderOrder = order;
            this.mesh.needsUpdate = true;
        };

        InstanceBuffer.prototype.buildBuffer = function(dimensions, count) {
            return new Float32Array(count * dimensions);
        };

        InstanceBuffer.prototype.attachAttribute = function(buffer, name, dimensions, dynamic) {

            if (this.attributes[name]) {
                this.geometry.removeAttribute(name);
                this.buffers[name] = buffer;
            }

            var attribute = new THREE.InstancedBufferAttribute(buffer, dimensions, false).setDynamic( dynamic );
            this.geometry.addAttribute(name, attribute);
            this.attributes[name] = attribute;
        };

/*
        InstanceBuffer.prototype.attachAttribute = function(name, dimensions, count, dynamic) {
            var buffer = new Float32Array(count * dimensions);
            var attribute = new THREE.InstancedBufferAttribute(buffer, dimensions, false).setDynamic( true );
            this.geometry.addAttribute(name, attribute);
            this.attributes[name] = attribute;
        };
*/
        InstanceBuffer.prototype.buildBuffer = function(dimensions, count) {
            return new Float32Array(count * dimensions);
        };

        InstanceBuffer.prototype.setAttribXYZ = function(name, index, x, y, z) {
            this.attributes[name].setXYZ( index, x, y, z);
            this.attributes[name].needsUpdate = true;
        };

        InstanceBuffer.prototype.setAttribXYZW = function(name, index, x, y, z, w) {
            this.attributes[name].setXYZW( index, x, y, z, w);
            this.attributes[name].needsUpdate = true;
        };

        InstanceBuffer.prototype.setBufferVec3 = function(name, index, vec3) {
            this.attributes[name].setXYZ( index, vec3.x, vec3.y, vec3.z );
            this.attributes[name].needsUpdate = true;
        };

        InstanceBuffer.prototype.setBufferVec4 = function(name, index, vec4) {
            this.attributes[name].setXYZW( index, vec4.x, vec4.y, vec4.z, vec4.w );
            this.attributes[name].needsUpdate = true;
        };

        InstanceBuffer.prototype.setBufferValue = function(name, index, value) {
            this.attributes[name].setX( index, value );
            this.attributes[name].needsUpdate = true;
        };

        InstanceBuffer.prototype.setMaterial = function(material) {
            this.mesh.material = material;;
        };

        InstanceBuffer.prototype.setInstancedCount = function(count) {
            this.mesh.geometry.maxInstancedCount = count;
            this.mesh.geometry.needsUpdate = true;
        };

        InstanceBuffer.prototype.dispose = function() {
            ThreeAPI.hideModel(this.mesh);
            this.geometry.dispose();
        };


        var buffer;
        var lastIndex;
        var value;
        var drawRange;
        var instanceCount;

        InstanceBuffer.prototype.updateBufferStates = function(systemTime) {

            this.setSystemTime(systemTime);

            for (var key in this.buffers) {
                buffer = this.buffers[key];
                lastIndex = buffer.length -1;

                if (key === 'offset') {
                    drawRange = buffer[lastIndex-2];
                }

                if (buffer[lastIndex]) {
                    buffer[lastIndex] = 0;
                    this.attributes[key].needsUpdate = true;
                }
            }

            return drawRange;
        };

        InstanceBuffer.prototype.setSystemTime = function(systemTime) {
            buffer = this.buffers['offset'];
            buffer[buffer.length - 2] = systemTime;
        };



        InstanceBuffer.prototype.removeFromScene = function() {
            ThreeAPI.hideModel(this.mesh);
        };

        InstanceBuffer.prototype.addToScene = function(screenSpace) {
            if (screenSpace) {

                var offset = new THREE.Object3D();
                offset.position.z = -1;
                offset.add(this.mesh);
                ThreeAPI.attachObjectToCamera(offset);

            } else {
                ThreeAPI.showModel(this.mesh);
            }
        };


        InstanceBuffer.extractFirstMeshGeometry = function(child, buffers) {

            var geometry;

            child.traverse(function(node) {
                if (node.type === 'Mesh') {
                    geometry = node.geometry;
                    buffers.verts   = geometry.attributes.position.array;
                    buffers.normals = geometry.attributes.normal.array;
                    buffers.uvs     = geometry.attributes.uv.array;
                    buffers.indices = geometry.index.array;
                }
            });

        };

        return InstanceBuffer;

    });