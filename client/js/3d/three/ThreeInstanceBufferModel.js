class ThreeInstanceBufferModel {
    constructor(txSettings, verts, uvs, indices) {
            let uvBuffer = new Float32Array( uvs );
        let vertexBuffer = new Float32Array( verts );
        let indexBuffer = new Uint16Array( indices );
            this.buildGeometry(vertexBuffer, uvBuffer, indexBuffer);
        };

        buildGeometry = function(vertexBuffer, uvBuffer, indexBuffer) {

            let geometry = new THREE.InstancedBufferGeometry();

            // per mesh data
            let vertices = new THREE.BufferAttribute(vertexBuffer, 3 );
            geometry.setAttribute( 'vertexPosition', vertices );

            let uvs = new THREE.BufferAttribute(  uvScaled, 2 );

            geometry.setAttribute( 'uv', uvs );

            geometry.setIndex( new THREE.BufferAttribute(indexBuffer, 1 ) );

            this.geometry = geometry;

            let mesh = new THREE.Mesh(geometry);
            mesh.frustumCulled = false;
            //    mesh.scale.set(1, 1, 1);
            this.mesh = mesh;

        };

        applyMesh = function(mesh) {
            this.mesh = mesh;
        };

        dispose = function() {
            ThreeAPI.disposeModel(this.mesh);
        };

        addToScene = function() {
            ThreeAPI.addToScene(this.mesh);
        };

    })
export { ThreeInstanceBufferModel };