/**
 * JavaScript / Canvas teaching framwork
 * (C)opyright Hartmut Schirmacher, hschirmacher.beuth-hochschule.de
 *
 * @module: vec2
 */

/**
 *  requireJS module definition
 */
define(["de.cg2.point"], (function (Point) {
    "use strict";

    /**
     * Some simple 2D vector operations based on [x,y] arrays
     */
    var vec2 = {
        /**
         * add two vectors
         * @param v0 {Point} vector 1
         * @param v1 {Point} vector 2
         * @returns {Point} sum of the vectors
         */
        add: function (v0, v1) {
            return new Point(v0.x + v1.x, v0.y + v1.y);
        },
        /**
         * subtract two vectors
         * @param v0 {Point} vector 1
         * @param v1 {Point} vector 2
         * @returns {Point} sum of the vectors
         */
        sub: function (v0, v1) {
            return new Point(v0.x - v1.x, v0.y - v1.y);
        },
        /**
         * dot product / scalar product of two vectors
         * @param v0 {Point} vector 1
         * @param v1 {Point} vector 2
         * @returns {number} new value
         */
        dot: function (v0, v1) {
            return v0.x * v1.x + v0.y * v1.y;
        },
        /**
         * multiply vector by scalar, return new vector
         * @param v {Point} vector 1
         * @param s {number} scalar of vector
         * @returns {Point} new value
         */
        mult: function (v, s) {
            return new Point(v.x * s, v.y * s);
        },
        /**
         * squared length of a vector
         * @param v the vector to be squared
         * @returns {number} new value
         */
        length2: function (v) {
            return this.dot(v, v);
        },
        /**
         * length of a vector
         * @param v {Point} the vector to get length from
         * @returns {number} new value
         */
        length: function (v) {
            return Math.sqrt(this.dot(v, v));
        },
        //
        /**
         * project a point onto a line defined by two points. return scalar parameter of where point p is projected
         * onto the line. the line segment between p0 and 01 corresponds to the value range [0:1]
         * @param p {Point} point to project onto line
         * @param p0 {Point} start-point of line
         * @param p1 {Point} end-point of line
         * @returns {number} new value
         */
        projectPointOnLine: function (p, p0, p1) {
            var dp = this.sub(p, p0);
            var dv = this.sub(p1, p0);
            return this.dot(dp, dv) / this.dot(dv, dv);
        },
        pythagoras: function (a, b) {
            return Math.sqrt((a * a) + (b * b));
        }
    };

    return vec2;

})); // define

    
