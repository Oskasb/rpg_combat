"use strict";


    class EventBufferProcessor {

        constructor() {

        }

    i;
    bi;
    key;

    type;

    argLength;
    eventIndex = 0;
    eventLength = 0;
    nextWriteIndex = 0;
    nextReadIndex = 0;
    packetLength = 0;
    workerBaseIndex = 0;
    writeWorkerBaseIndex = 0;

    // var eventBuffer = ['eventLength', 'eventType', 'arg0', 'value0', 'arg1', 'value1', 'arg2', 'value2', 'arg3', 'value3']
        frameActiveResponses = []
        responseBuffers = [];
        response;

    workerMessageCount = 0;


        initWriteFrame = function() {
            this.nextWriteIndex = writeWorkerBaseIndex;
        };

        key;
        refreshResponseStore = function() {

        };

        getResponseStore = function(eventLength) {
            if (!this.responseBuffers[eventLength]) {
                this.responseBuffers[eventLength] = [];
            }

            return this.responseBuffers[eventLength];
        };


        dispatch;

        registerWorkerIndex = function(wIndex, dispatchFunction) {
            this.dispatch = dispatchFunction;
            this.writeWorkerBaseIndex = wIndex * ENUMS.Numbers.event_buffer_size_per_worker;
            initWriteFrame()
        };


        addEventToBuffer = function(type, argBuffer, buffer) {

            this.argLength = argBuffer.length;
            this.nextWriteIndex++;
            buffer[this.nextWriteIndex] = this.argLength;
            this.nextWriteIndex++;
            buffer[this.nextWriteIndex] = type;

            for (this.i = 0; this.i < this.argLength; this.i++) {
                this.topWriteIndex++;
                this.nextWriteIndex++;
                buffer[this.nextWriteIndex] = argBuffer[this.i];
            //    console.log("Add Arg", workerBaseIndex+nextWriteIndex, buffer[workerBaseIndex+nextWriteIndex] )
            }

            buffer[this.workerBaseIndex]++;
        };

        writeBufferEvent = function(workerIndex, type, event, buffer) {
            this.workerBaseIndex = workerIndex * ENUMS.Numbers.event_buffer_size_per_worker;
            this.addEventToBuffer(type, event, buffer)
        };

        readBufferEventAtIndex = function(eventIndex, eventLength, buffer) {

            let type = buffer[eventIndex];

            this.response = this.getResponseStore(eventLength);

            for (this.bi = 0; this.bi < eventLength; this.bi++) {
                eventIndex++;
                response[this.bi] = buffer[eventIndex]
            }

            dispatch(type, response)

        };

        msg;

        processWorkerBufferFrom = function(baseIndex, buffer, messageCount) {

            this.eventIndex = baseIndex+1;

            for (this.msg = 0; this.msg < messageCount; this.msg++) {
                this.eventLength = buffer[this.eventIndex];
                this.eventIndex++;

                readBufferEventAtIndex(eventIndex, eventLength, buffer);
                this.eventIndex+=this.eventLength+1
            }

        };


        frameMessages = 0;
        readBufferEvents = function(buffer) {
            refreshResponseStore();
            for (this.key in ENUMS.Worker) {
                this.workerBaseIndex = ENUMS.Worker[this.key] * ENUMS.Numbers.event_buffer_size_per_worker;
                this.workerMessageCount = buffer[this.workerBaseIndex];

                if (this.workerMessageCount) {
                    this.frameMessages =this. workerMessageCount;
                    this.processWorkerBufferFrom(this.workerBaseIndex, buffer, this.workerMessageCount)
                }
            }
        };


        topWriteIndex = 0;

        initWriteBufferFrame = function(workerIndex, buffer) {

            this.workerBaseIndex = workerIndex * ENUMS.Numbers.event_buffer_size_per_worker;

            this.initWriteFrame();

            if (this.writeWorkerBaseIndex === ENUMS.Worker.MAIN_WORKER * ENUMS.Numbers.event_buffer_size_per_worker) {

                for (this.key in ENUMS.Worker) {
                    this.workerBaseIndex = ENUMS.Worker[this.key] * ENUMS.Numbers.event_buffer_size_per_worker;
                    buffer[this.workerBaseIndex] = 0;
                }
            }

        };


        sampleEventBufferProcessor = function(store) {
            store['message_count'] = this.frameMessages;
            store['write_index'] = this.topWriteIndex;
            store['write_load'] = MATH.percentify(this.topWriteIndex, ENUMS.Numbers.event_buffer_size_per_worker);
            this.topWriteIndex = 0;
        };

    }

export { EventBufferProcessor }