import * as THREE from '../../libs/three/Three.js';
console.log(THREE)

class Client {



    constructor( devMode, env, events ) {

        var testEvent = function(res) {
            console.log(res);
        }


        var evt = events;
        this.type = 'Client';
        this.devMode = devMode;
        this.env = env;
        this.evt = evt;
        evt.on(ENUMS.Event.TEST_EVENT, testEvent)
        evt.fire(ENUMS.Event.TEST_EVENT, {msg:"hello"})
    }

    createScene() {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

        const renderer = new THREE.WebGLRenderer();
        renderer.setSize( window.innerWidth, window.innerHeight );
        document.body.appendChild( renderer.domElement );

        const geometry = new THREE.BoxGeometry( 1, 1, 1 );
        const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
        const cube = new THREE.Mesh( geometry, material );
        scene.add( cube );

        camera.position.z = 5;

        function animate() {
            requestAnimationFrame( animate );

            cube.rotation.x += 0.01;
            cube.rotation.y += 0.01;

            renderer.render( scene, camera );
        }

        animate();
    }

}

export { Client };
