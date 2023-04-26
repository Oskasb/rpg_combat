

let rgba = {
    r:1, g:1, b:1, a:1
}

function setRgba(r, g, b, a) {
    rgba.r = r;
    rgba.g = g;
    rgba.b = b;
    rgba.a = a;
    return rgba;
}

function fxLanded(fx) {
    //    console.log("Fx arrives", fx)
}

function endOnLanded(fx) {
    fx.endEffectOfClass()
}



function setupLifecycle(efct, fxDuration, onPaceFactor, decayFactor) {
    let start = GameAPI.getGameTime();
    let atk = onPaceFactor*fxDuration;
    let decay = decayFactor*fxDuration;
    let end = start+fxDuration;
    efct.setEffectLifecycle(start, atk, end, decay);
    return fxDuration+decay;
}

export {
    setupLifecycle,
    endOnLanded,
    fxLanded,
    setRgba
}