
class ExpandingPool {
    constructor(dataKey, createFunc) {

        let cache = PipelineAPI.getCachedConfigs();
        if (!cache['DEBUG']) {
            cache.DEBUG = {};
        }
        if (!cache['DEBUG']['POOLS']) {
            cache.DEBUG.POOLS = {
                added:0,
                shifts:0,
                pushes:0
            };
        }

        this.track = cache.DEBUG.POOLS

        this.pool = [];
        this.generatePoolEntry = function(callback) {
            this.track.added++
            // effect and particles not returning to pool! -- fix also UI_TEXT_MAIN-- letters?
            createFunc(dataKey, callback)
        }.bind(this);

    };

    poolEntryCount = function() {
        return this.pool.length
    };

    pushEP = function(entry) {
        this.track.shifts--;
        this.track.pushes++
        return this.pool.push(entry);
    };

    shiftEP = function() {
        this.track.shifts++;
        this.track.pushes--
        return this.pool.shift()
    };

    getFromExpandingPool = function(callback) {

        if (this.poolEntryCount() > 1) {
            callback(this.shiftEP());
        } else {
            this.track.active++;
            this.generatePoolEntry(callback)
        }
    };

    returnToExpandingPool = function(entry) {
        if (this.pool.indexOf(entry) === -1) {
            this.pushEP(entry)
        } else {
            console.log("Entry already in pool, no good!", entry)
        }
    };

}

export { ExpandingPool }