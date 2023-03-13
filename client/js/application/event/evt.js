import { EventProtocol } from '/client/js/application/event/EventProtocol.js';
import { EventParser } from '/client/js/application/event/EventParser.js';


class evt {

    constructor() {

    }

    eventProtocol = new EventProtocol();

    eventList = {};
    events = [];
    listeners = [];

    spliceListeners = [];

    evtStatus = {
        activeListeners:0,
        firedCount:0,
        onceListeners:0,
        addedListeners:0
    };

    list() {
        return this.eventList;
    };

    setupEvent = function(event) {

        if (typeof (event) !== 'number') {
            console.log("Old Event: ", event);
            return;
        }

        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
    };


    dispatchEvent(event, args) {

        while (this.spliceListeners.length) {
            this.spliceListener(this.spliceListeners.shift(), this.spliceListeners.shift())
        }

        for (var i = 0; i < this.listeners[event].length; i++) {

            if (typeof (this.listeners[event][i]) !== 'function') {
                console.log("Bad listener", event, this.listeners);
                return;
            }

            this.listeners[event][i](args);
        }

        while (this.spliceListeners.length) {
            this.spliceListener(this.spliceListeners.shift(), this.spliceListeners.shift())
        }

    };

    dispatch(event, args) {


        if (typeof(this.listeners[event]) === 'undefined') {

            return;
            // listeners[event] = []
        }

        dispatchEvent(event, args);
        this.evtStatus.firedCount++;
    };

    on(event, callback) {
        this.setupEvent(event);
        this.listeners[event].push(callback);
    };

    once(event, callback) {
        this.setupEvent(event);

        var remove = function() {
            this.removeListener(this.listeners[event], singleShot);
            this.evtStatus.onceListeners--;
            if (this.evtStatus.onceListeners < 0) {
                console.log("overdose singleshots", event);
            }
        };

        var call = function(args) {
            callback(args);
        };

        var singleShot = function(args) {

            call(args);
            remove();

        };

        this.evtStatus.onceListeners++;

        this.registerListener(event, singleShot);
    };

    spliceListener(listeners, cb) {
        MATH.quickSplice(listeners, cb);
    };

    getEventSystemStatus() {

        this.evtStatus.eventCount = 0;
        this.evtStatus.listenerCount = 0;
        for (var key in this.listeners) {
            this.evtStatus.eventCount++;
            this.evtStatus.listenerCount += this.listeners[key].length;
        }

        EventProtocol.getEventProtocolStatus(this.evtStatus);

        return this.evtStatus;
    };

    asynchifySplice(listnrs, cb) {
        this.spliceListeners.push(listnrs);
        this.spliceListeners.push(cb);
    };

    removeListener(event, callback) {

        if (!this.listeners[event]) {
            return;
        }

        if (this.listeners[event].indexOf(callback) === -1) {
            return;
        }

        //     spliceListener(listeners[event], callback);
        this.asynchifySplice(this.listeners[event], callback);
    };

    setEventBuffers(buffers, workerIndex) {
        EventProtocol.setEventBuffer(buffers, workerIndex, this.dispatch)
    };

    initEventFrame(frame) {
        EventProtocol.initEventFrame(frame);
    };

    setArgVec3(evtBuffer, startIndex, vec3) {
        evtBuffer[startIndex+1] = vec3.x;
        evtBuffer[startIndex+3] = vec3.y;
        evtBuffer[startIndex+5] = vec3.z;
    };

    setArgQuat(evtBuffer, startIndex, quat) {
        evtBuffer[startIndex+1] = quat.x;
        evtBuffer[startIndex+3] = quat.y;
        evtBuffer[startIndex+5] = quat.z;
        evtBuffer[startIndex+7] = quat.w;
    };

    getArgVec3(evtBuffer, startIndex, vec3) {
        vec3.x = evtBuffer[startIndex+1];
        vec3.y = evtBuffer[startIndex+3];
        vec3.z = evtBuffer[startIndex+5];
    };

    getArgQuat(evtBuffer, startIndex, quat) {
        quat.x = evtBuffer[startIndex+1] ;
        quat.y = evtBuffer[startIndex+3] ;
        quat.z = evtBuffer[startIndex+5] ;
        quat.w = evtBuffer[startIndex+7] ;
    };

    fire(eventType, argBuffer) {
        this.eventProtocol.registerBufferEvent(eventType, argBuffer);
    };

    parser = EventParser;

}

export { evt }