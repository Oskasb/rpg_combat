import { Vector3 } from "../../../libs/three/math/Vector3.js";
let tempVec3 = new Vector3()
let tempVec3b = new Vector3()

function getNearestCharacter(sourceSpatial, charList) {
    let fromPos = tempVec3;
    let enemyPos = tempVec3b;
    sourceSpatial.getSpatialPosition(fromPos);
    let nearestSelected = null;
    let nearestDistance = 9999;
    for (let i = 0; i < charList.length; i++) {
        charList[i].gamePiece.getSpatial().getSpatialPosition(enemyPos);
        enemyPos.sub(fromPos);
        let distance = enemyPos.length();
        if (distance < nearestDistance) {
            nearestSelected = charList[i];
            nearestDistance = distance;
        }
    }
    return nearestSelected;
}

function getCharactersInRange(storeList, gamePiece, charList, maxDistance) {
    let fromPos = tempVec3;
    let enemyPos = tempVec3b;
    gamePiece.getSpatial().getSpatialPosition(fromPos);
    for (let i = 0; i < charList.length; i++) {
        charList[i].gamePiece.getSpatial().getSpatialPosition(enemyPos);
        enemyPos.sub(fromPos);
        let distance = enemyPos.length();
        if (distance < maxDistance) {
            if (gamePiece.getStatusByKey('faction') !== charList[i].gamePiece.getStatusByKey('faction')) {
                storeList.push(charList[i]);
            }
        }
    }

}

export {
    getNearestCharacter,
    getCharactersInRange
}