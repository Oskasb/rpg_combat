"use strict";

class GameScreen {

    constructor() {
        this.gameScreen = document.body;
        this.landscape = null;
        this.width = null;
        this.height = null;
        this.top = null;
        this.left = null;
        this.resolution = null;
        this.element = null;
        this.scalePercentToX = null;
        this.scalePercentToY = null;
        this.sizeFactor = null;
        this.percentZoom = 900;
    }

    registerAppContainer = function(elem) {

        this.element = elem;
        //    element.oncontextmenu = function() { return false; };
        this.gameScreen = this.element;
        this.gameScreen.style.pointerEvents = 'auto';

        let _this = this;

        setTimeout(function() {
            _this.notifyResize();
        }, 3000);

        setTimeout(function() {
            _this.notifyResize();
        }, 1000);

        setTimeout(function() {
            _this.notifyResize();
        }, 100);
        _this.notifyResize();
    };

    getResolution = function(width, height) {
        //	if (width < height) return height;
        return width;
    };

    notifyResize = function() {
        this.width = this.gameScreen.offsetWidth;
        this.height = this.gameScreen.offsetHeight;
        this.left = this.gameScreen.offsetLeft;
        this.top = this.gameScreen.offsetTop;
        this.resolution = this.width;
        this.sizeFactor = this.resolution / this.percentZoom;
        document.body.style.fontSize = this.sizeFactor+"px";
        this.scalePercentToX = (1/this.percentZoom) * this.width * ( this.resolution / this.width);
        this.scalePercentToY = (1/this.percentZoom) * this.height* ( this.resolution / this.height);

    };

    getAspect = function() {
        return this.width/this.height;
    };

    getElement = function() {
        return this.gameScreen;
    };

    getTop = function() {
        return this.top;
    };

    getLeft = function() {
        return this.left;
    };

    getWidth = function() {
        return this.width;
    };

    getHeight = function() {
        return this.height;
    };

    pxToPercentX = function(px) {
        return px/this.scalePercentToX;
    };

    pxToPercentY = function(px) {
        return px/this.scalePercentToY;
    };

    percentX = function(percent) {
        return  (this.width / this.resolution) *percent*this.scalePercentToX;
    };

    percentY = function(percent) {
        return (this.height / this.resolution) *percent*this.scalePercentToY;
    };

    widthRatio = function(percentx) {
        return percentx * this.width / this.percentZoom;
    };

    heightRatio = function(percenty) {
        return percenty * this.height / this.percentZoom;
    };


    percentToX = function(percent) {
        return (this.width / this.resolution) *percent*this.scalePercentToX * (this.percentZoom/100);
    };

    percentToY = function(percent) {
        return (this.height / this.resolution) *percent*this.scalePercentToY * (this.percentZoom/100);
    };

    pxToX = function(px) {
        return (this.resolution / 1024) * this.scalePxToX * px;
    };

    getPxFactor = function() {
        return (this.resolution / 1024) * this.scalePxToX
    };

    getZoom = function() {
        return this.percentZoom;
    };

    setLandscape = function(bool) {
        this.landscape = bool;
    };

    getLandscape = function() {
        return this.landscape;
    };

    setZoomFactor = function(factor) {
        return this.percentZoom = 100*factor;
    };

    goFullscreen = function() {

        let el = document.body;

        if (el.requestFullscreen) {
            el.requestFullscreen()
        } else if (el.msRequestFullscreen) {
            el.msRequestFullscreen()
        } else if (el.mozRequestFullScreen) {
            el.mozRequestFullScreen()
        } else if (el.webkitRequestFullscreen) {
            el.webkitRequestFullscreen()
        }

    };

    exitFullscreen = function() {

        let el = document;

        if (el.exitFullscreen) {
            el.exitFullscreen()
        } else if (el.msExitFullscreen) {
            el.msExitFullscreen()
        } else if (el.mozCancelFullScreen) {
            el.mozCancelFullScreen()
        } else if (el.webkitExitFullscreen) {
            el.webkitExitFullscreen()
        }

    };

    fitView = function(vec3) {
        vec3.x *= (0.83 * this.width/this.height);
        vec3.y *= (0.83);
    }

}

export { GameScreen }