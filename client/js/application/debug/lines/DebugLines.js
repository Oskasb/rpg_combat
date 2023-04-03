import { LineRenderSystem } from "./LineRenderSystem.js";

class DebugLines {
        constructor() {

        lineDenderSystem = new LineRenderSystem();
        this.lineDenderSystem = lineDenderSystem;
        var lineDenderSystem;
        var tempVec1 = new THREE.Vector3();
        var tempVec2 = new THREE.Vector3();
        var color;

        var drawLine = function(args) {
            tempVec1.set(args[0], args[1], args[2]);
            tempVec2.set(args[3], args[4], args[5]);
            color = lineDenderSystem.color(ENUMS.getKey('Color', args[6]));
            lineDenderSystem.drawLine(tempVec1, tempVec2, color)
        };

        var drawCross = function(event) {
            color = lineDenderSystem.color(event.color);
            lineDenderSystem.drawCross(event.pos, color, event.size)
        };

        var drawBox = function(args) {
            tempVec1.set(args[0], args[1], args[2]);
            tempVec2.set(args[3], args[4], args[5]);
            color = lineDenderSystem.color(ENUMS.getKey('Color', args[6]));
            lineDenderSystem.drawAABox(tempVec1, tempVec2, color)
        };

        evt.on(ENUMS.Event.DEBUG_DRAW_LINE, drawLine);
        evt.on(ENUMS.Event.DEBUG_DRAW_CROSS, drawCross);
        evt.on(ENUMS.Event.DEBUG_DRAW_AABOX, drawBox);

    };

    updateDebugLines = function() {
        this.lineDenderSystem.render();
    };

}

export { DebugLines }