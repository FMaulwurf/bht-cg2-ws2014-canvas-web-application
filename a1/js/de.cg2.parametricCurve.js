/**
 *  JavaScript / Canvas teaching framwork
 * (C)opyright Michael Duve
 *
 *  @module: parametricCurve
 */

var de = de || {};
de.cg2 = de.cg2 || {};

/**
 *  requireJS module definition
 */
define(["de.cg2.vec2", "de.cg2.scene", "de.cg2.pointDragger", "de.cg2.point", "de.cg2.curve"], (function (vec2, Scene, PointDragger, Point, Curve) {
    "use strict";

    /**
     * initializes a new instance of a parametric curve
     * @param fOfT {Function} function for calculating x(t)
     * @param gOfT {Function} function for calculating y(t)
     * @param tMin {number} minimum t
     * @param tMax {number} maximum t
     * @param segments {number} points between min and max t
     * @param ticks {boolean} show tick marks
     * @param lineStyle {Object} style of the line
     * @returns {ParametricCurve} a new instance of a ParametricCurve
     * @constructor
     */
    function ParametricCurve(fOfT, gOfT, tMin, tMax, segments, ticks, lineStyle) {

        // default settings if nothing is provided by user
        var settings = {
            fOfT: function (t) {
                return 300 + 100 * Math.sin(t);
            },
            gOfT: function (t) {
                return 300 + 100 * Math.cos(t);
            },
            tMin: 0,
            tMax: 5,
            lineStyle: {
                width: "2",
                color: "#DB0000"
            }
        };

        this.curve = new Curve(segments || 20, ticks || false);

        this.lineStyle = lineStyle || settings.lineStyle;
        this.fOfT = fOfT || settings.fOfT;
        this.gOfT = gOfT || settings.gOfT;
        this.tMin = tMin || settings.tMin;
        this.tMax = tMax || settings.tMax;
        this.points = [];

        console.log("Created: " + this.toString());

    }

    ParametricCurve.prototype = {
        /**
         * draw this parametricCurve into the provided 2D rendering context
         * @param context drawing-context of 2D canvas
         */
        draw: function (context) {

            context.beginPath();

            // clear old point array if its already set
            this.points = [];

            // go to starting position
            var start = new Point(this.fOfT(this.tMin), this.gOfT(this.tMin));
            this.points[0] = start;
            context.moveTo(start.x, start.y);

            // go through all t by amount of segments
            for (var i = 1; i <= this.curve.segments; i++) {
                // calculate the current t
                var t = (this.tMin + i / this.curve.segments * (this.tMax - this.tMin));
                this.points[i] = new Point(this.fOfT(t), this.gOfT(t));
                // draw a line between them
                context.lineTo(this.points[i].x, this.points[i].y);
            }

            // set drawing style
            context.lineWidth = this.lineStyle.width;
            context.strokeStyle = this.lineStyle.color;

            context.stroke();

            if (this.curve.ticks) {
                this.curve.drawTicks(context, this.points, this.lineStyle.width);
            }

        },
        /**
         * set the segments
         * @param segments {number} amount of new segments
         */
        setSegments: function(segments) {
            if (segments) {
                this.curve.segments = segments;
            }
        },
        /**
         * set the ticks
         * @param ticks {boolean} set tickmarkers enabled or disabled
         */
        setTicks: function(ticks) {
            this.curve.ticks = ticks;
        },
        /**
         * test whether the mouse position is on the one of the points of the parametricCurve
         * @param context drawing-context of 2D canvas
         * @param pos {Point} currentPosition of the mouse
         * @returns {boolean} true if hit, false else
         */
        isHit: function (context, pos) {
            var t = 0;
            for (var i = 0; i < this.points.length - 1; i++) {

                var point0 = this.points[i];
                var point1 = this.points[i+1];

                t = vec2.projectPointOnLine(pos, point0, point1);

                var isHit = this.curve.isHit(pos, point0, point1, t, this.lineStyle.width);

                if (isHit) {
                    return true;
                }

            }
            return false;
        },

        /**
         * list of draggers to manipulate this line
         * @returns {Array} empty list of PointDragger
         */
        createDraggers: function () {
            return [];
        },
        /**
         * describes a ParametricCurve with its parameters
         * @returns {String} representation of this ParametricCurve
         */
        toString: function () {
            return "ParametricCurve=[t-min: " + this.tMin + ", t-max: " + this.tMax + ", " + this.curve.toString() + "]";
        }
    };

    return ParametricCurve;

})); // define

    
