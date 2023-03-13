"use strict";
import { EventBufferProcessor } from '/client/js/application/event/EventBufferProcessor.js';


class EventProtocol {

    constructor() {


    }

    eventBufferProcessor = new EventBufferProcessor();
    state = {
        eventBuffers : [[0],[0], [0], [0] , [0], [0], [0]],
        workerIndex : 0,
        writeBufferIndex : 0,
        readBufferIndex : 1
    };


        getWriteBuffer = function() {
            if (!this.state.eventBuffers) {
                console.log("No eventBuffer", workerIndex);
            }
            return this.state.eventBuffers[this.state.writeBufferIndex]
        };

        getReadBuffer = function() {
            if (!this.state.eventBuffers) {
                console.log("No eventBuffer", workerIndex);
            }
            return this.state.eventBuffers[this.state.readBufferIndex]
        };

        setEventBuffer = function( buffers, wIndex, dispatch) {
            this.state.workerIndex = wIndex;
            this.state.eventBuffers = buffers;
            this.eventBufferProcessor.registerWorkerIndex(wIndex, dispatch)
        };

        getEventBuffer = function( index) {
            return this.state.eventBuffers[index];
        };

        registerBufferEvent = function(eventType, eventArgs) {
            this.eventBufferProcessor.writeBufferEvent(this.state.workerIndex, eventType, eventArgs, this.getWriteBuffer())
        };

        initEventFrame = function(state, frame) {
            this.state.writeBufferIndex = (frame+1) % this.state.eventBuffers.length;
            this.state.readBufferIndex = (frame) % this.state.eventBuffers.length;
            this.eventBufferProcessor.readBufferEvents(this.getReadBuffer());
            this.eventBufferProcessor.initWriteBufferFrame(workerIndex, this.getWriteBuffer())
        };

        getEventProtocolStatus = function(store) {
            this.eventBufferProcessor.sampleEventBufferProcessor(store)
        };


    };

export { EventProtocol }