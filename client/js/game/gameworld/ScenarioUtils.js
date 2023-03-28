class ScenarioUtils {
    constructor() {

    }

    spawnPatch(assetList, count, position, size, clearCenter, spreadScale, spreadColor, spreadRotY, spreadRotZ) {

        ThreeAPI.tempVec3b.set(size)

        let instances = []
        let instanceReturns = function(instance) {
            //     console.log(instance)
            let offsetValue = count;
            offsetValue += (count*0.7); // 0.01;
            let offsetScale = (Math.sin(offsetValue*5)+0.5)*0.1 + 0.2;
            ThreeAPI.tempObj.quaternion.set(0, 0, 0, 1);
            ThreeAPI.tempObj.rotateX(-1.724);
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

            let pos = ThreeAPI.tempVec3
            MATH.randomVector(pos);
            pos.multiply(size);
            MATH.expandVector(pos, clearCenter);
            pos.add(position);

            pos.y = 0;

            instance.spatial.setPosXYZ( pos.x, pos.y, pos.z);

            instances.push(instance);
        }


        for (let i = 0; i < count; i++) {
            for (let j = 0; j < assetList.length; j++) {
                client.dynamicMain.requestAssetInstance(assetList[j], instanceReturns)
            }
        }
        return instances;
    }

}

export { ScenarioUtils }