import {AssetLoader} from '../../application/load/AssetLoader.js';
import {ThreeAsset} from './assets/ThreeAsset.js';
import {ThreeSetup} from './ThreeSetup.js';
import {ThreeShaderBuilder} from './ThreeShaderBuilder.js';
import {ThreeModelLoader} from './ThreeModelLoader.js';
import {ThreeTextureMaker} from './ThreeTextureMaker.js';
import {ThreeMaterialMaker} from './ThreeMaterialMaker.js';
import {ThreeSpatialFunctions} from './ThreeSpatialFunctions.js';


class ThreeAPI {

    constructor() {

        this.shaderBuilder;
        this.glContext;
        this.renderer;
        this.camera;
        this.scene;
        this.reflectionScene;
        this.spatialFunctions;
        this.effectCallbacks;
        this.renderFilter;
        this.assetLoader;
        this.globalUniforms = {};
        this.animationMixers = [];
        this.frameRegs = 0;

        this.dynamicGlobalUnifs = {};
    }
    initThreeLoaders = function() {
        this.shaderBuilder = new ThreeShaderBuilder();
        this.spatialFunctions = new ThreeSpatialFunctions();
    //    this.renderFilter = new ThreeRenderFilter();
        //    ThreeEnvironment.loadEnvironmentData();
    };

    initEnvironment = function(store) {

        var envReady = function() {
            ThreeEnvironment.enableEnvironment();
        };

        var onLoaded = function() {
            ThreeEnvironment.initEnvironment(store, envReady);
        };

        ThreeEnvironment.loadEnvironmentData(onLoaded);

    };

    initThreeScene = function(containerElement, pxRatio, antialias) {
        var store = {};
        store = ThreeSetup.initThreeRenderer(pxRatio, antialias, containerElement, store);
        this.scene = store.scene;
        this.scene.autoUpdate = false;
        this.camera = store.camera;
        this.renderer = store.renderer;
        this.reflectionScene = store.reflectionScene;

        initEnvironment(store);
        this.glContext = store.renderer.context;

        ThreeSetup.addPrerenderCallback(ThreeModelLoader.updateActiveMixers);

        ThreeSetup.addToScene(ThreeSetup.getCamera());
        this.assetLoader = new AssetLoader();
    };

    updateSceneMatrixWorld = function() {
        this.scene.updateMatrixWorld();
    };

    addPrerenderCallback = function(callback) {
        ThreeSetup.addPrerenderCallback(callback);
    };

    addPostrenderCallback = function(callback) {
        ThreeSetup.addPostrenderCallback(callback);
    };

    loadThreeModels = function(TAPI) {
        ThreeModelLoader.loadData();
    };

    loadThreeData = function(TAPI) {
        ThreeModelLoader.loadData();
        ThreeModelLoader.loadTerrainData(TAPI);
        ThreeTextureMaker.loadTextures();
        ThreeMaterialMaker.loadMaterialist();
    };

    loadShaders = function() {
        this.shaderBuilder.loadShaderData(this.glContext);
    };

    buildAsset = function(assetId, callback) {
        new ThreeAsset(assetId, callback);
    };

    loadThreeAsset = function(assetType, assetId, callback) {
        assetLoader.loadAsset(assetType, assetId, callback);
    };

    getTimeElapsed = function() {
        return ThreeSetup.getTotalRenderTime();
    };

    getSetup = function() {
        return ThreeSetup;
    };

    getContext = function() {
        return glContext;
    };

    setEffectCallbacks = function(callbacks) {
        effectCallbacks = callbacks;
    };

    getEffectCallbacks = function() {
        return effectCallbacks;
    };

    getSpatialFunctions = function() {
        return spatialFunctions;
    };

    readEnvironmentUniform = function(worldProperty, key) {
        return ThreeEnvironment.readDynamicValue(worldProperty, key);
    };

    getEnvironment = function() {
        return ThreeEnvironment;
    };

    getModelLoader = function() {
        return ThreeModelLoader;
    };

    getCamera = function() {
        return camera;
    };

    getScene = function() {
        return scene;
    };

    getReflectionScene = function() {
        return reflectionScene;
    };

    getRenderer = function() {
        return renderer;
    };

    plantVegetationAt = function(pos, normalStore) {
        return ThreeModelLoader.terrainVegetationAt(pos, normalStore);
    };

