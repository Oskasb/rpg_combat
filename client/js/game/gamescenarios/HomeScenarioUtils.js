

class HomeScenarioUtils {
    constructor() {
        this.items = [];
        this.boxes = [];
        this.instances = [];
    }

    buildStronghold(assetId) {
        ThreeAPI.tempObj.quaternion.x = 0;
        ThreeAPI.tempObj.quaternion.y = 1;
        ThreeAPI.tempObj.quaternion.z = 0;
        ThreeAPI.tempObj.quaternion.w = 0;
        ThreeAPI.tempObj.rotateY(3.3);


        let houseReturns = function(instance) {
            instance.setActive(ENUMS.InstanceState.ACTIVE_VISIBLE);
            instance.spatial.setPosXYZ(-1, 0, 6);
            instance.spatial.setScaleXYZ(0.0025, 0.0025, 0.0025);
            instance.spatial.setQuatXYZW(
                ThreeAPI.tempObj.quaternion.x,
                ThreeAPI.tempObj.quaternion.y,
                ThreeAPI.tempObj.quaternion.z,
                ThreeAPI.tempObj.quaternion.w
            );

            this.instances.push(instance);

        }.bind(this);

        let houseLoaded = function(asset) {
            //    console.log("House loaded", asset)
            client.dynamicMain.requestAssetInstance(assetId, houseReturns)
        };

        client.dynamicMain.requestAsset(assetId, houseLoaded);
    }

    buildForest() {

        ThreeAPI.tempObj.rotateX(-1.7);

        let count = 0;
        let scaleDown = 1;

        let instanceReturns = function(instance) {
            count++
            //     console.log(instance)
            let offsetValue = count;
            offsetValue += (count*0.7); // 0.01;
            let offsetScale = scaleDown*(Math.sin(offsetValue*5)+0.5)*0.1 + 0.2;

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
                Math.sin(1.0 * offsetValue) *  (8 +  count * (Math.sin(offsetValue*0.015)+1) * 0.2),
                Math.sin(1.0 + offsetValue) *  0.4*0.6,
                Math.cos(1.0 * offsetValue) *  (8 +  count * (Math.cos(offsetValue*0.015)+1) * 0.2) + 3
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
        scaleDown = 0.1;
        for (let i = 0; i < 2; i++) {
            client.dynamicMain.requestAssetInstance('asset_tree_5', instanceReturns)
        }
        scaleDown = 1;
        for (let i = 0; i < 10; i++) {
            for (let j = 0; j < assets.length; j++) {
                client.dynamicMain.requestAssetInstance(assets[j], instanceReturns)
            }
        }

        count = 0;
    }

    buildGround(maxBoxes, boxSize) {
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
            "marsh"
        ];

        let iconSprites = GuiAPI.getUiSprites("box_tiles_8x8");

        let count = 0;
        let boxReturns = function(instance) {
            count++;

            instance.setActive(ENUMS.InstanceState.ACTIVE_VISIBLE);
            MATH.gridXYfromCountAndIndex(maxBoxes, count, ThreeAPI.tempVec3);

            instance.spatial.setPosXYZ(2*boxSize*ThreeAPI.tempVec3.x, -boxSize, 2*boxSize*ThreeAPI.tempVec3.y);

            let spriteSelect = Math.floor(MATH.sillyRandom(count)*iconKeysNice.length)
            let iconSprite = iconSprites[iconKeysNice[spriteSelect]];
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
            box.setSprite(iconSprites['marsh']);
            this.instances.push(box);
        }.bind(this);

        client.dynamicMain.requestAssetInstance('asset_box', groundReturns)

    }

    exitScenarioUtils() {
        let instances = this.instances;
        while (instances.length) {
            let instance = instances.pop();
            instance.decommissionInstancedModel();
        }
        this.boxes = [];
        this.items = [];
    }




}

export { HomeScenarioUtils }