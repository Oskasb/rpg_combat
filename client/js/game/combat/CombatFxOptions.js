import { Vector3 } from "../../../libs/three/math/Vector3.js";
import { Object3D } from "../../../libs/three/core/Object3D.js";
import * as CombatFxUtils from "./CombatFxUtils.js";

let tempVec3 = new Vector3();
let tempObj3D = new Object3D();

let opts = {};

let defaults = {
    fromPos:      new Vector3(),
    fromQuat:     new Object3D().quaternion,
    toPos:      new Vector3(),
    toQuat:      new Object3D().quaternion,
    fromSize:     1,
    toSize:     2,
    time:     1,
    callback:     endOnLanded,
    bounce:     0,
    spread:     0,
    getPosFunc: null
}
function optsDefault() {
    return defaults
}

function defaultOptions() {
    let defs = optsDefault()

    for (let key in defs) {
        opts[key] = defs[key];
    }

    return opts
}

function endOnLanded(fx) {
    fx.endEffectOfClass()
}

function setupOptsPowerHands(efct, obj3d, size) {

    let options = defaultOptions();

    let tempObj = ThreeAPI.tempObj;
    tempObj.position.copy(obj3d.position);

    //    tempObj.position.y += size*0.3
    ThreeAPI.tempVec3.copy(obj3d.scale)
    ThreeAPI.tempVec3.multiplyScalar(size*0.1);
    tempObj.lookAt(ThreeAPI.getCamera().position);
    MATH.spreadVector(tempObj.position, ThreeAPI.tempVec3)
    efct.quat.copy(tempObj.quaternion);

    tempObj.rotateZ(Math.random()*MATH.TWO_PI)

    MATH.randomVector(ThreeAPI.tempVec3);
    ThreeAPI.tempVec3.multiplyScalar(0.3)
    ThreeAPI.tempVec3.y = Math.abs(ThreeAPI.tempVec3.y);

    ThreeAPI.tempVec3.add(tempObj.position)

    tempVec3.set(size, size, size);
    MATH.randomVector(tempVec3);
    tempVec3.multiplyScalar(size)
    //     MATH.spreadVector(tempObj.position, tempVec3)

    let startSize = size*0.2;
    let endSize = size*0.8 + Math.random()*size*1.5
    let time = CombatFxUtils.setupLifecycle(efct, 0.3+Math.random()*0.3, 0.7, 0.4);

    options.fromPos = tempObj.position;
    options.fromQuat = tempObj.quaternion;
    options.toPos = ThreeAPI.tempVec3;
    options.toQuat = tempObj.quaternion;
    options.fromSize = startSize;
    options.toSize = endSize;
    options.time = time;
    options.callback = endOnLanded;
    options.bounce = 0.1;
    options.spread = 0;
    options.getPosFunc = null

    return options;
}

function setupOptsPowerCore(efct, obj3d, size) {
    let tempObj = ThreeAPI.tempObj;
    tempObj.position.copy(obj3d.position);
    tempObj.lookAt(ThreeAPI.getCamera().position);

    let startSize = size*0.6;
    let endSize = size*0.8 + Math.random()*size*0.2
    let time = CombatFxUtils.setupLifecycle(efct, 0.2, 0.1, 0.2);

    let options = defaultOptions();
    options.fromPos = tempObj.position;
    options.fromQuat = tempObj.quaternion;
    options.toPos = ThreeAPI.tempVec3;
    options.toQuat = tempObj.quaternion;
    options.fromSize = startSize;
    options.toSize = endSize;
    options.time = time;
    options.callback = endOnLanded;
    options.bounce = 0.001;
    options.spread = 0.01;
    options.getPosFunc = null

    return options;
}

function setupOptsFriendlyHands(efct, obj3d, size) {

    let options = defaultOptions();
    let tempObj = ThreeAPI.tempObj;
    tempObj.position.copy(obj3d.position);

    tempObj.lookAt(ThreeAPI.getCamera().position);

    tempObj.rotateZ(Math.random()*MATH.TWO_PI)

    MATH.randomVector(ThreeAPI.tempVec3);
    ThreeAPI.tempVec3.multiplyScalar(0.8*size)
    ThreeAPI.tempVec3.y = Math.abs(ThreeAPI.tempVec3.y);

    ThreeAPI.tempVec3.add(tempObj.position)

    let startSize = 0.1;
    let endSize = MATH.randomBetween(size*0.5, size*1.50)
    let time = CombatFxUtils.setupLifecycle(efct, 0.4+Math.random()*0.3, 0.07, 0.5);

    options.fromPos = ThreeAPI.tempVec3;
    options.fromQuat = tempObj.quaternion;
    options.toPos = obj3d.position;
    options.toQuat = tempObj.quaternion;
    options.fromSize = startSize;
    options.toSize = endSize;
    options.time = time;
    options.callback = endOnLanded;
    options.bounce = 0.3;
    options.spread = 0;
    options.getPosFunc = null

    return options;
}

