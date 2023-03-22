import { PipelineAPI } from '../data_pipeline/PipelineAPI.js';
import { evt } from './event/evt.js';
import { GameScreen } from './ui/GameScreen.js';
import { PointerCursor } from './ui/input/PointerCursor.js';
import { Setup } from './setup/Setup.js';
import * as THREE from '../../libs/three/Three.js';
import { ThreeController } from '../3d/ThreeController.js';
import { DynamicMain } from '../3d/DynamicMain.js';

class Client {

    constructor( devMode, env ) {
        window.THREE = THREE;
        this.type = 'Client';
        this.devMode = devMode;
        this.env = env;
        this.evt = new evt(ENUMS.Event);
        window.evt = this.evt;
        this.threeController = new ThreeController();
        this.pipelineAPI = new PipelineAPI();
        this.gameScreen = new GameScreen();
        this.dynamicMain = new DynamicMain();
        window.GameScreen = this.gameScreen;
        this.setup = new Setup();
        this.INPUT_STATE = null;
    }

    activateGui() {
        client.createScene();
    }

    initUiSystem() {

        this.threeController.setupThreeRenderer();
        this.pointerCursor = new PointerCursor(this.pipelineAPI, this.gameScreen);
        this.INPUT_STATE =  this.pointerCursor.getInputState();
        //     console.log(this.INPUT_STATE);

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

        client.treeInstances = [];

        client.particleEffects = [];

        let instanceReturns = function(instance) {
            //     console.log(instance)
            instance.setActive(ENUMS.InstanceState.ACTIVE_VISIBLE)
            instance.spatial.setScaleXYZ(0.2, 0.2, 0.2)
            instance.spatial.obj3d.rotateX(-1.7);
            instance.spatial.setQuatXYZW(
                instance.spatial.obj3d.quaternion.x,
                instance.spatial.obj3d.quaternion.y,
                instance.spatial.obj3d.quaternion.z,
                instance.spatial.obj3d.quaternion.w
            );
            client.treeInstances.push(instance);
        };

        let assets = client.dynamicMain.assets;

        for (let key in assets) {
            //   console.log("inst:", assets)
            for (let i = 0; i < 20; i++) {
                client.dynamicMain.requestAssetInstance(key, instanceReturns)
                //    client.dynamicMain.requestAssetInstance('asset_tree_2', instanceReturns)
                //    client.dynamicMain.requestAssetInstance('asset_tree_3', instanceReturns)
            }

        }

        client.gameEffects = [];

        let callback = function() {
            setTimeout(function() {
                client.setup.initDefaultUi();
            }, 250)
        };

        setTimeout(function() {
            client.setup.initUiSetup(callback);
        }, 50);


        //   GuiAPI.printDebugText("DEBUG TEXT")
        //     console.log("THREE:", THREE);
        const clock = new THREE.Clock(true);

        const scene = ThreeAPI.getScene();

        //    const camera = ThreeAPI.getCamera();
        const renderer = ThreeAPI.getRenderer();

        //    const scene = new THREE.Scene();

        const camera = ThreeAPI.getCamera();
        //    const renderer = new THREE.WebGLRenderer();
        renderer.setSize( window.innerWidth, window.innerHeight );
        document.body.appendChild( renderer.domElement );



        const geometry = new THREE.BoxGeometry( 1, 1, 1 );
        const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
        const cube = new THREE.Mesh( geometry, material );
        scene.add( cube );
        /*
                ThreeAPI.setCameraPos(0, 2, 5)

                ThreeAPI.cameraLookAt(0, 0, 0)
        */
        let touchCubes = [];

        for (let i = 0; i < client.INPUT_STATE.touches.length;i++) {
            touchCubes[i] = new THREE.Mesh( geometry, material );
            touchCubes[i].position.x = (Math.random()-0.5)*20;
            touchCubes[i].position.z = (Math.random()-0.5)*20;
            scene.add(touchCubes[i])
        }

        const onFrameReadyCallback= function(frame) {

            GuiAPI.updateGui(frame.tpf, frame.elapsedTime)
            InstanceAPI.updateInstances(frame.tpf)
            ThreeAPI.getEnvironment().tickEnvironment(frame.tpf);

            ThreeAPI.applyDynamicGlobalUniforms();

            ThreeAPI.setCameraPos(Math.sin(frame.elapsedTime*0.02)*30, 10 + Math.sin(frame.elapsedTime*0.7)*7, Math.cos(frame.elapsedTime*0.02)*30);
            ThreeAPI.cameraLookAt(0, 0, 0);
            ThreeAPI.updateCamera();
            ThreeAPI.updateAnimationMixers(frame.tpf);
            ThreeAPI.updateSceneMatrixWorld(frame.tpf);
            client.dynamicMain.tickDynamicMain(frame.tpf, frame.elapsedTime);
            /*
*/


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

            for (let i = 0; i < client.treeInstances.length;i++) {
                client.treeInstances[i].spatial.setPosXYZ(
                    Math.sin(0.01*frame.z+i)*(0.4+i*0.3),
                    Math.sin(0.4*frame.z*2+i)*1,
                    Math.cos(0.01*frame.z+i)*(0.4+i*0.3)
                )
            }

            if (client.gameEffects.length > 10) {
                let effect = client.gameEffects.shift();
                effect.recoverEffectOfClass();
            }

            for (let i = 0; i < client.gameEffects.length;i++) {

            }

            let effectCb = function(eftc) {
                //     console.log("effect add: ", effect)
                eftc.activateEffectFromConfigId()
                //    client.gameEffects.push(effect);
                eftc.pos.x = Math.sin(2.61*frame.z)*(20);
                eftc.pos.y =Math.sin(0.4*frame.z*5);
                eftc.pos.z =Math.cos(2.61*frame.z)*(20);
                eftc.setEffectPosition(eftc.pos)
            };

            if (Math.random() < 0.05) {
                EffectAPI.buildEffectClassByConfigId('additive_particles_6x6', 'effect_action_point_wisp',  effectCb)
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

        function triggerFrame() {
            requestAnimationFrame( triggerFrame );
            frame.z += 0.02;
            frame.tpf = clock.getDelta();
            frame.elapsedTime = clock.elapsedTime;
            client.evt.dispatch(ENUMS.Event.FRAME_READY, frame);
            //     renderer.render(scene, camera)
            EffectAPI.updateEffectAPI(frame.elapsedTime);
            ThreeAPI.requestFrameRender(frame)
        }

        triggerFrame();

    }

}

export { Client };
