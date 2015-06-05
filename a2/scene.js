/*global mat4*/
/*
 *
 * Module scene: Computergrafik 2, Aufgabe 2
 * (C)opyright Hartmut Schirmacher, hschirmacher.beuth-hochschule.de 
 *
 */


/* requireJS module definition */
window.define(["jquery", "gl-matrix", "program", "shaders", "models/band", "models/triangle", "models/cube",
        "models/parametric", "models/robot"],
    (function ($, glmatrix, Program, shaders, Band, Triangle, Cube, ParametricSurface, Robot) {

        "use strict";

        // simple scene: create some scene objects in the constructor, and
        // draw them in the draw() method
        var Scene = function (gl) {

            // store the WebGL rendering context
            this.gl = gl;

            // create all required GPU programs from vertex and fragment shaders
            this.programs = {};
            this.programs.red = new Program(gl,
                shaders.getVertexShader("red"),
                shaders.getFragmentShader("red")
            );
            this.programs.uniColor = new Program(gl,
                shaders.getVertexShader('unicolor'),
                shaders.getFragmentShader('unicolor')
            );

            this.programs.vertexColor = new Program(gl,
                shaders.getVertexShader("vertex_color"),
                shaders.getFragmentShader("vertex_color")
            );


            // create some objects to be drawn in this scene
            this.triangle = new Triangle(gl);
            this.cube = new Cube(gl);
            this.band = new Band(gl, {height: 0.4, drawStyle: "points"});
            this.wireframeBand = new Band(gl, {height: 0.4, wireframe: true});
            this.solidBand = new Band(gl, {height: 0.4, solid: true});

            // create a parametric surface to be drawn in this scene
            var positionFunc = function (u, v) {
                return [
                        0.5 * Math.sin(u) * Math.cos(v),
                        0.3 * Math.sin(u) * Math.sin(v),
                        0.9 * Math.cos(u)
                ];
            };
            var appleFunc = function (u, v) {
                return [
                        Math.cos(u) * (4 + 3.8 * Math.cos(v)),
                        Math.sin(u) * (4 + 3.8 * Math.cos(v)),
                        (Math.cos(v) + Math.sin(v) - 1) * (1 + Math.sin(v)) * Math.log(1 - Math.PI * v / 10) + 7.5 * Math.sin(v)
                ];
            };
            var fishFunc = function (u, v) {
                return [
                        (Math.cos(u) - Math.cos(2 * u)) * Math.cos(v) / 4,
                        (Math.sin(u) - Math.sin(2 * u)) * Math.sin(v) / 4,
                    Math.cos(u)
                ];
            };
            var config = {
                "uMin": -Math.PI,
                "uMax": Math.PI,
                "vMin": -Math.PI,
                "vMax": Math.PI,
                "uSegments": 40,
                "vSegments": 20
            };

            var appleConfig = {
                "uMin": 0,
                "uMax": 2 * Math.PI,
                "vMin": -Math.PI,
                "vMax": Math.PI,
                "uSegments": 40,
                "vSegments": 20
            };

            var fishConfig = {
                "uMin": 0,
                "uMax": Math.PI,
                "vMin": 0,
                "vMax": 2 * Math.PI,
                "uSegments": 40,
                "vSegments": 20
            };

            var robotConfig = {

            };

            this.robot = new Robot(gl, this.programs, robotConfig);

            this.ellipsoid = new ParametricSurface(gl, positionFunc, config);
            this.apple = new ParametricSurface(gl, appleFunc, appleConfig);
            this.fish = new ParametricSurface(gl, fishFunc, fishConfig);

            var wireframeEllipsoidConfig = $.extend({}, config, {wireframe: true});
            this.wireframeEllipsoid = new ParametricSurface(gl, positionFunc, wireframeEllipsoidConfig);

            var wireframeAppleConfig = $.extend({}, appleConfig, {wireframe: true});
            this.wireframeApple = new ParametricSurface(gl, appleFunc, wireframeAppleConfig);

            var wireframeFishConfig = $.extend({}, fishConfig, {wireframe: true});
            this.wireframeFish = new ParametricSurface(gl, fishFunc, wireframeFishConfig);

            var solidEllipsoidConfig = $.extend({}, config, {solid: true});
            this.solidEllipsoid = new ParametricSurface(gl, positionFunc, solidEllipsoidConfig);

            var solidAppleConfig = $.extend({}, appleConfig, {solid: true});
            this.solidApple = new ParametricSurface(gl, appleFunc, solidAppleConfig);

            var solidFishConfig = $.extend({}, fishConfig, {solid: true});
            this.solidFish = new ParametricSurface(gl, fishFunc, solidFishConfig);

            // initial position of the camera
            this.cameraTransformation = mat4.lookAt([0, 0.5, 3], [0, 0, 0], [0, 1, 0]);

            // transformation of the scene, to be changed by animation
            this.transformation = mat4.create(this.cameraTransformation);

            // the scene has an attribute "drawOptions" that is used by
            // the HtmlController. Each attribute in this.drawOptions
            // automatically generates a corresponding checkbox in the UI.
            this.drawOptions = {
                "Perspective Projection": true,
                "Show Triangle": false,
                "Show Cube": false,
                "Show Band": false,
                "Show Wireframe Band": false,
                "Show Solid Band": false,
                "Show Ellipsoid": false,
                "Show Wireframe Ellipsoid": false,
                "Show Solid Ellipsoid": false,
                "Show Apple": false,
                "Show Wireframe Apple": false,
                "Show Solid Apple": false,
                "Show Fish": false,
                "Show Wireframe Fish": false,
                "Show Solid Fish": false,
                "Show Robot": true
            };
        };

        // the scene's draw method draws whatever the scene wants to draw
        Scene.prototype.draw = function () {

            // just a shortcut
            var gl = this.gl;

            // set up the projection matrix, depending on the canvas size
            var aspectRatio = gl.drawingBufferWidth / gl.drawingBufferHeight;
            var projection = this.drawOptions["Perspective Projection"] ?
                mat4.perspective(45, aspectRatio, 0.01, 100) :
                mat4.ortho(-aspectRatio, aspectRatio, -1, 1, 0.01, 100);

            // set the uniform variables for all used programs
            for (var p in this.programs) {
                this.programs[p].use();
                this.programs[p].setUniform("projectionMatrix", "mat4", projection);
                this.programs[p].setUniform("modelViewMatrix", "mat4", this.transformation);
                this.programs[p].setUniform("uniColor", "vec4", [0, 0, 0, 1]);
            }

            // clear color and depth buffers
            gl.clearColor(0.7, 0.7, 0.7, 1.0);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            // set up depth test to discard occluded fragments
            gl.enable(gl.DEPTH_TEST);
            gl.depthFunc(gl.LESS);

            // draw the scene objects
            if (this.drawOptions["Show Triangle"]) {
                this.triangle.draw(gl, this.programs.vertexColor);
            }
            if (this.drawOptions["Show Cube"]) {
                this.cube.draw(gl, this.programs.vertexColor);
            }
            if (this.drawOptions["Show Band"]) {
                this.band.draw(gl, this.programs.red);
            }
            if (this.drawOptions["Show Solid Band"]) {
                this.solidBand.draw(gl, this.programs.red);
            }
            if (this.drawOptions["Show Wireframe Band"]) {
                this.wireframeBand.draw(gl, this.programs.uniColor);
            }
            if (this.drawOptions["Show Ellipsoid"]) {
                this.ellipsoid.draw(gl, this.programs.red);
            }
            if (this.drawOptions["Show Solid Ellipsoid"]) {
                this.solidEllipsoid.draw(gl, this.programs.red);
            }
            if (this.drawOptions["Show Wireframe Ellipsoid"]) {
                this.wireframeEllipsoid.draw(gl, this.programs.uniColor);
            }
            if (this.drawOptions["Show Apple"]) {
                this.apple.draw(gl, this.programs.red);
            }
            if (this.drawOptions["Show Solid Apple"]) {
                this.solidApple.draw(gl, this.programs.red);
            }
            if (this.drawOptions["Show Wireframe Apple"]) {
                this.wireframeApple.draw(gl, this.programs.uniColor);
            }
            if (this.drawOptions["Show Fish"]) {
                this.fish.draw(gl, this.programs.red);
            }
            if (this.drawOptions["Show Solid Fish"]) {
                this.solidFish.draw(gl, this.programs.red);
            }
            if (this.drawOptions["Show Wireframe Fish"]) {
                this.wireframeFish.draw(gl, this.programs.uniColor);
            }
            if (this.drawOptions["Show Robot"]) {
                this.robot.draw(gl, null, this.transformation);
            }
        };

        // the scene's rotate method is called from HtmlController, when certain
        // keyboard keys are pressed. Try Y and Shift-Y, for example.
        Scene.prototype.rotate = function (rotationAxis, angle) {

            // window.console.log("rotating around " + rotationAxis + " by " + angle + " degrees." );

            // degrees to radians
            angle = angle * Math.PI / 180;

            // manipulate the corresponding matrix, depending on the name of the joint
            switch (rotationAxis) {
                case "worldY":
                    mat4.rotate(this.transformation, angle, [0, 1, 0]);
                    break;
                case "worldX":
                    mat4.rotate(this.transformation, angle, [1, 0, 0]);
                    break;
                case "robotHead":
                    this.robot.rotate("head", angle);
                    break;
                case "robotRArm":
                    this.robot.rotate("rArm", angle);
                    break;
                case "robotLArm":
                    this.robot.rotate("lArm", angle);
                    break;
                case "robotLUArm":
                    this.robot.rotate("lUArm", angle);
                    break;
                case "robotRUArm":
                    this.robot.rotate("rUArm", angle);
                    break;
                case "robotRWrist":
                    this.robot.rotate("rWrist", angle);
                    break;
                case "robotLWrist":
                    this.robot.rotate("lWrist", angle);
                    break;
                default:
                    window.console.log("axis " + rotationAxis + " not implemented.");
                    break;
            }

            // redraw the scene
            this.draw();
        };

        return Scene;

    })); // define module
        

