define([
		'application/debug/lines/LineRenderer'
	],
	function (
			  LineRenderer
			  ) {
		'use strict';

		var	Vector3 = THREE.Vector3;

		var colors = {
			WHITE 	: new Vector3(1, 1, 1),
			GREY 	: new Vector3(0.5, 0.5, 0.5),
			PINK 	: new Vector3(1, 0.6, 0.6),
			RED 	: new Vector3(1, 0, 0),
			PURPLE 	: new Vector3(1, 0.5, 1),
			GREEN	: new Vector3(0, 1, 0),
			PEA 	: new Vector3(0.5, 1, 0.5),
			BLUE 	: new Vector3(0, 0, 1),
			AQUA 	: new Vector3(0, 1, 2),
			CYAN 	: new Vector3(0.5, 1, 1),
			MAGENTA : new Vector3(1, 0, 1),
			DARKPURP: new Vector3(0.55, 0, 0.55),
			YELLOW 	: new Vector3(1, 1, 0.4),
			ORANGE 	: new Vector3(1, 0.8, 0.3),
			BLACK 	: new Vector3(0, 0, 0)
		};

		function LineRenderSystem() {

			this._lineRenderers = [];
			
			this._lineRenderers.push(new LineRenderer(this.world));
		}

	//	LineRenderSystem.prototype = Object.create(System.prototype);
		LineRenderSystem.prototype.constructor = LineRenderSystem;


        var start = new Vector3();
        var end = new Vector3();
		var tmpVec1 = new Vector3();
		var tmpVec2 = new Vector3();
		var tmpVec3 = new Vector3();

		LineRenderSystem.axis = ['x', 'y', 'z'];

		//setup a preset of colors



		LineRenderSystem.prototype.color = function(color) {
			return colors[color];
		};



		LineRenderSystem.prototype.drawLine = function (start, end, color) {
			let lineRenderer = this._lineRenderers[0];

			lineRenderer._addLine(start, end, color);
		};
		
		
		LineRenderSystem.prototype._drawAxisLine = function (start, startEndDelta, startDataIndex, endDataIndex, startPolarity, endPolarity, color, transformMatrix) {
			var startAxis = LineRenderSystem.axis[startDataIndex];
			var endAxis = LineRenderSystem.axis[endDataIndex];

			var lineStart = tmpVec2.set(start);
			lineStart[startAxis] += startEndDelta[startAxis] * startPolarity;

			var lineEnd = tmpVec3.set(lineStart);
			lineEnd[endAxis] += startEndDelta[endAxis] * endPolarity;

			if (transformMatrix !== undefined) {
				lineStart.applyPostPoint(transformMatrix);
				lineEnd.applyPostPoint(transformMatrix);
			}

			this.drawLine(lineStart, lineEnd, color);
		};

		/**
		 * Draws an axis aligned box between the min and max points, can be transformed to a specific space using the matrix.
		 * @param {Vector3} min
		 * @param {Vector3} max
		 * @param {Vector3} color A vector with its components between 0-1.
		 * @param {Matrix4} [transformMatrix]
		 */
		LineRenderSystem.prototype.drawAABox = function (min, max, color, transformMatrix) {
			var diff = tmpVec1.set(max).sub(min);

			for (var a = 0; a < 3; a++) {
				for (var b = 0; b < 3; b++) {
					if (b !== a) {
						this._drawAxisLine(min, diff, a, b, 1, 1, color, transformMatrix);
					}
				}

				this._drawAxisLine(max, diff, a, a, -1, 1, color, transformMatrix);
				this._drawAxisLine(min, diff, a, a, 1, -1, color, transformMatrix);
			}
		};

		/**
		 * Draws a cross at a position with the given color and size.
		 * @param {Vector3} position
		 * @param {Vector3} color A vector with its components between 0-1.
		 * @param {number} [size=0.05]
		 */
		LineRenderSystem.prototype.drawCross = function (position, color, size) {
			size = size || 0.05;

			start.x = position.x - size;
            start.y = position.y;
            start.z = position.z - size;
            end.x = position.x + size;
            end.y = position.y;
            end.z = position.z + size;

			this.drawLine(start, end, color);

            start.x = position.x + size;
            start.y = position.y;
            start.z = position.z - size;
            end.x = position.x - size;
            end.y = position.y;
            end.z = position.z + size;

			this.drawLine(start, end, color);

            start.x = position.x;
            start.y = position.y - size;
            start.z = position.z;
            end.x = position.x;
            end.y = position.y + size;
            end.z = position.z;

			this.drawLine(start, end, color);
		};

		LineRenderSystem.prototype.render = function () {
			for (var i = 0; i < this._lineRenderers.length; i++) {
				var lineRenderer = this._lineRenderers[i];
				lineRenderer._clear();
			}
		};

        LineRenderSystem.prototype._pause = function () {
            for (var i = 0; i < this._lineRenderers.length; i++) {
                var lineRenderer = this._lineRenderers[i];
                lineRenderer._pause();
            }
        };


        LineRenderSystem.prototype.clear = function () {
			for (var i = 0; i < this._lineRenderers.length; i++) {
				var lineRenderer = this._lineRenderers[i];
				lineRenderer._remove();
			}
			delete this._lineRenderers;
		};


		return LineRenderSystem;
	});