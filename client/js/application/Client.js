import { PipelineAPI } from '../data_pipeline/PipelineAPI.js';
import { evt } from './event/evt.js';
console.log("importing three...");
import * as THREE from '../../libs/three/Three.js';
console.log("THREE:", THREE);

class Client {

    constructor( devMode, env ) {

        const testEventCB = function(res) {
            console.log("Res:", res);
        };

        this.type = 'Client';
        this.devMode = devMode;
        this.env = env;
        this.evt = new evt(ENUMS.Event);
        this.evt.once(ENUMS.Event.TEST_EVENT, testEventCB);
        this.evt.dispatch(ENUMS.Event.TEST_EVENT, {env: env})
        this.pipelineAPI = new PipelineAPI();
    }

    initDataPipeline(pollJson, pollSvg, pollImage) {

        let onErrorCallback = function(err) {
            console.log("Data Pipeline Error:", err);
        };

        let onPipelineReadyCallback = function(msg) {
            console.log("Data Pipeline Ready:", msg)
        };

        const dataPipelineSetup = {
            "jsonConfigUrl":"client/json",
            "jsonPipe":{
                "polling":{
                    "enabled":pollJson/false,
                    "frequency":45
                }
            },
            "svgPipe":{
                "polling":{
                    "enabled":pollSvg/false,
                    "frequency":2
                }
            },
            "imagePipe":{
                "polling":{
                    "enabled":pollImage/false,
                    "frequency":1
                }
            }
        };

        const jsonRegUrl = 'client/json/config_urls.json';

        this.pipelineAPI.dataPipelineSetup(jsonRegUrl, dataPipelineSetup, onPipelineReadyCallback, onErrorCallback);
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


        const onFrameReadyCallback= function(response) {
           cube.rotation.x += 0.01;
           cube.rotation.y += 0.01;
           cube.rotation.z = Math.sin(response.z)*3.14;
            //     cube.rotation.z += response.z;
        //    console.log("onFrameReadyCallback:",response);
        };

        client.evt.on(ENUMS.Event.FRAME_READY, onFrameReadyCallback);

        let spin = {z:0.0};

        function animate() {
            requestAnimationFrame( animate );
            spin.z += 0.02;
            client.evt.dispatch(ENUMS.Event.FRAME_READY, spin);

            renderer.render( scene, camera )
        }

        animate();

    }

}

export { Client };
