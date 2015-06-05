/*
 *
 * Module main: CG2 Aufgabe 2 
 * (C)opyright Hartmut Schirmacher, hschirmacher.beuth-hochschule.de 
 *
 */

window.requirejs.config({
    paths: {
        // jquery library
        "jquery": '../lib/jquery-1.7.2.min',
        // gl-matrix library
        "gl-matrix": "../lib/gl-matrix-1.3.7"
    }
});


/*
 * The function defined below is the "main" module,
 * it will be called once all prerequisites listed in the
 * define() statement are loaded.
 *
 */

/* requireJS module definition */
window.define(["jquery", "gl-matrix", "webgl-debug", "animation", "scene", "html_controller"],
    (function ($, glmatrix, WebGLDebugUtils, Animation, Scene, HtmlController) {

        "use strict";

        /*
         * create an animation that rotates the scene around
         * the Y axis over time.
         */
        var makeAnimation = function (scene) {

            // create animation to rotate the scene
            var animation = new Animation((function (t, deltaT) {

                // rotation angle, depending on animation time
                var angle = deltaT / 1000 * animation.customSpeed; // in degrees

                // ask the scene to rotate around Y axis
                scene.rotate("worldY", angle);

                // (re-) draw the scene
                scene.draw();

            } )); // end animation callback

            // set an additional attribute that can be controlled from the outside
            animation.customSpeed = 20;

            return animation;

        };

        var makeRobotAnimation = function (scene) {

            var rotation = {
                head: {
                    min: -45,
                    max: 45,
                    maxReached: false,
                    minReached: false
                }
            };

            var dt = 0;

            // create animation to rotate the scene
            var animation = new Animation((function (t, deltaT) {

                // oscillation
                dt += deltaT * animation.customSpeed % 0.025;
                var oscillation_angle = -Math.sin(dt) - Math.cos(dt);

                var angle = deltaT / 1000 * animation.customSpeed; // in degrees


                scene.rotate("robotHead", oscillation_angle);
                scene.rotate("robotRArm", oscillation_angle);
                scene.rotate("robotLArm", angle);
                scene.rotate("robotRUArm", oscillation_angle);
                scene.rotate("robotLUArm", oscillation_angle);
                scene.rotate("robotRWrist", 5*angle);
                scene.rotate("robotLWrist", 5*angle);

                // (re-) draw the scene
                scene.draw();

            } )); // end animation callback

            // set an additional attribute that can be controlled from the outside
            animation.customSpeed = 20;

            return animation;

        };


        var makeWebGLContext = function (canvas_name) {

            // get the canvas element to be used for drawing
            var canvas = $("#" + canvas_name).get(0);
            if (!canvas) {
                throw "HTML element with id '" + canvas_name + "' not found";
            }

            // get WebGL rendering context for canvas element
            var gl;
            var options = {alpha: true, depth: true, antialias: true};
            gl = canvas.getContext("webgl", options) ||
                canvas.getContext("experimental-webgl", options);
            if (!gl) {
                throw "could not create WebGL rendering context";
            }

            // create a debugging wrapper of the context object
            var throwOnGLError = function (err, funcName, args) {
                throw WebGLDebugUtils.glEnumToString(err) + " was caused by call to: " + funcName;
            };
            //gl = WebGLDebugUtils.makeDebugContext(gl, throwOnGLError);

            return gl;
        };

        $(document).ready((function () {

            // create WebGL context object for the named canvas object
            var gl = makeWebGLContext("drawing_area");

            // create scene, create animation, and draw once
            var scene = new Scene(gl);
            var animation = makeAnimation(scene);
            var robotAnimation = makeRobotAnimation(scene);
            scene.draw();

            // mapping from character pressed on the keyboard to
            // rotation axis and angle
            var keyMap = {
                'x': {axis: "worldX", angle: 5.0},
                'X': {axis: "worldX", angle: -5.0},
                'y': {axis: "worldY", angle: 5.0},
                'Y': {axis: "worldY", angle: -5.0},
                'h': {axis: "robotHead", angle: 5.0},
                'H': {axis: "robotHead", angle: -5.0},
                'P': {axis: "robotRArm", angle: 5.0},
                'p': {axis: "robotRArm", angle: -5.0},
                'O': {axis: "robotLArm", angle: 5.0},
                'o': {axis: "robotLArm", angle: -5.0},
                'L': {axis: "robotRUArm", angle: 5.0},
                'l': {axis: "robotRUArm", angle: -5.0},
                'K': {axis: "robotLUArm", angle: 5.0},
                'k': {axis: "robotLUArm", angle: -5.0},
                'M': {axis: "robotRWrist", angle: 5.0},
                'm': {axis: "robotRWrist", angle: -5.0},
                'N': {axis: "robotLWrist", angle: 5.0},
                'n': {axis: "robotLWrist", angle: -5.0}

            };

            // create HtmlController that takes care of all interaction
            // of HTML elements with the scene and the animation
            var controller = new HtmlController(scene, animation, keyMap, robotAnimation);

        })); // $(document).ready()


    })); // define module
        

