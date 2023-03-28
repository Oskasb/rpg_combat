

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

    buildItem(assetId, pos, rot, callback) {
        let swordReturns = function(instance) {

            instance.setActive(ENUMS.InstanceState.ACTIVE_VISIBLE);
            instance.spatial.setPosXYZ(-1.4, 0.1, 0.25);
            instance.spatial.setScaleXYZ(1, 1, 1);
            instance.spatial.setQuatXYZW(
                ThreeAPI.tempObj.quaternion.x,
                ThreeAPI.tempObj.quaternion.y,
                ThreeAPI.tempObj.quaternion.z,
                ThreeAPI.tempObj.quaternion.w
            );

            this.instances.push(instance);
            this.items.push(instance);
            callback(instance)
        }.bind(this);

        let swordLoaded = function(asset) {
            //    console.log("House loaded", asset)
            client.dynamicMain.requestAssetInstance(asset.id, swordReturns)
        };

        client.dynamicMain.requestAsset(assetId, swordLoaded)
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

    tickScenarioUtils(tpf, scenarioTime) {
        let player = GameAPI.getActivePlayerCharacter();
        if (player){
            let tempObj = ThreeAPI.tempObj;
            tempObj.quaternion.x = 0;
            tempObj.quaternion.y = 1;
            tempObj.quaternion.z = 0;
            tempObj.quaternion.w = 0;
            tempObj.rotateY(-0.86);
            player.getSpatial().setQuatXYZW(
                tempObj.quaternion.x,
                tempObj.quaternion.y,
                tempObj.quaternion.z,
                tempObj.quaternion.w
            );
            player.getSpatial().setPosXYZ(
                -1.3, 0, 0.8
            );

            if (Math.random() < 0.05) {

                if (this.items.length === 1) {


                    if (!this.items[0].attached) {
                        player.attachPieceSpatialToJoint(this.items[0].spatial, 'GRIP_R');
                        this.items[0].attached = true;
                    }
                }


                let randomAnims = [
                    'CT_ML_R',
                    'CT_MR_R',
                    'CT_TC_R',
                    'CT_TR_R',
                    //    'DEAD',
                    //    'FALL',
                    'GD_BCK_R',
                    'GD_HI_R',
                    'GD_HNG_R',
                    'GD_INS_R',
                    //    'GD_LFT_FF',  // broken
                    'GD_LNG_R',
                    'GD_LOW_R',
                    'GD_MID_R',
                    'GD_RT_FF',
                    'GD_SHT_R',
                    'GD_SID_R',
                    'IDLE',
                    //    'IDL_HI_CB',
                    //    'IDL_LO_CB',
                    //    'RUN',
                    //   'SET_LFT_FF',  // broken
                    'SET_RT_FF',
                    'SW_BCK_R',
                    'SW_SID_R',
                    //    'WALK',
                    //    'WALK_BODY',
                    //    'WALK_COMBAT'
                ];

                let count = randomAnims.length;

                let key = randomAnims[ Math.floor( scenarioTime*2) % count];

            //    GuiAPI.printDebugText("ANIM KEY: "+key);

                player.applyPieceAnimationState(key)
            }


            player.tickGamePiece(tpf, scenarioTime);
        }


        let effectCb = function(eftc) {
            //     console.log("effect add: ", effect)
            eftc.activateEffectFromConfigId()
            //    client.gameEffects.push(effect);
            eftc.pos.x = Math.sin(261*scenarioTime)*(7) + (Math.random()*3.2);
            eftc.pos.y = Math.sin(34 *scenarioTime) * 3  + 2 + Math.random() * 3;
            eftc.pos.z = Math.cos(261*scenarioTime)*(18) + (Math.random()*3.2 + 16);
            eftc.setEffectPosition(eftc.pos)
        };

        if (Math.random() < 0.15) {
            EffectAPI.buildEffectClassByConfigId('additive_particles_6x6', 'effect_action_point_wisp',  effectCb)
        }

     //   ThreeAPI.setCameraPos(
     //       Math.cos(scenarioTime*0.2)*1.2+2,
    //        Math.sin(scenarioTime*0.4)*0.5+5,
     //       Math.sin(scenarioTime*0.2)*1.2-8
     //   );

    //    ThreeAPI.cameraLookAt(0, 3, 0);





    }


}

export { HomeScenarioUtils }