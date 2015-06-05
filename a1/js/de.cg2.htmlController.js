/**
 * JavaScript / Canvas teaching framwork
 * (C)opyright Hartmut Schirmacher, hschirmacher.beuth-hochschule.de
 *
 * @module: htmlController
 * @requires: jquery
 * @requires: de.cg2.straightLine
 * @requires: de.cg2.point
 * @requires: de.cg2.circle
 * defines callback functions for communicating with various HTML elements on the page, e.g. buttons and parameter fields.
 */
var de = de || {};
de.cg2 = de.cg2 || {};

/**
 * requireJS module definition
 */
define(["jquery", "de.cg2.straightLine", "de.cg2.point", "de.cg2.circle", "de.cg2.parametricCurve", "de.cg2.bezierCurve"], (function ($, StraightLine, Point, Circle, ParametricCurve, BezierCurve) {
    "use strict";

    /**
     * define callback functions to react to changes in the HTML page and provide them with a closure defining context and scene
     * @param context drawing-context of the elememt
     * @param scene {Scene} instance of the scene used by this instance
     * @param sceneController {SceneController} instance of the sceneController used by this instance
     * @constructor
     */
    function HtmlController(context, scene, sceneController) {
        /**
         * generate random X coordinate within the canvas
         * @returns {number} random number
         */
        var randomX = function () {
            return Math.floor(Math.random() * (context.canvas.width - 10)) + 5;
        };

        /**
         * generate random Y coordinate within the canvas
         * @returns {number} random number
         */
        var randomY = function () {
            return Math.floor(Math.random() * (context.canvas.height - 10)) + 5;
        };

        /**
         * generate random X coordinate within the canvas
         * @returns {number} random number
         */
        var randomNumber = function () {
            return Math.abs(Math.random() * ((Math.min(context.canvas.width, context.canvas.height) / 2)) - 10);
        };

        /**
         * generate random color in hex notation
         * @returns {String} random hex-color-code
         */
        var randomColor = function () {

            // convert a byte (0...255) to a 2-digit hex string
            var toHex2 = function (byte) {
                var s = byte.toString(16); // convert to hex string
                if (s.length === 1) {
                    s = "0" + s; // pad with leading 0
                }
                return s;
            };

            var r = Math.floor(Math.random() * 25.9) * 10;
            var g = Math.floor(Math.random() * 25.9) * 10;
            var b = Math.floor(Math.random() * 25.9) * 10;

            // convert to hex notation
            return "#" + toHex2(r) + toHex2(g) + toHex2(b);
        };


        /**
         * event handler for "new line button".
         */
        $(".objectCreate").on("click", function () {

            var $this = $(this);
            var id = $this.attr("id").toLowerCase().trim();

            // create the actual line and add it to the scene
            var style = {
                width: Math.floor(Math.random() * 3) + 1,
                color: randomColor()
            };

            var item;

            if (id === "line") {
                item = createRandomLine(style);
            } else if (id === "circle") {
                item = createRandomCircle(style);
            } else if (id === "parametric-curve") {
                item = createRandomParametricCurve();
            } else if (id === "bezier-curve") {
                item = createRandomBezierCurve();
            } else {
                throw new Error("Did not found geometry");
            }

            // adds the new object to scene
            scene.addObjects([item]);

            // deselect all objects, then select the newly created object
            sceneController.deselect(null);
            sceneController.select(item); // this will also redraw

        });

        function createRandomLine(style) {
            var a = new Point(randomX(), randomY());
            var b = new Point(randomX(), randomY());
            return new StraightLine(a, b, style);
        }

        function createRandomCircle(style) {
            var c = new Point(randomX(), randomY());
            var r = randomNumber();
            return new Circle(c, r, style);
        }

        function createRandomParametricCurve() {
            return new ParametricCurve();
        }

        function createRandomBezierCurve() {
            var a = new Point(randomX(), randomY());
            var b = new Point(randomX(), randomY());
            var c = new Point(randomX(), randomY());
            var d = new Point(randomX(), randomY());
            return new BezierCurve(a, b, c, d);
        }

    }

    return HtmlController;

}));



            
