/**
 *  JavaScript / Canvas teaching framwork
 * (C)opyright Michael Duve
 *
 *  @module: curve
 *
 *  represents a curve
 */

var de = de || {};
de.cg2 = de.cg2 || {};

/**
 *  requireJS module definition
 */
define(["de.cg2.vec2", "de.cg2.scene", "de.cg2.pointDragger", "de.cg2.point"], (function (vec2, Scene, PointDragger, Point) {
    "use strict";

    /**
     * initializes a new instance of a curve
     * @param segments {number} points between points
     * @param ticks {boolean} show tick marks
     * @param lineStyle {Object} style of the line
     * @constructor
     */
    function Curve(segments, ticks) {

        // default settings if nothing is provided by user
        var settings = {
            segments: 20,
            ticks: false
        };

        this.segments = segments || settings.segments;
        this.ticks = ticks || settings.ticks;
    }

    Curve.prototype = {
        /**
         * draw this bezierCurve into the provided 2D rendering context
         * @param context drawing-context of 2D canvas
         */
        draw: function (context) {
            if (this.ticks) {
                this.drawTicks(context);
            }
        },
        /**
         * draw the ticks of the curve
         * @param context drawing-context of 2D canvas
         * @param points {Array} list of points
         * @param lineWidth {String} broadness of line
         */
        drawTicks: function(context, points, lineWidth) {
            for (var j = 1; j < (points.length - 1); j++) {

                // get tangent of current point
                var tang = vec2.sub(points[j + 1], points[j - 1]);
                var tangNorm = new Point(tang.y * (-1), tang.x);
                // normalize vector and set distance to line.width + 2
                var normalizedVecN = vec2.mult(tangNorm, (1 / vec2.length(tangNorm)));
                var distance = vec2.mult(normalizedVecN, (parseInt(lineWidth, 10) + 2));

                // get top and bottom point
                var point1 = vec2.add(points[j], distance);
                var point2 = vec2.sub(points[j], distance);

                // move to point1 and draw line to point2
                context.moveTo(point1.x, point1.y);
                context.lineTo(point2.x, point2.y);

            }
            context.lineWidth = "1";
            context.stroke();
        },
        /**
         * test whether the mouse position is on the one of the points of the curve
         * @param pos {Point} currentPosition of the mouse
         * @param point0 {Point} first point to check
         * @param point1 {Point} second point to check
         * @param t {number} current position
         * @param lineWidth {String} how broad is the line
         * @returns {boolean} true if hit, false else
         */
        isHit: function (pos, point0, point1, t, lineWidth) {
            // is inside line-segment
            if (t >= 0 && t <= 1) {

                // the projected point
                var projectedPoint = vec2.add(point0, vec2.mult(vec2.sub(point1, point0), t));

                // distance between position and projection
                var d = vec2.length(vec2.sub(projectedPoint, pos));

                // allow 2 pixels extra "sensitivity"
                return (d <= (lineWidth / 2) + 2);
            }
            return false;
        },
        /**
         * describes a Curve with its parameters
         * @returns {String} representation of this Curve
         */
        toString: function () {
            return "Curve=[segments: " + this.segments + ", ticks: " + this.ticks + "]";
        }
    };

    return Curve;

})); // define

    
