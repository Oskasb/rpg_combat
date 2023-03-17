import { PipelineAPI } from '../data_pipeline/PipelineAPI.js';
import { evt } from './event/evt.js';
import { GameScreen } from './ui/GameScreen.js';
import { PointerCursor } from './ui/input/PointerCursor.js';
import { Setup } from './setup/Setup.js';
import * as THREE from '../../libs/three/three.module.js';
import { ThreeController } from '../3D/ThreeController.js';

class Client {

    constructor( devMode, env ) {
        window.THREE = THREE;
        this.type = 'Client';
        this.devMode = devMode;
        this.env = env;
        this.evt = new evt(ENUMS.Event);
        this.threeController = new ThreeController();
        this.pipelineAPI = new PipelineAPI();
        this.gameScreen = new GameScreen();
        window.GameScreen = this.gameScreen;
        this.setup = new Setup();
        this.INPUT_STATE = null;
    }

    initUiSystem() {
        this.threeController.setupThreeRenderer();
        this.pointerCursor = new PointerCursor(this.pipelineAPI, this.gameScreen);
        this.INPUT_STATE =  this.pointerCursor.getInputState();
        console.log(this.INPUT_STATE);
            client.createScene();
    }

    initClientSetup(dataPipelineOptions) {
        this.gameScreen.registerAppContainer(document.body);
        let pipeWorkersReadyCB = function() {
            client.setup.initConfigCache(client.pipelineAPI, dataPipelineOptions);
            client.initUiSystem();
        };

        this.setup.initDataPipeline(this.pipelineAPI, pipeWorkersReadyCB)
        this.setup.initGlobalAPIs(this.pipelineAPI);
    };

    createScene() {
        console.log("THREE:", THREE);
        const clock = new THREE.Clock(true);
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

        let touchCubes = [];

        for (let i = 0; i < client.INPUT_STATE.touches.length;i++) {
            touchCubes[i] = new THREE.Mesh( geometry, material );
            scene.add(touchCubes[i])
        }

        const onFrameReadyCallback= function(frame) {
            if (client.INPUT_STATE.mouse.action[0]) {
                cube.position.x = client.INPUT_STATE.mouse.dx*3
                cube.position.y = -client.INPUT_STATE.mouse.dy*3
            //    console.log(client.INPUT_STATE.mouse.dx)
            }
            for (let i = 0; i < client.INPUT_STATE.touches.length;i++) {

                if (client.INPUT_STATE.touches[i].action[0]) {
                    touchCubes[i].position.x = client.INPUT_STATE.touches[i].dx*3
                    touchCubes[i].position.y = -client.INPUT_STATE.touches[i].dy*3
                    //   console.log(client.INPUT_STATE.touches[0].dx)
                }

            }


           cube.rotation.x += 0.01;
           cube.rotation.y += 0.01;
           cube.rotation.z = Math.sin(frame.z)*3.14;
           client.pipelineAPI.tickPipelineAPI(frame.tpf)
            //     cube.rotation.z += response.z;
        //    console.log("onFrameReadyCallback:",response);
        };

        client.evt.on(ENUMS.Event.FRAME_READY, onFrameReadyCallback);

        let frame = {
            tpf:clock.getDelta(),
            elapsedTime:clock.elapsedTime,
            z:0.0
        };

        function animate() {
            requestAnimationFrame( animate );
            frame.z += 0.02;
            frame.tpf = clock.getDelta();
            client.evt.dispatch(ENUMS.Event.FRAME_READY, frame);

            renderer.render( scene, camera )
        }

        animate();

    }

}

export { Client };