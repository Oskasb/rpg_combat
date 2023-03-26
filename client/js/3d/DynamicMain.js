class DynamicMain {
    constructor() {

    this.assets = {};
    this.assetIndex = {};
    this.instances = [];

        let requestInstance = function(event) {
            this.requestAssetInstance(event)
        }.bind(this);

        evt.on(ENUMS.Event.REQUEST_ASSET_INSTANCE, requestInstance);

        this.instanceEvt = [
            ENUMS.Args.POINTER,             0,
            ENUMS.Args.INSTANCE_POINTER,    0
        ];

        this.instancePointer = ENUMS.Numbers.INSTANCE_PTR_0;

    };

    requestAsset = function(modelAssetId, assetReadyCB) {
        let assets = this.assets;
        var onAssetReady = function(asset) {
        //    console.log("AssetReady:", asset);
            this.assetIndex[asset.id] = assets.length;
            assets[modelAssetId] = asset;

            var idx = this.assetIndex[asset.id];
            var anims = asset.model.animationKeys;
            var joints = asset.model.jointKeys;
            var message = {};


            message.index = idx;
            message.animKeys = anims;
            message.jointKeys = joints;

            var modelSettings = asset.model.settings;
            if (modelSettings.skin) {
                message.skin = modelSettings.skin
            }
            assetReadyCB(asset)
        //    WorkerAPI.callWorker(ENUMS.Worker.MAIN_WORKER,  [ENUMS.Message.REGISTER_ASSET, [asset.id, message]])
        }.bind(this);

        ThreeAPI.buildAsset(modelAssetId,   onAssetReady);

    };

    getInstanceByPointer = function(ptr) {
        for (var i = 0; i < this.instances.length; i++) {
            if (this.instances[i].getPointer() === ptr) {
                return this.instances[i];
            }
        }
    };

    removeFromIsntanceIndex = function(instancedModel) {
        MATH.quickSplice(this.instances, instancedModel);
    };

    requestAssetInstance = function(assetId, callback) {

        let instanceReady = function(modelInstance) {
            this.instancePointer++;
            this.instances.push(modelInstance);
            modelInstance.activateInstancedModel();
            modelInstance.setPointer(this.instancePointer);
        //    this.instanceEvt[1] = this.assetIndex[modelInstance.getAssetId()];
        //    this.instanceEvt[3] = modelInstance.getPointer();
        //    evt.dispatch(ENUMS.Event.REGISTER_INSTANCE, this.instanceEvt);
            callback(modelInstance);
        }.bind(this);

        let asset = this.assets[assetId];
        asset.instantiateAsset(instanceReady);

    };

    updateDynamicInstances = function() {
        for (var i = 0; i < this.instances.length; i++) {
            this.instances[i].getSpatial().updateSpatialFrame();
        }
    };

    updateDynamicMatrices = function() {
        for (var i = 0; i < this.instances.length; i++) {
            this.instances[i].updateSpatialWorldMatrix();
        }
    };

    tickDynamicMain = function(tpf, systemTime) {
        this.updateDynamicMatrices();
        this.updateDynamicInstances();
        InstanceAPI.updateInstances(tpf, systemTime);

    };

    initiateInstancesFromBufferMsg = function(bufferMsg) {
        InstanceAPI.setupInstancingBuffers(bufferMsg);
    };

};

export { DynamicMain }