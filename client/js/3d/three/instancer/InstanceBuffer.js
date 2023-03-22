class InstanceBuffer {
    constructor(verts, uvs, indices, normals) {
        this.attributes = {};
        this.buffers = {};
        this.buildGeometry(verts, uvs, indices, normals);
    };

    buildGeometry = function(verts, uvarray, indices, normals) {

        let geometry = new THREE.InstancedBufferGeometry();
        geometry.name = 'InstanceBuffer buildGeometry'
        let posBuffer   =     verts;
        let uvBuffer    =     uvarray;

        // per mesh data

        if (indices) {
            posBuffer   =      new Float32Array( verts );
            uvBuffer    =      new Float32Array( uvarray );
        } else {
            indices = [];
            for ( let i = 0; i < verts.length / 3; i ++ ) {
                indices[ i ] = i;
            }
        }

        if (normals) {
            let normal = new THREE.BufferAttribute(normals , 3 );
            geometry.setAttribute( 'normal', normal );
        }


        let indexBuffer =   new Uint16Array( indices );
        geometry.setIndex( new THREE.BufferAttribute( indexBuffer , 1 ) );

        geometry.index.needsUpdate = true;

        let vertices = new THREE.BufferAttribute(posBuffer , 3 );
        geometry.setAttribute( 'vertexPosition', vertices );
        geometry.setAttribute( 'position', vertices );
        let uvs = new THREE.BufferAttribute( uvBuffer , 2 );
        geometry.setAttribute( 'uv', uvs );


        this.geometry = geometry;

        let mesh = new THREE.Mesh(geometry);
        mesh.matrixAutoUpdate = false;
        mesh.frustumCulled = false;
        //    mesh.scale.set(1, 1, 1);
        this.mesh = mesh;

    };

    setRenderOrder = function(order) {
        this.mesh.renderOrder = order;
        this.mesh.needsUpdate = true;
    };

    buildBuffer = function(dimensions, count) {
        return new Float32Array(count * dimensions);
    };

    attachAttribute = function(buffer, name, dimensions, dynamic) {

        if (this.attributes[name]) {
        //    this.geometry.removeAttribute(name);
            this.buffers[name] = buffer;
        }

        let attribute = new THREE.InstancedBufferAttribute(buffer, dimensions, false)
        if (dynamic) {
            console.log('setDynamic expected, not supported so fix..')
            attribute.setDynamic( dynamic );
        }

        this.geometry.setAttribute(name, attribute);
        this.attributes[name] = attribute;
    };

    /*
            attachAttribute = function(name, dimensions, count, dynamic) {
                var buffer = new Float32Array(count * dimensions);
                var attribute = new THREE.InstancedBufferAttribute(buffer, dimensions, false).setDynamic( true );
                this.geometry.addAttribute(name, attribute);
                this.attributes[name] = attribute;
            };
    */
    buildBuffer = function(dimensions, count) {
        return new Float32Array(count * dimensions);
    };

    setAttribXYZ = function(name, index, x, y, z) {
        this.attributes[name].setXYZ( index, x, y, z);
        this.attributes[name].needsUpdate = true;
    };

    setAttribXYZW = function(name, index, x, y, z, w) {
        this.attributes[name].setXYZW( index, x, y, z, w);
        this.attributes[name].needsUpdate = true;
    };

    setBufferVec3 = function(name, index, vec3) {
        this.attributes[name].setXYZ( index, vec3.x, vec3.y, vec3.z );
        this.attributes[name].needsUpdate = true;
    };

    setBufferVec4 = function(name, index, vec4) {
        this.attributes[name].setXYZW( index, vec4.x, vec4.y, vec4.z, vec4.w );
        this.attributes[name].needsUpdate = true;
    };

    setBufferValue = function(name, index, value) {
        this.attributes[name].setX( index, value );
        this.attributes[name].needsUpdate = true;
    };

    setMaterial = function(material) {
        this.mesh.material = material;;
    };

    setDrawRange = function(count) {
        this.mesh.geometry.drawRange.count = count;
        this.mesh.geometry.needsUpdate = true;
    };

    getDrawRange = function() {
        return this.mesh.geometry.drawRange.count;
    };

    setInstancedCount = function(count) {
        if (count) {
        //    console.log("Set draw range: ", count);
        }
        this.mesh.geometry.maxInstancedCount = count;
        this.mesh.geometry.needsUpdate = true;
    };

    getInstancedCount = function() {
        return this.mesh.geometry.maxInstancedCount;
    };

    dispose = function() {
        ThreeAPI.hideModel(this.mesh);
        this.geometry.dispose();
    };

    updateBufferStates = function(systemTime) {


        this.setSystemTime(systemTime);

        for (let key in this.buffers) {
        //    let buffer = this.buffers[key];
        //    let lastIndex = buffer.length -1;

        //    if (key === 'offset') {
             //       drawRange = buffer[lastIndex-2];
             //   this.setDrawRange(this.drawRange)
        //    }

         //   if (buffer[lastIndex]) {
         //       buffer[lastIndex] = 0;
                this.attributes[key].needsUpdate = true;
         //   }
        }

        return this.getInstancedCount();
    };

    setSystemTime = function(systemTime) {
        this.systemTime = systemTime;
    };

    removeFromScene = function() {
        ThreeAPI.hideModel(this.mesh);
    };

    addToScene = function(screenSpace) {
        if (screenSpace) {

            let offset = new THREE.Object3D();
            offset.position.z = -1;
            offset.add(this.mesh);

            console.log("Screen Space MEsh:", this.mesh.geometry.drawRange.count, this.mesh);

            ThreeAPI.attachObjectToCamera(offset);

        } else {
            ThreeAPI.showModel(this.mesh);
        }
    };



}

export { InstanceBuffer }