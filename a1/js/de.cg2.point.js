/**
 *  JavaScript / Canvas teaching framwork
 * (C)opyright Michael Duve
 *
 *  @module: Point
 *
 *  A simple representation point width coord x and y
 */

var de = de || {};
de.cg2 = de.cg2 || {};

/**
 *  requireJS module definition
 */
define([], (function () {
    "use strict";

    /**
     * initializes a new instance of Point
     * @param x {Number} coordinate x of point (initially 0)
     * @param y {Number} coordinate y of point (initially 0)
     * @constructor
     */
    function Point(x, y) {
        this.x = x || 0;
        this.y = y || 0;
    }

    Point.prototype = {
        /**
         * describes a point with its coordinates
         * @returns {String} representation of this point
         */
        toString: function () {
            return "[" + this.x + ", " + this.y + "]";
        }
    };

    return Point;

})); // define

    
