/*global mat4*/
/* requireJS module definition */
window.define(["jquery", "vbo", "scene_node", "gl-matrix", "models/cube", "models/band", "models/parametric", "models/triangle"], (function ($, vbo, SceneNode, glmatrix, Cube, Band, ParametricSurface, Triangle) {
    "use strict";

    // constructor, takes WebGL context object as argument
    var Robot = function (gl, programs, settings) {
        var rotation = {
            head: 0
        };
        this.settings = {
            headSize: {
                w: 0.2,
                h: 0.2,
                d: 0.2
            },
            neckSize: {
                w: 0.1,
                h: 0.05,
                d: 0.1
            },
            eyesSize: {
                w: 0.05,
                h: 0.025,
                d: 0.05
            },
            bodySize: {
                w: 0.5,
                h: 1.0,
                d: 0.3
            },
            hatSize: {
                w: 0.1,
                h: 0.2,
                d: 0.2
            },
            shoulderSize: {
                w: 0.2,
                h: 0.1,
                d: 0.1
            },
            armSize: {
                w: 0.1,
                h: 0.5,
                d: 0.1
            },
            elbowSize: {
                w: 0.1,
                h: 0.1,
                d: 0.1
            },
            uArmSize: {
                w: 0.1,
                h: 0.4,
                d: 0.1
            },
            wristSize: {
                w: 0.1,
                h: 0.1,
                d: 0.1
            },
            handSize: {
                w: 0.1,
                h: 0.1,
                d: 0.3
            }
        };

        $.extend(this.settings, settings || {});

        var cube = new Cube(gl);

        var band = new Band(gl, {
            radius: 0.5,
            height: 1,
            segments: 30,
            wireframe: true,
            solid: true
        });

        var wireframeBand = new Band(gl, {
            radius: 0.5,
            height: 1,
            segments: 30,
            wireframe: true,
            solid: false
        });

        var hatFunc = function (u, v) {
            return [
                Math.sin(v) * Math.cos(u),
                (Math.cos(v) * Math.cos(v)) * (2 + Math.cos(v)) / (3 + (Math.sin(v) * Math.sin(v))),
                Math.sin(v) * Math.sin(u)
            ];
        };
        var hatConfig = {
            "uMin": 0,
            "uMax": 2 * Math.PI,
            "vMin": 0,
            "vMax": Math.PI,
            "uSegments": 40,
            "vSegments": 20,
            solid: true
        };
        var hatConfigWire = {
            "uMin": 0,
            "uMax": 2 * Math.PI,
            "vMin": 0,
            "vMax": Math.PI,
            "uSegments": 40,
            "vSegments": 20,
            wireframe: true
        };

        var armConfig = {
            "uMin": -Math.PI,
            "uMax": Math.PI,
            "vMin": -Math.PI,
            "vMax": Math.PI,
            "uSegments": 20,
            "vSegments": 20,
            solid: true
        };
        var armConfigWire = {
            "uMin": -Math.PI,
            "uMax": Math.PI,
            "vMin": -Math.PI,
            "vMax": Math.PI,
            "uSegments": 20,
            "vSegments": 20,
            wireframe: true
        };
        var armFunc = function (u, v) {
            return [
                0.5 * Math.sin(u) * Math.cos(v),
                0.5 * Math.sin(u) * Math.sin(v),
                0.5 * Math.cos(u)
            ];
        };
        var handConfig = {
            "uMin": -Math.PI,
            "uMax": Math.PI,
            "vMin": -Math.PI,
            "vMax": Math.PI,
            "uSegments": 20,
            "vSegments": 20,
            solid: true
        };
        var handConfigWire = {
            "uMin": -Math.PI,
            "uMax": Math.PI,
            "vMin": -Math.PI,
            "vMax": Math.PI,
            "uSegments": 20,
            "vSegments": 20,
            wireframe: true
        };

        var handFunc = function(u,v) {

            //Quelle: http://www.ssicom.org/js/x910511.htm
            var cosh = function (aValue) {
                var term1 = Math.pow(Math.E, aValue);
                var term2 = Math.pow(Math.E, -aValue);
                return ((term1+term2)/2);
            };

            //Quelle: http://www.ssicom.org/js/x911035.htm
            var sinh = function (aValue) {
                var term1 = Math.pow(Math.E, aValue);
                var term2 = Math.pow(Math.E, -aValue);
                return ((term1-term2)/2);
            };

            return [
                sinh(v) * Math.cos(25*u) / (1+ cosh(u) * cosh(v)),
                sinh(v) * Math.sin(25*u) / (1+ cosh(u) * cosh(v)),
                cosh(v) * sinh(u) / (1+ cosh(u) * cosh(v))
            ];
        };

        var hand = new ParametricSurface(gl, handFunc, handConfig);
        var handWire = new ParametricSurface(gl, handFunc, handConfigWire);

        var ellipsoid = new ParametricSurface(gl, armFunc, armConfig);
        var ellipsoidWire = new ParametricSurface(gl, armFunc, armConfigWire);

        var hatParametric = new ParametricSurface(gl, hatFunc, hatConfig);
        var hatParametricWire = new ParametricSurface(gl, hatFunc, hatConfigWire);

        // skelett
        this.head = new SceneNode("head");
        var headCenter = [0, (this.settings.neckSize.h / 2 + (this.settings.headSize.h / 2)), 0];
        mat4.translate(this.head.transform(), headCenter);

        this.hat = new SceneNode("hat");
        mat4.translate(this.hat.transform(), [0, this.settings.headSize.h / 2, 0]);

        this.leftEye = new SceneNode("eye left");
        mat4.translate(this.leftEye.transform(), [-((1 / 12 * this.settings.headSize.w) + this.settings.eyesSize.w / 2), (1 / 6 * this.settings.headSize.h), this.settings.headSize.d / 2]);
        this.rightEye = new SceneNode("eye right");
        mat4.translate(this.rightEye.transform(), [((1 / 12 * this.settings.headSize.w) + this.settings.eyesSize.w / 2), (1 / 6 * this.settings.headSize.h), this.settings.headSize.d / 2]);

        this.neck = new SceneNode("neck");
        mat4.translate(this.neck.transform(), [0, ((this.settings.bodySize.h / 2) + (this.settings.neckSize.h / 2)), 0]);

        this.rShoulder = new SceneNode("right shoulder");
        mat4.translate(this.rShoulder.transform(), [(this.settings.bodySize.w / 2) + (this.settings.shoulderSize.h / 2), (this.settings.bodySize.h / 2) - this.settings.shoulderSize.w / 2, 0]);
        this.lShoulder = new SceneNode("left shoulder");
        mat4.translate(this.lShoulder.transform(), [-((this.settings.bodySize.w / 2) + (this.settings.shoulderSize.h / 2)), (this.settings.bodySize.h / 2) - this.settings.shoulderSize.w / 2, 0]);

        this.rElbow = new SceneNode("right elbow");
        mat4.translate(this.rElbow.transform(), [0, -(this.settings.armSize.h / 2), 0]);
        this.lElbow = new SceneNode("left elbow");
        mat4.translate(this.lElbow.transform(), [0, -(this.settings.armSize.h / 2), 0]);

        this.rArm = new SceneNode("right arm");
        mat4.translate(this.rArm.transform(), [this.settings.shoulderSize.h / 2, -(this.settings.shoulderSize.h / 2) - this.settings.shoulderSize.h / 2 * 3, 0]);
        this.lArm = new SceneNode("left arm");
        mat4.translate(this.lArm.transform(), [-(this.settings.shoulderSize.h / 2), -(this.settings.shoulderSize.h / 2) - this.settings.shoulderSize.h / 2 * 3, 0]);

        this.rUArm = new SceneNode("right underarm");
        mat4.translate(this.rUArm.transform(), [0, -(this.settings.uArmSize.h/2), 0]);
        this.lUArm = new SceneNode("left underarm");
        mat4.translate(this.lUArm.transform(), [0, -(this.settings.uArmSize.h/2), 0]);

        this.rWrist = new SceneNode("right wrist");
        mat4.translate(this.rWrist.transform(), [0, -(this.settings.uArmSize.h/2), 0]);
        this.lWrist = new SceneNode("left wrist");
        mat4.translate(this.lWrist.transform(), [0, -(this.settings.uArmSize.h/2), 0]);

        this.rHand = new SceneNode("right hand");
        mat4.translate(this.rHand.transform(), [0, -(this.settings.wristSize.h/2), 0]);
        this.lHand = new SceneNode("left hand");
        mat4.translate(this.lHand.transform(), [0, -(this.settings.wristSize.h/2), 0]);


        this.body = new SceneNode("body");

        // skins
        var bodySkin = new SceneNode("body skin");
        bodySkin.add(cube, programs.vertexColor);
        mat4.scale(bodySkin.transform(), getDimensionAsArray(this.settings.bodySize));

        var headSkin = new SceneNode("head skin");
        headSkin.add(cube, programs.vertexColor);
        mat4.scale(headSkin.transform(), getDimensionAsArray(this.settings.headSize));

        var neckSkin = new SceneNode("neck skin");
        neckSkin.add(wireframeBand, programs.uniColor);
        mat4.scale(neckSkin.transform(), getDimensionAsArray(this.settings.neckSize));

        var hatSkin = new SceneNode("hat skin");
        hatSkin.add(hatParametric, programs.red);
        hatSkin.add(hatParametricWire, programs.uniColor);
        mat4.scale(hatSkin.transform(), getDimensionAsArray(this.settings.hatSize));

        var leftEyeSkin = new SceneNode("eye skin");
        leftEyeSkin.add(cube, programs.red);
        mat4.rotate(leftEyeSkin.transform(), 0.5 * Math.PI, [1, 0, 0]);
        mat4.scale(leftEyeSkin.transform(), getDimensionAsArray(this.settings.eyesSize));

        var rightEyeSkin = new SceneNode("eye skin");
        rightEyeSkin.add(band, programs.uniColor);
        mat4.rotate(rightEyeSkin.transform(), 0.5 * Math.PI, [1, 0, 0]);
        mat4.scale(rightEyeSkin.transform(), getDimensionAsArray(this.settings.eyesSize));

        var shoulderSkin = new SceneNode("shoulder skin");
        shoulderSkin.add(wireframeBand, programs.uniColor);
        shoulderSkin.add(band, programs.red);
        mat4.rotate(shoulderSkin.transform(), 0.5 * Math.PI, [0, 0, 1]);
        mat4.scale(shoulderSkin.transform(), getDimensionAsArray(this.settings.shoulderSize));

        var armSkin = new SceneNode("arm skin");
        armSkin.add(ellipsoidWire, programs.uniColor);
        armSkin.add(ellipsoid, programs.red);
        mat4.scale(armSkin.transform(), getDimensionAsArray(this.settings.armSize));

        var elbowSkin = new SceneNode("elbow skin");
        elbowSkin.add(wireframeBand, programs.uniColor);
        elbowSkin.add(band, programs.red);
        mat4.scale(elbowSkin.transform(), getDimensionAsArray(this.settings.elbowSize));

        var uArmSkin = new SceneNode("underarm skin");
        uArmSkin.add(ellipsoidWire, programs.uniColor);
        uArmSkin.add(ellipsoid, programs.red);
        mat4.scale(uArmSkin.transform(), getDimensionAsArray(this.settings.uArmSize));

        var wristSkin = new SceneNode("wrist skin");
        wristSkin.add(wireframeBand, programs.uniColor);
        wristSkin.add(band, programs.red);
        mat4.scale(wristSkin.transform(), getDimensionAsArray(this.settings.wristSize));

        var handSkin = new SceneNode("hand skin");
        handSkin.add(handWire, programs.uniColor);
        handSkin.add(hand, programs.red);
        mat4.rotate(handSkin.transform(), -0.5*Math.PI, [1,0,0]);
        mat4.scale(handSkin.transform(), getDimensionAsArray(this.settings.handSize));

        // connect skeleton
        this.body.add(this.neck);
        this.body.add(this.rShoulder);
        this.body.add(this.lShoulder);

        this.rShoulder.add(this.rArm);
        this.lShoulder.add(this.lArm);

        this.rArm.add(this.rElbow);
        this.lArm.add(this.lElbow);

        this.rElbow.add(this.rUArm);
        this.lElbow.add(this.lUArm);

        this.rUArm.add(this.rWrist);
        this.lUArm.add(this.lWrist);

        this.rWrist.add(this.rHand);
        this.lWrist.add(this.lHand);

        this.neck.add(this.head);

        this.head.add(this.hat);
        this.head.add(this.leftEye);
        this.head.add(this.rightEye);

        // connect skin to skeleton
        this.body.add(bodySkin);
        this.head.add(headSkin);
        this.neck.add(neckSkin);
        this.leftEye.add(leftEyeSkin);
        this.rightEye.add(rightEyeSkin);
        this.hat.add(hatSkin);
        this.rShoulder.add(shoulderSkin);
        this.lShoulder.add(shoulderSkin);
        this.rArm.add(armSkin);
        this.lArm.add(armSkin);
        this.rElbow.add(elbowSkin);
        this.lElbow.add(elbowSkin);
        this.rUArm.add(uArmSkin);
        this.lUArm.add(uArmSkin);
        this.lWrist.add(wristSkin);
        this.rWrist.add(wristSkin);
        this.lHand.add(handSkin);
        this.rHand.add(handSkin);
    };

    function getDimensionAsArray(object) {
        var array = [];
        for (var property in object) {
            if (object.hasOwnProperty(property)) {
                if (property === "w") {
                    array[0] = object[property];
                } else if (property === "h") {
                    array[1] = object[property];
                } else if (property === "d") {
                    array[2] = object[property];
                }
            }
        }
        return array;
    }

    // draw method: activate buffers and issue WebGL draw() method
    Robot.prototype = {
        draw: function (gl, program, transformation) {
            this.body.draw(gl, program, transformation);
        },
        rotate: function (bodyPart, angle) {
            switch (bodyPart) {
                case "head":
                    mat4.rotate(this.neck.transformation, angle, [0, 1, 0]);
                    break;
                case "rArm":
                    mat4.rotate(this.rShoulder.transformation, angle, [1, 0, 0]);
                    break;
                case "lArm":
                    mat4.rotate(this.lShoulder.transformation, angle, [1, 0, 0]);
                    break;
                case "rUArm":
                    mat4.rotate(this.rElbow.transformation, angle, [1, 0, 0]);
                    break;
                case "lUArm":
                    mat4.rotate(this.lElbow.transformation, angle, [1, 0, 0]);
                    break;
                case "lWrist":
                    mat4.rotate(this.lWrist.transformation, angle, [0, 1, 0]);
                    break;
                case "rWrist":
                    mat4.rotate(this.rWrist.transformation, angle, [0, 1, 0]);
                    break;
                default:
                    window.console.log("axis " + bodyPart + " not implemented.");
                    break;
            }
        }
    };

    // this module only returns the constructor function
    return Robot;

})); // define

    
