class ExpandingPool {
    constructor(dataKey, createFunc) {

        this.pool = [];
        this.generatePoolEntry = function(callback) {
            createFunc(dataKey, callback)
        };

    };

    poolEntryCount = function() {
        return this.pool.length
    };

    pushEP = function(entry) {
        return this.pool.push(entry);
    };

    shiftEP = function() {
        return this.pool.shift()
    };

    getFromExpandingPool = function(callback) {

        if (this.poolEntryCount() > 1) {
            callback(this.shiftEP());
        } else {
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

    wipeExpandingPool = function() {
        this.pool = [];
    };

}

export { ExpandingPool }