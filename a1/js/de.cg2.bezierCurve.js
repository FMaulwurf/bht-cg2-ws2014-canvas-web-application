/**
 *  JavaScript / Canvas teaching framwork
 * (C)opyright Michael Duve
 *
 *  @module: bezierCurve
 *
 *  represents a bezier curve
 */

var de = de || {};
de.cg2 = de.cg2 || {};

/**
 *  requireJS module definition
 */
define(["de.cg2.vec2", "de.cg2.scene", "de.cg2.pointDragger", "de.cg2.point", "de.cg2.curve"], (function (vec2, Scene, PointDragger, Point, Curve) {
    "use strict";

    /**
     * initializes a new instance of a bezier curve
     * @param p0 {Point} control point 0
     * @param p1 {Point} control point 1
     * @param p2 {Point} control point 2
     * @param p3 {Point} control point 3
     * @param segments {number} points between points
     * @param ticks {boolean} show tick marks
     * @param lineStyle {Object} style of the line
     * @constructor
     */
    function BezierCurve(p0, p1, p2, p3, segments, ticks, lineStyle) {

        // default settings if nothing is provided by user
        var settings = {
            p0: new Point(250, 150),
            p1: new Point(150, 250),
            p2: new Point(200, 100),
            p3: new Point(100, 200),
            lineStyle: {
                width: "2",
                color: "#DB0000"
            }
        };

        this.curve = new Curve(segments || 20, ticks || false);

        this.p0 = p0 || settings.p0;
        this.p1 = p1 || settings.p1;
        this.p2 = p2 || settings.p2;
        this.p3 = p3 || settings.p3;
        this.lineStyle = lineStyle || settings.lineStyle;
        this.points = [];

        console.log("Created: " + this.toString());

    }

    BezierCurve.prototype = {
        /**
         * draw this bezierCurve into the provided 2D rendering context
         * @param context drawing-context of 2D canvas
         */
        draw: function (context) {

            context.beginPath();

            var start = new Point(this.p0.x, this.p0.y);

            context.moveTo(start.x, start.y);

            this.points = [];
            this.points.push(start);

            for (var i = 1; i <= this.curve.segments; i++) {

                var t = 1 / this.curve.segments * i;

                var point = this.bezierFunction(t);

                this.points.push(point);

                context.lineTo(point.x, point.y);
            }

            // set drawing style
            context.lineWidth = this.lineStyle.width;
            context.strokeStyle = this.lineStyle.color;

            // actually start drawing
            context.stroke();

            if (this.curve.ticks) {
                this.curve.drawTicks(context, this.points, this.lineStyle.width);
            }

        },
        /**
         * bezierfunction from presentation
         * @param t point to calulate for
         * @returns {Point} the bezier point with x and y coords
         */
        bezierFunction: function (t) {
            var _bezier = this;
            var bezierCalculation = function (coord, t) {
                return (Math.pow(1 - t, 3) * _bezier.p0[coord]) + (3 * Math.pow(1 - t, 2) * t * _bezier.p1[coord]) + (3 * (1 - t) * Math.pow(t, 2) * _bezier.p2[coord]) + (Math.pow(t, 3) * _bezier.p3[coord]);
            };
            return new Point(bezierCalculation("x", t), bezierCalculation("y", t));
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
         * test whether the mouse position is on the one of the points of the bezierCurve
         * @param context drawing-context of 2D canvas
         * @param pos {Point} currentPosition of the mouse
         * @returns {boolean} true if hit, false else
         */
        isHit: function (context, pos) {

            for (var i = 1; i <= this.curve.segments; i++) {

                // calculate the two t
                var t0 = 1 / this.curve.segments * i - 1;
                var t1 = 1 / this.curve.segments * i;

                var point0 = this.bezierFunction(t0);
                var point1 = this.bezierFunction(t1);

                var t = vec2.projectPointOnLine(pos, point0, point1);

                var isHit = this.curve.isHit(pos, point0, point1, t, this.lineStyle.width);

                if (isHit) {
                    return true;
                }

                point0 = point1;
            }

            return false;
        },

        /**
         * list of draggers to manipulate this line
         * @returns {Array} list of PointDragger
         */
        createDraggers: function () {

            var draggerStyle = {
                radius: 4,
                color: this.lineStyle.color,
                width: 0,
                fill: true
            };

            var draggers = [];

            var _this = this;

            var getP0 = function () {
                return _this.p0;
            };
            var setP0 = function (dragEvent) {
                _this.p0 = dragEvent.position;
            };
            var getP1 = function () {
                return _this.p1;
            };
            var setP1 = function (dragEvent) {
                _this.p1 = dragEvent.position;
            };
            var getP2 = function () {
                return _this.p2;
            };
            var setP2 = function (dragEvent) {
                _this.p2 = dragEvent.position;
            };
            var getP3 = function () {
                return _this.p3;
            };
            var setP3 = function (dragEvent) {
                _this.p3 = dragEvent.position;
            };

            // set next position for connecting points
            draggers.push(new PointDragger(getP0, setP0, draggerStyle, getP1));
            draggers.push(new PointDragger(getP1, setP1, draggerStyle, getP2));
            draggers.push(new PointDragger(getP2, setP2, draggerStyle, getP3));
            draggers.push(new PointDragger(getP3, setP3, draggerStyle));

            return draggers;
        },
        /**
         * describes a BezierCurve with its parameters
         * @returns {String} representation of this BezierCurve
         */
        toString: function () {
            return "BezierCurve=[p0: " + this.p0 + ", p1: " + this.p1 + ", p2: " + this.p2 + ", p3: " + this.p3 + ", " + this.curve.toString() + "]";
        }
    };

    return BezierCurve;

})); // define

    
