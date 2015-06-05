/**
 * JavaScript / Canvas teaching framwork
 * (C)opyright Hartmut Schirmacher, hschirmacher.beuth-hochschule.de
 *
 * @module: straightLine
 * @requires: de.cg2.util
 * @requires: de.cg2.vec2
 * @requires: de.cg2.scene
 * @requires: de.cg2.pointDragger
 * @requires: de.cg2.point
 *
 * A StraighLine knows how to draw itself into a specified 2D context, can tell whether a certain mouse position
 * "hits" the object, and implements the function createDraggers() to create a set of draggers to manipulate itself.
 */

var de = de || {};
de.cg2 = de.cg2 || {};

define(["de.cg2.util", "de.cg2.vec2", "de.cg2.scene", "de.cg2.pointDragger", "de.cg2.point"], (function (util, vec2, Scene, PointDragger, Point) {
    "use strict";

    /**
     * A simple straight line that can be dragged around by its endpoints.
     * @param point0 {Point} representing [x,y] coordinates of start point
     * @param point1 {Point} representing [x,y] coordinates of end point
     * @param lineStyle {Array} object defining width and color attributes for line drawing,
     *                  begin of the form { width: 2, color: "#00FF00" }
     * @constructor
     */
    function StraightLine(point0, point1, lineStyle) {

        // draw style for drawing the line
        this.lineStyle = lineStyle || { width: "2", color: "#0000AA" };

        // initial values in case either point is undefined
        this.p0 = point0 || new Point(10, 10);
        this.p1 = point1 || new Point(50, 50);

        console.log("Created: " + this.toString());

    }

    StraightLine.prototype = {
        /**
         * draw this line into the provided 2D rendering context
         * @param context drawing-context of 2D canvas
         */
        draw: function (context) {

            // draw actual line
            context.beginPath();

            // set points to be drawn
            context.moveTo(this.p0.x, this.p0.y);
            context.lineTo(this.p1.x, this.p1.y);

            // set drawing style
            context.lineWidth = this.lineStyle.width;
            context.strokeStyle = this.lineStyle.color;

            // actually start drawing
            context.stroke();

        },

        /**
         * test whether the mouse position is on this line segment
         * @param context drawing-context of 2D canvas
         * @param pos {Point} currentPosition of the mouse
         * @returns {boolean} true if hit, false else
         */
        isHit: function (context, pos) {

            // project point on line, get parameter of that projection point
            var t = vec2.projectPointOnLine(pos, this.p0, this.p1);

            // outside the line segment?
            if (t < 0.0 || t > 1.0) {
                return false;
            }

            // coordinates of the projected point
            var p = vec2.add(this.p0, vec2.mult(vec2.sub(this.p1, this.p0), t));

            // distance of the point from the line
            var d = vec2.length(vec2.sub(p, pos));

            // allow 2 pixels extra "sensitivity"
            return d <= (this.lineStyle.width / 2) + 2;

        },

        /**
         * list of draggers to manipulate this line
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
            var _line = this;
            var getP0 = function () {
                return _line.p0;
            };
            var getP1 = function () {
                return _line.p1;
            };
            var setP0 = function (dragEvent) {
                _line.p0 = dragEvent.position;
            };
            var setP1 = function (dragEvent) {
                _line.p1 = dragEvent.position;
            };
            draggers.push(new PointDragger(getP0, setP0, draggerStyle));
            draggers.push(new PointDragger(getP1, setP1, draggerStyle));

            return draggers;

        },
        /**
         * describes a straightLine with its parameters
         * @returns {String} representation of this straightLine
         */
        toString: function () {
            return "StraightLine[from " + this.p0 + " to " + this.p1 + "]";
        }
    };

    return StraightLine;

})); // define

    
