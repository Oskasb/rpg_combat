
function getNearestCharacter(sourceSpatial, charList) {
    let fromPos = ThreeAPI.tempVec3;
    let enemyPos = ThreeAPI.tempVec3b;
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
    let fromPos = ThreeAPI.tempVec3;
    let enemyPos = ThreeAPI.tempVec3b;
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