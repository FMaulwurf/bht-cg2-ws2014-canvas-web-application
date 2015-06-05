/**
 * JavaScript / Canvas teaching framwork
 * (C)opyright Hartmut Schirmacher, hschirmacher.beuth-hochschule.de
 *
 * @module main: CG2 Aufgabe 1, Winter 2014/2015
 *
 * main program, to be called once the document has loaded and the DOM has been constructed
 */

var de = de || {};
de.cg2 = de.cg2 || {};

/**
 *  RequireJS alias/path configuration (http://requirejs.org/)
 */
requirejs.config({
    paths: {
        // jquery library
        "jquery": 'lib/jquery-2.1.1.min',
        // gl-matrix library
        "gl-matrix": "lib/gl-matrix-1.3.7"
    }
});

/**
 * The function defined below is the "main" function, it will be called once all prerequisites listed
 * in the define() statement are loaded.
 */
define(["jquery", "gl-matrix", "de.cg2.util", "de.cg2.scene", "de.cg2.sceneController", "de.cg2.htmlController", "de.cg2.parametricCurve", "de.cg2.circle", "de.cg2.straightLine", "de.cg2.bezierCurve"],
    function ($, glmatrix, util, Scene, SceneController, HtmlController, ParametricCurve, Circle, StraightLine, BezierCurve) {
        "use strict";

        var $canvasWrapper = $("#drawing_area");
        var $editWrapper = $("#edit-object");

        var $allFields = $editWrapper.find(".object");
        var $lineFields = $editWrapper.find(".object.line");
        var $circleFields = $editWrapper.find(".object.circle");
        var $parametricCurveFields = $editWrapper.find(".object.parametric-curve");
        var $bezierCurveFields = $editWrapper.find(".object.bezier-curve");

        var $lineWidthSlider = $editWrapper.find("#show-range");
        var $lineWidthInput = $editWrapper.find(".show-range");

        var $colorPicker = $editWrapper.find("#color-picker");

        var $radiusSlider = $editWrapper.find("#show-radius");
        var $radiusInput = $editWrapper.find(".show-radius");

        var $manipulateInputFields = $editWrapper.find(".manipulateInput");
        var $manipulateFunctions = $editWrapper.find(".function");

        var $funcOne = $editWrapper.find("#function1");
        var $funcTwo = $editWrapper.find("#function2");
        var $minT = $editWrapper.find("#minimum-t");
        var $maxT = $editWrapper.find("#maximum-t");
        var $segments = $editWrapper.find("#segment-amount");
        var $ticks = $editWrapper.find("#tick-marker");


        var currentlyActiveObject = null;

        // get the canvas element to be used for drawing
        var canvas = $canvasWrapper[0];
        if (!canvas) {
            throw new util.RuntimeError("drawing_area not found", this);
        }

        // get 2D rendering context for canvas element
        var context = canvas.getContext("2d");
        if (!context) {
            throw new util.RuntimeError("could not create 2D rendering context", this);
        }

        // create scene with background color
        var scene = new Scene("#fff");

        // create SceneController to process and map events
        var sceneController = new SceneController(context, scene);

        // callbacks for the various HTML elements (buttons, ...)
        var htmlController = new HtmlController(context, scene, sceneController);

        // draw scene initially
        scene.draw(context);

        bindEvents();

        function bindEvents() {

            // listen for slider moving
            $lineWidthSlider.on("input", function () {
                setNewValue($lineWidthSlider.val(), "line", $lineWidthInput);
            });

            $radiusSlider.on("input", function () {
                setNewValue($radiusSlider.val(), "radius", $radiusInput);
            });

            function setNewValue(value, changeValue, inputField) {
                // save new value
                var newValue = parseFloat(value);
                // update the number in box below slider
                if (inputField) {
                    inputField.text(newValue);
                }
                // if there is a selected object
                if (currentlyActiveObject) {
                    if (changeValue === "radius") {
                        currentlyActiveObject.radius = newValue;
                    } else {
                        currentlyActiveObject.lineStyle.width = newValue;
                    }
                    // redraw
                    scene.draw(context);
                }
            }

            // listen for changing color
            $colorPicker.on("input", function () {
                // save new value
                var newValue = $colorPicker.val();
                // if there is a selected object
                if (currentlyActiveObject) {
                    currentlyActiveObject.lineStyle.color = newValue;
                    // redraw
                    scene.draw(context);
                }
            });


            $manipulateFunctions.on("input", function () {
                var $this = $(this);
                var newValue = $this.val();
                // which function should be manipulated
                var manipulate = $this.data("manipulate");
                // try to parse the functions
                try {
                    if (currentlyActiveObject) {
                        currentlyActiveObject[manipulate] = getFunction(newValue);
                        // redraw
                        scene.draw(context);
                    }
                } catch (msg) {
                    console.warn("Parsing your function failed, please try again");
                }
            });

            // Parsing functions
            var getFunction = function (fx) {
                return eval("(function(t) { return " + fx + ";});");
            };

            $manipulateInputFields.on("input", function () {
                var $this = $(this);
                var newValue = parseFloat($(this).val());
                // what value should be manipulated
                var manipulate = $this.data("manipulate");
                // if its not a number do nothing
                if (isNaN(newValue)) {
                    return;
                }
                if (currentlyActiveObject) {
                    if (manipulate === "segments") {
                        currentlyActiveObject.setSegments(newValue);
                    } else {
                        currentlyActiveObject[manipulate] = newValue;
                    }
                    // redraw
                    scene.draw(context);
                }
            });

            $ticks.on("change", function () {
                if (currentlyActiveObject) {
                    currentlyActiveObject.setTicks($(this).prop("checked"));
                    // redraw
                    scene.draw(context);
                }
            });

            // if there is an object select
            sceneController.onSelection(function () {

                // show editing fieldset
                $editWrapper.show();

                // save currently selected element globally
                currentlyActiveObject = this.getSelectedObject();

                $allFields.hide();

                if (currentlyActiveObject instanceof StraightLine) {
                    $lineFields.show();
                } else if (currentlyActiveObject instanceof Circle) {
                    $circleFields.show();
                    $radiusInput.text(currentlyActiveObject.radius);
                    $radiusSlider.val(currentlyActiveObject.radius);
                } else if (currentlyActiveObject instanceof ParametricCurve) {
                    // show parametricCurve editing fields
                    $parametricCurveFields.show();
                    // update fields
                    $minT.val(currentlyActiveObject.tMin);
                    $maxT.val(currentlyActiveObject.tMax);
                    $segments.val(currentlyActiveObject.curve.segments);
                    $ticks.prop("checked", currentlyActiveObject.curve.ticks);
                    // convert function to Strings
                    $funcOne.val(convertFunctionToString(currentlyActiveObject.fOfT));
                    $funcTwo.val(convertFunctionToString(currentlyActiveObject.gOfT));
                } else if (currentlyActiveObject instanceof BezierCurve) {
                    $bezierCurveFields.show();
                    $segments.val(currentlyActiveObject.curve.segments);
                    $ticks.prop("checked", currentlyActiveObject.curve.ticks);
                }

                // change attributes
                $lineWidthSlider.val(currentlyActiveObject.lineStyle.width);
                $colorPicker.val(currentlyActiveObject.lineStyle.color);

                // change slider output
                $lineWidthInput.text(currentlyActiveObject.lineStyle.width);

            });

            function convertFunctionToString(func) {
                return func.toString().split("return")[1].split(";")[0].trim();
            }

        }

    });
        

