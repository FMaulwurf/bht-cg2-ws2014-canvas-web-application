/**
 * JavaScript / Canvas teaching framwork
 * (C)opyright Hartmut Schirmacher, hschirmacher.beuth-hochschule.de
 *
 * @module: sceneController
 * @requires: de.cg2.util
 * @requires: de.cg2.scene
 * @requires: de.cg2.point
 *
 * This module defines a constructor function SceneController.
 *
 * A SceneController object takes events on the canvas object
 * and maps them to events for the scene objects. The controller
 * takes the drawing/depth order into account, defines
 * high-level events like "mouse drag", and handles the selection
 * and deselection of objects.
 */

var de = de || {};
de.cg2 = de.cg2 || {};

/**
 *  requireJS module definition
 */
define(["de.cg2.util", "de.cg2.scene", "de.cg2.point"], (function (util, Scene, Point) {
    "use strict";

    /**
     * A SceneController handles events on the canvas and triggers the respective actions on objects in the scene.
     * @param context the canvas' 2D rendering context
     * @param scene {Scene} an object with a draw() method used to trigger a redraw
     * @constructor
     */
    function SceneController(context, scene) {
        this.context = context || util.fatalError(new Error("Dragger: no context"));
        this.canvas = context.canvas || util.fatalError(new Error("Dragger: no canvas"));
        this.scene = scene || util.fatalError(new Error("Dragger: no scene"));
        this.isDragging = false; // are we currently in dragging mode?
        this.dragObj = null;  // which object is currently active?
        this.dragStartPos = new Point(0, 0); // position when dragging was started
        this.dragLastPos = new Point(0, 0); // last position used in dragging
        this.selected = [];    // list of selected objects and their draggers
        this.selectCallback = null; // function to be called with currently selected obj
        this.changeCallback = null; // function to be called with currently selected obj

        // create event handlers with a closure containing
        // "tool" as a reference to this dragger
        var _controller = this;
        this.canvas.addEventListener('mousedown', (function (ev) {
            ev.preventDefault();
            _controller.mousedown(ev);
        }), false);
        this.canvas.addEventListener('mousemove', (function (ev) {
            ev.preventDefault();
            _controller.mousemove(ev);
        }), false);
        this.canvas.addEventListener('mouseup', (function (ev) {
            ev.preventDefault();
            _controller.mouseup(ev);
        }), false);

    }

    SceneController.prototype = {

        /**
         * Register a callback function for whenever the selection changes, The callback function will be called
         * with one parameter, which is the currently selected object.
         * @param func {Function} callback of onSelection listener
         */
        onSelection: function (func) {
            this.selectCallback = func;
        },

        /**
         * Register a callback for whenever an object is manipulated, The callback function will be called with one
         * parameter, which is the currently selected object.
         * @param func {Function} callback of onSelection listener
         */
        onObjChange: function (func) {
            this.changeCallback = func;
        },

        /**
         * get the currently selected object
         * @returns {*} currently selected object or null
         */
        getSelectedObject: function () {
            if (this.selected[0]) {
                return this.selected[0].obj;
            }
            return null;

        },

        /**
         * select an object by creating its draggers and adding them to the scene
         * @param obj {Object} an object which has draw-method
         */
        select: function (obj) {

            if (!obj) {
                throw new Error("SceneController.select(): no object provided");
            }

            // let the object create its draggers
            var draggers = obj.createDraggers();

            // store object and its draggers in an internal list
            this.selected.push({ "obj": obj, "draggers": draggers });

            // add draggers as scene objects so they get rendered
            this.scene.addObjects(draggers);

            // if it exists, trigger onSelection callback
            if (this.selectCallback) {
                this.selectCallback(obj);
            }

            // redraw
            this.scene.draw(this.context);

        },

        /**
         * deselect an object by destroying its draggers and  removing them from the scene obj is optional:
         * if undefined/null, deselect all objects
         * @param obj {Object} an object which has draw-method
         */
        deselect: function (obj) {

            // go backwards through list of currently selected objects
            for (var i = this.selected.length - 1; i >= 0; i -= 1) {

                // if no obj is specified, or if this object matches...
                if (!obj || this.selected[i].obj === obj) {

                    // remove draggers from scene
                    this.scene.removeObjects(this.selected[i].draggers);
                    // remove object from list
                    this.selected.splice(i, 1);

                }
            }

            // redraw
            this.scene.draw(this.context);
        },

        /**
         * Event handler: mouse button is pressed down.
         * determine which object is hit, remember it as the currently active object, and remember mouse position
         * @param event {Function} callback of the mousedown-listener
         */
        mousedown: function (event) {

            // get relative mouse position within canvas
            var pos = util.canvasPosition(event);

            // go through all scene elements in front-to-back order
            var objs = this.scene.getObjects("front-to-back");
            for (var i = 0; i < objs.length; i += 1) {

                // determine if object is right under the mouse cursor
                var obj = objs[i];
                if (obj.isHit && obj.isHit(this.context, pos)) {

                    // if so, the first object wins
                    this.dragObj = obj;
                    this.dragStartPos = pos;
                    this.dragLastPos = pos;

                    // if the object is not a dragger, then select it
                    if (!obj.isDragger) {
                        // select the object, deselect others
                        this.deselect(null);
                        this.select(obj);
                    }

                    // call the object's handler function, if existing
                    var clickEvent = {"position": pos};
                    this.isDragging = true;

                    if (obj && obj.mouseDown) {
                        obj.mouseDown(clickEvent);
                    }

                    // redraw the scene
                    this.scene.draw(this.context);
                    return;

                }
            }

            // no foreground element was hit
            this.dragObj = null;

            // note: if you want the background of the scene to be clickable,
            // simply add a scene-filling rectangle.

        },

        /**
         * Event handler: called whenever mouse is moving (with buttons up or down, regardless)
         * @param event {Function} callback of the mousemove-listener
         */
        mousemove: function (event) {

            // get relative mouse position within canvas
            var pos = util.canvasPosition(event);

            // only do something if the mouse was previously pressed down
            if (this.isDragging) {

                // difference of current and last position
                var deltax = pos.x - this.dragLastPos.x;
                var deltay = pos.y - this.dragLastPos.y;

                // window.console.log("mouse drag by [" + deltax + "," + deltay + "]");

                // call the object's handler function, if existing
                var dragEvent = {
                    "position": pos,
                    "delta": new Point(deltax, deltay)
                };

                if (this.dragObj && this.dragObj.mouseDrag) {
                    this.dragObj.mouseDrag(dragEvent);
                }

                // remember current position
                this.dragLastPos = pos;

                // some parameter of the object may have changed...
                if (this.changeCallback) {
                    this.changeCallback(this.getSelectedObject());
                }

                // redraw the scene
                this.scene.draw(this.context);

            }
        },

        /**
         * Event handler: called when mouse button is released
         * @param event {Function} callback of the mouseup-listener
         */
        mouseup: function (event) {

            // call one last mouse move in case the position has changed
            this.mousemove(event);

            // get relative mouse position within canvas
            var pos = util.canvasPosition(event);

            // call mouseUp event handler of object
            var clickEvent = {
                "position": pos
            };

            if (this.dragObj && this.dragObj.mouseUp) {
                this.dragObj.mouseUp(clickEvent);
            }

            // reset dragging status
            this.isDragging = false;
        }
    };

    return SceneController;

})); // define