function setupOptsFriendlyCore(efct, obj3d, size) {

    let tempObj = ThreeAPI.tempObj;

    MATH.randomVector(ThreeAPI.tempVec3);
    ThreeAPI.tempVec3.multiplyScalar(0.4)
    ThreeAPI.tempVec3.y = Math.abs(ThreeAPI.tempVec3.y);

    ThreeAPI.tempVec3.add(obj3d.position)
    tempObj.position.copy(obj3d.position)
    tempObj.lookAt(ThreeAPI.getCamera().position);

    let startSize = MATH.randomBetween(0.3, 0.5)*size
    let endSize = MATH.randomBetween(0.4, 0.6)*size
    let time = CombatFxUtils.setupLifecycle(efct, MATH.randomBetween(0.3, 0.7), 0.6, 0.5);

    let options = defaultOptions();
    options.fromPos = ThreeAPI.tempVec3;
    options.fromQuat = tempObj.quaternion;
    options.toPos = tempObj.position;
    options.toQuat = tempObj.quaternion;
    options.fromSize = startSize;
    options.toSize = endSize;
    options.time = time;
    options.callback = endOnLanded;
    options.bounce = 0.01;
    options.spread = 0.01;
    options.getPosFunc = null

    return options;
}



function setupOptsMagicMissile(efct, fromPos, gamePiece, index, onArriveCB, getPosFunc) {

    let distance = MATH.distanceBetween(fromPos, getPosFunc());
    let tempObj = ThreeAPI.tempObj;
    tempObj.position.copy(fromPos);
    let size = gamePiece.getStatusByKey('size');
    tempObj.lookAt(ThreeAPI.getCamera().position);
    tempVec3.copy(gamePiece.getPos());
    let startSize = 0.6;
    let endSize = 0.3 + Math.random()*0.8;
    let time = CombatFxUtils.setupLifecycle(efct, 0.12*(index+1) + 0.3*distance + 0.1, 0.3, 0.2);
    let spread = 0.02*(index)*distance + 0.02*distance + 0.2*index
    if (MATH.isOddNumber(index)) {
        spread*=-1;
    }

    let options = defaultOptions();
    options.fromPos = fromPos;
    options.fromQuat = tempObj.quaternion;
    options.toPos = gamePiece.getPos();
    options.toQuat = tempObj.quaternion;
    options.fromSize = startSize;
    options.toSize = endSize;
    options.time = time;
    options.callback = onArriveCB;
    options.bounce = (2 - Math.abs(spread))*0.1*distance
    options.spread = spread*size;
    options.getPosFunc = getPosFunc

    return options;
}

function setupOptsFireMissile(efct, fromPos, gamePiece, index, onArriveCB, getPosFunc) {
    let distance = MATH.distanceBetween(fromPos, getPosFunc());
    let tempObj = ThreeAPI.tempObj;
    tempObj.position.copy(fromPos);
    let size = gamePiece.getStatusByKey('size');
    tempVec3.copy(gamePiece.getPos());
    let startSize = 1.2;
    let endSize = 1.3 + Math.random()*0.5
    let time = CombatFxUtils.setupLifecycle(efct, 0.22*(index+1) + 0.2*distance + 0.1, 0.3, 0.3);
    let spread = 0.12*(index) + 0.12*distance
    if (MATH.isOddNumber(index)) {
        spread*=-1;
    }

    let options = defaultOptions();
    options.fromPos = fromPos;
    options.fromQuat = tempObj.quaternion;
    options.toPos = gamePiece.getPos();
    options.toQuat = tempObj.quaternion;
    options.fromSize = startSize;
    options.toSize = endSize;
    options.time = time;
    options.callback = onArriveCB;
    options.bounce = (2 - Math.abs(spread))*0.1*distance
    options.spread = spread*size;
    options.getPosFunc = getPosFunc

    return options;
}

function setupOptsFriendlyMissile(efct, fromPos, gamePiece, index, onArriveCB, getPosFunc) {
    let distance = MATH.distanceBetween(fromPos, getPosFunc());
    let tempObj = ThreeAPI.tempObj;

    let bone = gamePiece.getRandomBone();

    let bonePos = function() {
        //    let jointId = gamePiece.getRandomJointId();
        return gamePiece.getBoneWorldPosition(bone);
    }

    tempObj.position.copy(gamePiece.getBoneWorldPosition(bone));

    let size = gamePiece.getStatusByKey('size');
    tempObj.lookAt(ThreeAPI.getCamera().position);
    tempVec3.copy(gamePiece.getPos());

    let startSize = 0.6;
    let endSize = 0.3 + Math.random()*0.8;
    let time = CombatFxUtils.setupLifecycle(efct, 0.22*(index) + 0.3*distance + 0.2, 0.3, 0.2);
    let spread = 0.32*(index) + 0.1*distance
    if (MATH.isOddNumber(index)) {
        spread*=-1;
    }

    let options = defaultOptions();
    options.fromPos = fromPos;
    options.fromQuat = tempObj.quaternion;
    options.toPos = gamePiece.getPos();
    options.toQuat = tempObj.quaternion;
    options.fromSize = startSize;
    options.toSize = endSize;
    options.time = time;
    options.callback = onArriveCB;
    options.bounce = (2 - Math.abs(spread))*0.5*size;
    options.spread = spread*size;
    options.getPosFunc = bonePos

    return options;

}

export {
    setupOptsPowerHands,
    setupOptsPowerCore,
    setupOptsFriendlyHands,
    setupOptsFriendlyCore,
    setupOptsMagicMissile,
    setupOptsFireMissile,
    setupOptsFriendlyMissile

}