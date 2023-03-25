class HomeScenario {
    constructor() {
        this.instances = [];
        this.boxes = [];
    }

    initHomeScenario() {
        this.effects = [];
        evt.dispatch(ENUMS.Event.ADVANCE_ENVIRONMENT,  {envId:'high_noon', time:1});

        client.treeInstances = [];
        client.particleEffects = [];

        ThreeAPI.tempObj.rotateX(-1.7);

        let count = 0;

        let instanceReturns = function(instance) {
            count++
            //     console.log(instance)
            let offsetValue = count;
            offsetValue += (count*0.7); // 0.01;
            let offsetScale = (Math.sin(offsetValue*5)+0.5)*0.1 + 0.2;

            ThreeAPI.tempObj.rotateZ(Math.sin(count)*4);
            instance.decomissioned = false;
            instance.setActive(ENUMS.InstanceState.ACTIVE_VISIBLE);
            instance.spatial.setScaleXYZ(offsetScale, offsetScale, offsetScale);
            instance.spatial.setQuatXYZW(
                ThreeAPI.tempObj.quaternion.x,
                ThreeAPI.tempObj.quaternion.y,
                ThreeAPI.tempObj.quaternion.z,
                ThreeAPI.tempObj.quaternion.w
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
        let maxBoxes = 1024;

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
            box.spatial.setPosXYZ(0, -1, 0)
            box.spatial.setScaleXYZ(50, 0.01, 50);
            box.setSprite(iconSprites['mud']);
            this.instances.push(box);
        }.bind(this);

        client.dynamicMain.requestAssetInstance('asset_box', groundReturns)

        this.house;

        ThreeAPI.tempObj.quaternion.x = 0;
        ThreeAPI.tempObj.quaternion.y = 1;
        ThreeAPI.tempObj.quaternion.z = 0;
        ThreeAPI.tempObj.quaternion.w = 0;
        ThreeAPI.tempObj.rotateY(3.3);


        let houseReturns = function(instance) {
            this.house = instance;
            instance.setActive(ENUMS.InstanceState.ACTIVE_VISIBLE);
            instance.spatial.setPosXYZ(0, 0, 0);
            instance.spatial.setScaleXYZ(0.005, 0.005, 0.005);
            instance.spatial.setQuatXYZW(
                ThreeAPI.tempObj.quaternion.x,
                ThreeAPI.tempObj.quaternion.y,
                ThreeAPI.tempObj.quaternion.z,
                ThreeAPI.tempObj.quaternion.w
            );

            this.instances.push(instance);

        }.bind(this);

        let houseLoaded = function(asset) {
            console.log("House loaded", asset)
            client.dynamicMain.requestAssetInstance('asset_house_small', houseReturns)
        }

        client.dynamicMain.requestAsset('asset_house_small', houseLoaded)
    };

    exitScenario() {
        let instances = this.instances
        while (instances.length) {
            let instance = instances.pop();
            instance.decommissionInstancedModel();
        }
    };

    tickScenario(tpf, scenarioTime) {
        let effectCb = function(eftc) {
            //     console.log("effect add: ", effect)
            eftc.activateEffectFromConfigId()
            //    client.gameEffects.push(effect);
            eftc.pos.x = Math.sin(2.61*scenarioTime)*(20) * (Math.random()+0.2);
            eftc.pos.y = Math.sin(0.4 *scenarioTime) * 2 * Math.random() +4;
            eftc.pos.z = Math.cos(2.61*scenarioTime)*(20) * (Math.random()+0.2);
            eftc.setEffectPosition(eftc.pos)
        };

        if (Math.random() < 0.15) {
            EffectAPI.buildEffectClassByConfigId('additive_particles_6x6', 'effect_action_point_wisp',  effectCb)
        }

        ThreeAPI.setCameraPos(
            Math.cos(scenarioTime*0.2)*3+5,
            Math.sin(scenarioTime*0.4)*1+11,
            Math.sin(scenarioTime*0.2)*3-32
        );

        ThreeAPI.cameraLookAt(0, 0, 0);

    }

}

export { HomeScenario }