    setYbyTerrainHeightAt = function(pos, normalStore) {
        return ThreeModelLoader.getHeightFromTerrainAt(pos, normalStore);
    };

    updateWindowParameters = function(width, height, aspect, pxRatio) {
        ThreeSetup.setRenderParams(width, height, aspect, pxRatio);
    };

    registerUpdateCallback = function(callback) {
        ThreeSetup.attachPrerenderCallback(callback);
    };

    sampleFrustum = function(store) {
        ThreeSetup.sampleCameraFrustum(store);
    };

    addAmbientLight = function() {

    };

    setCameraPos = function(x, y, z) {
        ThreeSetup.setCameraPosition(x, y, z);
    };

    cameraLookAt = function(x, y, z) {
        ThreeSetup.setCameraLookAt(x, y, z);
    };

    updateCamera = function() {
        ThreeSetup.updateCameraMatrix();
    };

    toScreenPosition = function(vec3, store) {
        ThreeSetup.toScreenPosition(vec3, store);
    };

    checkVolumeObjectVisible = function(vec3, radius) {
        return ThreeSetup.cameraTestXYZRadius(vec3, radius);
    };

    distanceToCamera = function(vec3) {
        return ThreeSetup.calcDistanceToCamera(vec3);
    };

    newCanvasTexture = function(canvas) {
        return ThreeTextureMaker.createCanvasTexture(canvas);
    };

    buildCanvasHudMaterial = function(canvasTexture) {
        return ThreeMaterialMaker.createCanvasHudMaterial(canvasTexture);
    };

    buildCanvasMaterial = function(canvasTexture) {
        return ThreeMaterialMaker.createCanvasMaterial(canvasTexture);
    };

    buildCanvasObject = function(model, canvas, store) {
        var tx = this.newCanvasTexture(canvas);
        var mat = ThreeMaterialMaker.createCanvasHudMaterial(tx);
        ThreeModelLoader.applyMaterialToMesh(mat, model);
        store.texture = tx;
        store.materia = mat;
        return store;
    };

    attachObjectToCamera = function(object) {
        //   ThreeSetup.addToScene(ThreeSetup.getCamera());
        ThreeSetup.addChildToParent(object, ThreeSetup.getCamera());
    };

    applySpatialToModel = function(spatial, model) {
        if (!model) return;
        this.transformModel(model, spatial.posX(), spatial.posY(), spatial.posZ(), spatial.pitch(), spatial.yaw(), spatial.roll())
    };


    transformModel = function(model, px, py, pz, rx, ry, rz) {
        model.position.set(px, py, pz);
        model.rotation.set(rx, ry, rz, 'ZYX');
    };

    addToScene = function(threeObject) {
        ThreeSetup.addToScene(threeObject);
    };

    createRootObject = function() {
        return ThreeModelLoader.createObject3D();
    };

    removeChildrenFrom = function(object) {
        while (object.children.length) {
            this.removeModel(object.children.pop());
        }
    };

    loadMeshModel = function(modelId, rootObject, partsReady) {
        return ThreeModelLoader.loadThreeMeshModel(modelId, rootObject, ThreeSetup, partsReady);
    };

    attachInstancedModel = function(modelId, rootObject) {
        return ThreeModelLoader.attachInstancedModelTo3DObject(modelId, rootObject, ThreeSetup);
    };


    loadModel = function(sx, sy, sz, partsReady) {
        return ThreeModelLoader.loadThreeModel(sx, sy, sz, partsReady);
    };

    loadDebugBox = function(sx, sy, sz, colorName) {
        return ThreeModelLoader.loadThreeDebugBox(sx, sy, sz, colorName);
    };

    loadQuad = function(sx, sy) {
        var model = ThreeModelLoader.loadThreeQuad(sx, sy);
        return ThreeSetup.addToScene(model);
    };

    loadGround = function(applies, array1d, rootObject, partsReady) {
        return ThreeModelLoader.loadGroundMesh(applies, array1d, rootObject, ThreeSetup, partsReady);
    };

