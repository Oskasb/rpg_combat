class ScenarioStatic {
    constructor(eArgs) {
        this.tempObj = new THREE.Object3D();
        this.scenarioId = eArgs.scenarioStaticId || 'scenario_static_id_default'
        this.instances = [];
        this.boxes = [];
    }


    initStaticScenario() {
        if (this.scenarioId === 'scenario_static_id_default') {
            this.initDummyScenario()
        }
    }

    initDummyScenario() {
    //    this.instances = [];
        this.effects = [];

        client.treeInstances = [];
        client.particleEffects = [];

        this.tempObj.rotateX(-1.7);

        let count = 0;

        let instanceReturns = function(instance) {
            count++
            //     console.log(instance)
            this.tempObj.rotateZ(Math.random()*4);
            instance.decomissioned = false;
            instance.setActive(ENUMS.InstanceState.ACTIVE_VISIBLE)
            instance.spatial.setScaleXYZ(0.2, 0.2, 0.2)
            instance.spatial.setQuatXYZW(
                this.tempObj.quaternion.x,
                this.tempObj.quaternion.y,
                this.tempObj.quaternion.z,
                this.tempObj.quaternion.w
            );

            instance.spatial.setPosXYZ(
                Math.sin(0.21*count*7)*(13+count*Math.random()*0.8),
                Math.sin(0.8+count)*0.4*0.6,
                Math.cos(0.21*count*7)*(13+count*Math.random()*0.8)
                )

            this.instances.push(instance);
        }.bind(this);

        let assets = [
            "asset_tree_3",
            "asset_tree_2",
            "asset_tree_4",
            "asset_tree_1"
        ];

            //   console.log("inst:", assets)
            for (let i = 0; i < 40; i++) {
                for (let j = 0; j < assets.length; j++) {
                    client.dynamicMain.requestAssetInstance(assets[j], instanceReturns)
                }
            }

        for (let i = 0; i < 40; i++) {
                client.dynamicMain.requestAssetInstance('asset_tree_5', instanceReturns)
        }


        count = 0;
        let boxSize = 4;
        let maxBoxes = 1048;
        let boxReturns = function(instance) {
            count++;
            //    console.log("Add boxes", instance)
            instance.setActive(ENUMS.InstanceState.ACTIVE_VISIBLE);

            let y = Math.floor(count / Math.sqrt(maxBoxes)) - Math.sqrt(maxBoxes)*0.5;
            let x = count % Math.sqrt(maxBoxes) - Math.sqrt(maxBoxes)*0.5;

            instance.spatial.setPosXYZ(2*boxSize*x, -boxSize, 2*boxSize*y);

            instance.setAttributev4('sprite', {x:2, y:1, z:1, w:1});

            setTimeout(function() {
                instance.spatial.setScaleXYZ(boxSize*0.02, boxSize*0.02, boxSize*0.02)
            }, 20)

            this.instances.push(instance);

            this.boxes.push(instance);
        }.bind(this);

        //    let loadCallback = function(asset) {
        //     console.log("Box ", asset);
        for (let i = 0; i < maxBoxes; i++) {
            client.dynamicMain.requestAssetInstance('asset_box', boxReturns)
        }
    //    };

    //    let loadCB = function() {
   //         client.dynamicMain.requestAsset('asset_box', loadCallback)
   //     };

    //    ThreeAPI.loadThreeAsset('FILES_GLB_', 'file_box', loadCB)

    }

    updateDummyScenario(tpf ,scenarioTime ) {

        let effectCb = function(eftc) {
            //     console.log("effect add: ", effect)
            eftc.activateEffectFromConfigId()
            //    client.gameEffects.push(effect);
            eftc.pos.x = Math.sin(2.61*scenarioTime)*(50)*Math.random();
            eftc.pos.y = Math.sin(0.4 *scenarioTime * 35)*Math.random();
            eftc.pos.z = Math.cos(2.61*scenarioTime)*(50)*Math.random();
            eftc.setEffectPosition(eftc.pos)
        };

        if (Math.random() < 0.15) {
            EffectAPI.buildEffectClassByConfigId('additive_particles_6x6', 'effect_action_point_wisp',  effectCb)
        }

        for (let i = 0; i < this.boxes.length; i++) {
        //    let y = 2*Math.floor(i / Math.sqrt(this.boxes.length))
        //    let x = 2* i % Math.sqrt(this.boxes.length);

       //     this.boxes[i].spatial.setScaleXYZ(0.02, 0.02, 0.02);
        }

    }

    updateStaticScenario(tpf, scenarioTime) {

        if (this.scenarioId === 'scenario_static_id_default') {
            this.updateDummyScenario(tpf, scenarioTime)
        }

    }

    exitStaticScenario(eArgs) {
        let instances = this.instances
        while (instances.length) {
            let instance = instances.pop();
            instance.decommissionInstancedModel();
        }

    }

    tickStaticScenario(tpf, scenarioTime) {
        this.updateStaticScenario(tpf, scenarioTime)
    }

}

export { ScenarioStatic }