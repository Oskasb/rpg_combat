"use strict";


define([
        'evt',
        'PipelineAPI',
        'EffectsAPI',
        'gui/CanvasGuiAPI',
        './MonitorEffectAPI'
    ],
    function(
        evt,
        PipelineAPI,
        EffectsAPI,
        CanvasGuiAPI,
        MonitorEffectAPI
    ) {

        var StatusMonitor = function() {

        };

        StatusMonitor.prototype.registerStatus = function(data) {

        };


        function applyDebugConfig(src, DEBUG) {

        }


        StatusMonitor.prototype.monitorSystem = function() {


        };

        StatusMonitor.prototype.monitorRenderStates = function() {


        };

        StatusMonitor.prototype.monitorMemory = function() {

        };

        var percentify = function(number, total) {
            return Math.round((number/total) * 100);
        };

        var round = function(number) {
            return Math.round(number);
        };

        StatusMonitor.prototype.monitorTimeDetails = function() {

        };

        StatusMonitor.prototype.monitorServerHealth = function() {


        };



        StatusMonitor.prototype.monitorServerTraffic = function() {


        };

        StatusMonitor.prototype.tickMonitors = function() {

            MonitorEffectAPI.tickEffectMonitor();
            this.monitorRenderStates();
            this.monitorMemory();
            this.monitorTimeDetails();
            this.monitorServerHealth();
            this.monitorServerTraffic();
        };

        return StatusMonitor;
    });