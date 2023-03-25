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
            let offsetValue = count;
            offsetValue += (count*0.7); // 0.01;
            let offsetScale = (Math.sin(offsetValue*5)+0.5)*0.1 + 0.2;

            this.tempObj.rotateZ(Math.sin(count)*4);
            instance.decomissioned = false;
            instance.setActive(ENUMS.InstanceState.ACTIVE_VISIBLE);
            instance.spatial.setScaleXYZ(offsetScale, offsetScale, offsetScale);
            instance.spatial.setQuatXYZW(
                this.tempObj.quaternion.x,
                this.tempObj.quaternion.y,
                this.tempObj.quaternion.z,
                this.tempObj.quaternion.w
            );


            instance.spatial.setPosXYZ(
                Math.sin(1.0 * offsetValue) *  (16 +  count * (Math.sin(offsetValue*0.015)+1) * 0.2),
                Math.sin(1.0 + offsetValue) *  0.4*0.6,
                Math.cos(1.0 * offsetValue) *  (16 +  count * (Math.cos(offsetValue*0.015)+1) * 0.2)
                );

            this.instances.push(instance);
        }.bind(this);

        let assets = [
            "asset_tree_3",
            "asset_tree_2",
            "asset_tree_4",
            "asset_tree_1"
        ];

            //   console.log("inst:", assets)
            for (let i = 0; i < 50; i++) {
                for (let j = 0; j < assets.length; j++) {
                    client.dynamicMain.requestAssetInstance(assets[j], instanceReturns)
                }
            }

        for (let i = 0; i < 40; i++) {
                client.dynamicMain.requestAssetInstance('asset_tree_5', instanceReturns)
        }

        count = 0;
        let boxSize = 2;
        let maxBoxes = 4096;
        let tempVec = this.tempVec;


        let iconKeysAll = [
            "grass",
            "mud",
            "gravel",
            "sand_pink",
            "rock",
            "marsh",
            "rock_layers",
            "rock_purple",
            "rock_stripes",
            "rock_hard",
            "rock_rusty",
            "sand",
            "rock_grey",
            "rock_blue",
            "sand_cracked"
        ];

        let iconKeysNice = [
            "grass",
            "mud",
            "gravel",
            "rock",
            "marsh",
            "rock_layers",
            "rock_stripes",
            "rock_rusty",
            "rock_grey"
        ];

        let iconSprites = GuiAPI.getUiSprites("box_tiles_8x8");


        let boxReturns = function(instance) {
            count++;

            instance.setActive(ENUMS.InstanceState.ACTIVE_VISIBLE);
            MATH.gridXYfromCountAndIndex(maxBoxes, count, ThreeAPI.tempVec3);

            instance.spatial.setPosXYZ(2*boxSize*ThreeAPI.tempVec3.x, -boxSize, 2*boxSize*ThreeAPI.tempVec3.y);

            let iconSprite = iconSprites[iconKeysNice[Math.floor(Math.random()*iconKeysNice.length)]];
            instance.setSprite(iconSprite);

            instance.spatial.setScaleXYZ(boxSize*0.02, boxSize*0.02, boxSize*0.02)

            this.instances.push(instance);

            this.boxes.push(instance);
        }.bind(this);



        for (let i = 0; i < maxBoxes; i++) {
            client.dynamicMain.requestAssetInstance('asset_box', boxReturns)
        }

        let groundReturns = function(box) {
            box.spatial.setPosXYZ(0, -2, 0)
            box.spatial.setScaleXYZ(1000, 0.01, 1000)
            this.instances.push(box);
        }.bind(this);

        client.dynamicMain.requestAssetInstance('asset_box', groundReturns)

        this.house;

        this.tempObj.quaternion.x = 0;
        this.tempObj.quaternion.y = 1;
        this.tempObj.quaternion.z = 0;
        this.tempObj.quaternion.w = 0;
        this.tempObj.rotateY(3.3);


        let houseReturns = function(instance) {
            this.house = instance;
            instance.setActive(ENUMS.InstanceState.ACTIVE_VISIBLE);
            instance.spatial.setPosXYZ(0, 0, 0);
            instance.spatial.setScaleXYZ(0.005, 0.005, 0.005);
            instance.spatial.setQuatXYZW(
                this.tempObj.quaternion.x,
                this.tempObj.quaternion.y,
                this.tempObj.quaternion.z,
                this.tempObj.quaternion.w
            );

            this.instances.push(instance);

        }.bind(this);

        let houseLoaded = function(asset) {
            console.log("House loaded", asset)
            client.dynamicMain.requestAssetInstance('asset_house_small', houseReturns)
        }

        client.dynamicMain.requestAsset('asset_house_small', houseLoaded)

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
        let iconSprites = GuiAPI.getUiSprites("box_tiles_8x8");

        let maxBoxes = this.boxes.length;
        let boxSize = 2;
        for (let i = 0; i < this.boxes.length; i++) {
            let count = i;

            let instance = this.boxes[i];
        }

    if (this.house) {
      //  this.house.spatial.setPosXYZ(0, 0.01, 0);
      //  this.house.spatial.setScaleXYZ(0.1, 0,1, 0.1);
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