    buildTerrainFromBuffers = function(buffers, x, y, z) {

        var bufferGeo = new THREE.BufferGeometry();
        var train = new THREE.Object3D();


        var matReady=function(mat, value) {
            console.log("Mat Ready", mat, value)
            var mesh = new THREE.Mesh( bufferGeo, value.mat);
            train.add(mesh);

            //    var bufferGeo = train.children[0].geometry;
//
            //    bufferGeo.attributes.position.array = buffers[0];
            //  //    bufferGeo.attributes.normal.array = buffers[1];
            //    bufferGeo.attributes.color.array = buffers[2];
            //    bufferGeo.attributes.uv.array = buffers[3];

            bufferGeo.addAttribute( 'position', new THREE.Float32BufferAttribute( buffers[0], 3 ) );
            bufferGeo.addAttribute( 'normal', new THREE.Float32BufferAttribute( buffers[1], 3 ) );
            bufferGeo.addAttribute( 'color', new THREE.Float32BufferAttribute(  buffers[2], 3 ) );
            bufferGeo.addAttribute( 'uv', new THREE.Float32BufferAttribute(  buffers[3], 2 ) );


            bufferGeo.needsUpdate = true;

            //    */
            train.rotateX(-Math.PI/2);
            ThreeSetup.addToScene(train);
        }

        console.log("Load Terrain Mat");
        assetLoader.loadAsset('MATERIALS_', 'material_terrain', matReady);

        return train;
    };

    removeTerrainByPosition = function(pos) {
        return ThreeModelLoader.removeGroundMesh(pos);
    };


    addChildToObject3D = function(child, parent) {
        ThreeSetup.addChildToParent(child, parent);
    };

    animateModelTexture = function(model, z, y, cumulative) {
        ThreeFeedbackFunctions.applyModelTextureTranslation(model, z, y, cumulative)
    };

    setObjectVisibility = function(object3d, bool) {
        object3d.visible = bool;
    };

    showModel = function(obj3d) {
        ThreeSetup.addToScene(obj3d);
    };

    bindDynamicStandardGeometry = function(modelId, dynamicBuffer) {

        console.log("bindDynamicStandardGeometry", modelId, dynamicBuffer);

    };


    hideModel = function(obj3d) {
        ThreeSetup.removeModelFromScene(obj3d);
    };

    removeModel = function(model) {

//            ThreeSetup.removeModelFromScene(model);
        ThreeModelLoader.returnModelToPool(model);
    };

    disposeModel = function(model) {

        ThreeSetup.removeModelFromScene(model);
        ThreeModelLoader.disposeHierarchy(model);
    };

    countAddedSceneModels = function() {
        return ThreeSetup.getSceneChildrenCount();
    };

    sampleRenderInfo = function(source, key) {
        return ThreeSetup.getInfoFromRenderer(source, key);
    };

    countPooledModels = function() {
        return ThreeModelLoader.getPooledModelCount();
    };

    activateMixer = function(mixer) {
        animationMixers.push(mixer);
    };

    deActivateMixer = function(mixer) {
        MATH.quickSplice(animationMixers, mixer);
    };


    updateAnimationMixers = function(tpf) {
        for (let mx = 0; mx < animationMixers.length; mx ++) {
            animationMixers[mx].update(tpf);
        }
    };

    getGlobalUniforms = function() {
        return globalUniforms;
    };

    getGlobalUniform = function(key) {
        if (!globalUniforms[key]) {
            globalUniforms[key] = {value:{}}
        }
        return globalUniforms[key];
    };


    setGlobalUniform = function(uniformKey, values) {

        if (typeof (values) === 'number') {
            globalUniforms[uniformKey].value = values;
        } else {
            for (let val in values) {
                globalUniforms[uniformKey].value[val] = values[val];
            }
        }
    };



    registerDynamicGlobalUniform = function(uniformKey, values) {

        if (this.frameRegs < 5) {
            let key = uniformKey+this.frameRegs;

            if (!this.dynamicGlobalUnifs[key]) {
                this.dynamicGlobalUnifs[key] = {value:{}}
            }

            for (let val in values) {
                this.dynamicGlobalUnifs[key].value[val] = values[val];
            }

            this.frameRegs++
        }

    };

    applyDynamicGlobalUniforms = function() {

        for (let val in dynamicGlobalUnifs) {
            ThreeAPI.setGlobalUniform(val, this.dynamicGlobalUnifs[val].value)
        }

        this.frameRegs = 0;
    };


    toRgb = function(r, g, b) {
        return 'rgb('+Math.floor(r*255)+','+Math.floor(g*255)+','+Math.floor(b*255)+')';
    };

    requestFrameRender = function() {
        requestAnimationFrame( ThreeSetup.callPrerender );
    };

}

export { ThreeAPI }
