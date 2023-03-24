class ScenarioStatic {
    constructor(eArgs) {
        this.tempObj = new THREE.Object3D();
        this.scenarioId = eArgs.scenarioStaticId || 'scenario_static_id_default'
        this.instances = [];
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

        let instanceReturns = function(instance) {
            //     console.log(instance)
            instance.decomissioned = false;
            instance.setActive(ENUMS.InstanceState.ACTIVE_VISIBLE)
            instance.spatial.setScaleXYZ(0.2, 0.2, 0.2)
            instance.spatial.setQuatXYZW(
                this.tempObj.quaternion.x,
                this.tempObj.quaternion.y,
                this.tempObj.quaternion.z,
                this.tempObj.quaternion.w
            );
            this.instances.push(instance);
        }.bind(this);

        let assets = client.dynamicMain.assets;

        for (let key in assets) {
            //   console.log("inst:", assets)
            for (let i = 0; i < 20; i++) {
                client.dynamicMain.requestAssetInstance(key, instanceReturns)
            }
        }

    }

    updateDummyScenario(tpf) {
        let instances = this.instances
        for (let i = 0; i < instances.length;i++) {
            instances[i].spatial.setPosXYZ(
                Math.sin(0.01*tpf+i)*(0.4+i*0.3),
                Math.sin(0.4 *tpf*2+i)*1,
                Math.cos(0.01*tpf+i)*(0.4+i*0.3)
            )
        }
    }

    updateStaticScenario(tpf, scenarioTime) {

        if (this.scenarioId === 'scenario_static_id_default') {
            this.updateDummyScenario(tpf)
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