/**
 * JavaScript / Canvas teaching framwork
 * (C)opyright Michael Duve
 *
 * @module: circle
 * @requires: de.cg2.util
 * @requires: de.cg2.vec2
 * @requires: de.cg2.scene
 * @requires: de.cg2.pointDragger
 * @requires: de.cg2.point
 *
 * A circle knows how to draw itself into a specified 2D context, can tell whether a certain mouse position
 * "hits" the object, and implements the function createDraggers() to create a set of draggers to manipulate itself.
 */

var de = de || {};
de.cg2 = de.cg2 || {};

define(["de.cg2.util", "de.cg2.vec2", "de.cg2.scene", "de.cg2.pointDragger", "de.cg2.point"], (function (util, vec2, Scene, PointDragger, Point) {
    "use strict";

    /**
     * A circle that can be dragged around onto its center point
     * @param center {Point} center of the circle
     * @param radius {number} radius of the circle
     * @param lineStyle {Object} object defining width and color attributes for line drawing,
     *                  begin of the form { width: 2, color: "#00FF00" }
     * @constructor
     */
    function Circle(center, radius, lineStyle) {

        // draw style for drawing the line
        this.lineStyle = lineStyle || { width: "2", color: "#0000AA" };

        // initial values in case either point is undefined
        this.center = center || new Point(0, 0);
        this.radius = radius || 10;

        console.log("Created: " + this.toString());

    }

    Circle.prototype = {
        /**
         * draw this circle into the provided 2D rendering context
         * @param context drawing-context of 2D canvas
         */
        draw: function (context) {

            console.log(this.lineStyle);

            // draw actual line
            context.beginPath();

            // set circle to be drawn
            context.arc(this.center.x, this.center.y, this.radius, 0, Math.PI * 2);

            // set drawing style
            context.lineWidth = this.lineStyle.width;
            context.strokeStyle = this.lineStyle.color;

            // actually start drawing
            context.stroke();

        },
        /**
         * test whether the mouse position is on this circle outline
         * @param context drawing-context of 2D canvas
         * @param pos {Point} currentPosition of the mouse
         * @returns {boolean} true if hit, false else
         */
        isHit: function (context, pos) {

            // calculate distance between points
            var distance = vec2.sub(pos, this.center);

            // pythagoras
            // (x-a)^2 + (y-b)^2 = r^2
            var xSquared = distance.x * distance.x;
            var ySquared = distance.y * distance.y;
            var r = Math.sqrt(xSquared + ySquared);

            // allow 2 pixels extra "sensitivity"
            var lw = context.lineWidth + 2;

            return r <= (this.radius + lw) && r >= (this.radius - lw);

        },
        /**
         * list of draggers to manipulate this circle
         * @returns {Array} list of PointDragger
         */
        createDraggers: function () {

            var draggerStyle = {
                radius: 4,
                color: util.invertColor(this.lineStyle.color),
                width: 0,
                fill: true
            };
            var draggers = [];

            // create closure and callbacks for dragger
            var _circle = this;
            var getC = function () {
                return _circle.center;
            };
            var setC = function (dragEvent) {
                _circle.center = dragEvent.position;
            };

            var getSize = function () {
                // set center to center of x and put it on outline of circle
                return new Point(_circle.center.x, _circle.center.y + _circle.radius);
            };
            var setSize = function (dragEvent) {
                var pythagoras = vec2.pythagoras(dragEvent.delta.x, dragEvent.delta.y);
                // decide if size of radius should be smaller or bigger
                if (dragEvent.delta.x + dragEvent.delta.y < 0) {
                    _circle.radius = _circle.radius - pythagoras;
                } else {
                    _circle.radius = _circle.radius + pythagoras;
                }
                // circle can not have negative radius
                if (_circle.radius < 0) {
                    _circle.radius = 0;
                }

            };
            draggers.push(new PointDragger(getSize, setSize, draggerStyle));
            draggers.push(new PointDragger(getC, setC, draggerStyle));

            return draggers;

        },
        /**
         * describes a Circle with its parameters
         * @returns {String} representation of this Circle
         */
        toString: function () {
            return "Circle[ at " + this.center + " with radius " + this.radius + "]";
        }
    };

    return Circle;

})); // define

    
