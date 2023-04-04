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
function positionPlayer(config) {
    let targetPos = ThreeAPI.tempVec3;
    let pos = config['pos'];
    let rot = config['rot'];
    let player = GameAPI.getActivePlayerCharacter().getCharacterPiece();

    let maxAllowedTravelDistance = 10;
    let travelTimeMax = 3;

    let playerMovement = player.getPieceMovement();
    let spatial = player.getSpatial();
    let sourcePos = ThreeAPI.tempVec3b;
        spatial.getSpatialPosition(sourcePos)
    MATH.vec3FromArray(targetPos, pos);

    sourcePos.sub(targetPos);
    let travelDistance = sourcePos.lengthSq();
    if (travelDistance > maxAllowedTravelDistance) {
        sourcePos.normalize();
        sourcePos.multiplyScalar( maxAllowedTravelDistance );
    } else {
        travelTimeMax = travelTimeMax/(maxAllowedTravelDistance / travelDistance)
    }


    sourcePos.add(targetPos);
    let arriveCallback = function() {
        spatial.setRotXYZ(rot[0], rot[1], rot[2])
    }

    playerMovement.moveToTargetAtTime('walk', sourcePos, targetPos, travelTimeMax, arriveCallback)

}
function setupBoxGrid(instances, boxGrid) {

    let iconSprites = GuiAPI.getUiSprites("box_tiles_8x8");
    let iconKeys = boxGrid['grid_tiles'];
    let boxSize = boxGrid['box_size']
    let gridWidth = boxGrid['grid_width']
    let gridDepth = boxGrid['grid_depth']
    let wallHeight = boxGrid['wall_height']

    let offset = boxSize*gridWidth;

    for (let i = 0; i < gridWidth; i++) {

        for (let j = 0; j < gridDepth; j++) {

            let wallOffsetX = 0;
            let wallOffsetY = 0;
            let floorOffset = 0;

            let iconSprite = iconSprites[iconKeys[Math.floor(MATH.sillyRandom(Math.sin(i*j))*iconKeys.length)]];

            let addSceneBox = function(instance) {
                instances.push(instance)
                instance.setActive(ENUMS.InstanceState.ACTIVE_VISIBLE);
                instance.spatial.setPosXYZ(
                    2*boxSize*i - offset + wallOffsetX,
                    -boxSize + floorOffset,
                    2*boxSize*j - offset + wallOffsetY
                );
                instance.spatial.setScaleXYZ(boxSize*0.02, boxSize*0.02, boxSize*0.02)
                instance.setSprite(iconSprite);
                ThreeAPI.getScene().remove(instance.spatial.obj3d)
            };

            client.dynamicMain.requestAssetInstance('asset_box', addSceneBox)

            for (let floor = 0; floor < wallHeight; floor++) {
                let add = false;

                wallOffsetX = 0;
                wallOffsetY = 0;
                floorOffset = 0;

                if (j === gridDepth-1) {
                    wallOffsetY = boxSize*2  // // - boxSize*2;
                    floorOffset = (boxSize + floor*boxSize)*2
                    client.dynamicMain.requestAssetInstance('asset_box', addSceneBox)
                }

                if (i === 0) {
                    wallOffsetX = -boxSize*2;
                    floorOffset = (boxSize + floor*boxSize)*2
                    add = true;
                }
                if (i === gridWidth-1) {
                    wallOffsetX = boxSize*2  // // - boxSize*2;
                    floorOffset = (boxSize + floor*boxSize)*2
                    add = true;
                }

                if (add) {
                    client.dynamicMain.requestAssetInstance('asset_box', addSceneBox)
                }
            }
        }
    }
}
function spawnPatch(instances, patch) {

    let assetList = patch['asset_list'];
    let count = patch['count'];
    let position = new THREE.Vector3();
    MATH.vec3FromArray(position, patch['pos']);

    let size = new THREE.Vector3();
    MATH.vec3FromArray(size, patch['size']);

    let spreadRot = patch['spread_rot'];
    let spreadScale = patch['spread_scale'];
    let clearCenter = 0;

    ThreeAPI.tempVec3b.set(size)

    let adds = 0;
    let instanceReturns = function(instance) {
        adds++
        let offsetScale = MATH.sillyRandomBetween(spreadScale[0], spreadScale[1], adds);
        let obj3d = ThreeAPI.tempObj;
        obj3d.quaternion.set(0, 0, 0, 1);
        obj3d.rotateX(-MATH.HALF_PI);
        MATH.randomRotateObj(obj3d, spreadRot, adds);

        instance.spatial.setScaleXYZ(offsetScale, offsetScale, offsetScale);
        instance.spatial.setQuatXYZW(
            obj3d.quaternion.x,
            obj3d.quaternion.y,
            obj3d.quaternion.z,
            obj3d.quaternion.w
        );

        let pos = ThreeAPI.tempVec3
        MATH.randomVector(pos);
        pos.multiply(size);
        MATH.expandVector(pos, clearCenter);
        pos.add(position);

        instance.spatial.setPosXYZ( pos.x, pos.y, pos.z);

        instance.setActive(ENUMS.InstanceState.ACTIVE_VISIBLE);
        instances.push(instance);
        ThreeAPI.getScene().remove(instance.spatial.obj3d)
    }

    for (let i = 0; i < count; i++) {
        for (let j = 0; j < assetList.length; j++) {
            client.dynamicMain.requestAssetInstance(assetList[j], instanceReturns)
        }
    }
    return instances;
}

function spawnLocation(instances, location) {

    let assetId = location['asset_id'];
    let position = new THREE.Vector3();
    MATH.vec3FromArray(position, location['pos']);

    let size = new THREE.Vector3();
    MATH.vec3FromArray(size, location['size']);

    let rot = location['rot'];
    let scale = location['scale'];

    ThreeAPI.tempVec3b.set(size)
    let instanceReturns = function(instance) {
        instance.spatial.setScaleXYZ(scale, scale, scale);
        instance.spatial.setRotXYZ( rot[0], rot[1], rot[2]);
        instance.spatial.setPosXYZ( position.x, position.y, position.z);
        instance.setActive(ENUMS.InstanceState.ACTIVE_VISIBLE);
        ThreeAPI.getScene().remove(instance.spatial.obj3d)
        instances.push(instance);
    }
    let houseLoaded = function(asset) {
        //    console.log("House loaded", asset)
        client.dynamicMain.requestAssetInstance(asset.id, instanceReturns)
    };

        client.dynamicMain.requestAsset(assetId, houseLoaded);

}

export {
    positionPlayer,
    setupBoxGrid,
    spawnPatch,
    spawnLocation
}