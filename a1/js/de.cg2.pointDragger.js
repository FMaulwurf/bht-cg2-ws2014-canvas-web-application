/**
 * JavaScript / Canvas teaching framwork
 * (C)opyright Hartmut Schirmacher, hschirmacher.beuth-hochschule.de
 *
 * @module: pointDragger
 *
 * A PointDragger is a drawable object than can react to events from a SceneController. It will typically control
 * the position of one vertex/point of a scene obejct. A dragger is a visible handle to move a 2D point around using
 * the 2D rendering features of the HTML5 canvas element.
 */

var de = de || {};
de.cg2 = de.cg2 || {};

/**
 *  requireJS module definition
 */
define([], (function () {
    "use strict";

    /**
     * creates an instance of PointDragger
     * @param getPos {Function} callback function that will return the position of the dragger as an new Point
     * @param setPos {Function} callback function that will set the position of the dragger
     * @param drawStyle {Object} specification object for the drawing style, example see below
     * @param nextPos {Point} the point to connect to with a line
     *        [{radius: 5, width: 2, color: "#FF00FF", fill: false}]
     */
    function PointDragger(getPos, setPos, drawStyle, nextPos) {

        // remember the callbacks
        this.getPos = getPos;
        this.setPos = setPos;

        if (nextPos) {
            this.getNextPos = nextPos;
        }

        // default draw style for the dragger
        drawStyle = drawStyle || {};
        this.drawStyle = {};
        this.drawStyle.radius = drawStyle.radius || 5;
        this.drawStyle.width = drawStyle.width || 2;
        this.drawStyle.color = drawStyle.color || "#ff0000";
        this.drawStyle.fill = drawStyle.fill || false;

        // attribute queried by SceneController to recognize draggers
        this.isDragger = true;
    }


    PointDragger.prototype = {
        /**
         * draw the dragger as a small circle
         * @param context
         */
        draw: function (context) {

            // what is my current position?
            var pos = this.getPos();


            // what shape to draw
            context.beginPath();
            context.arc(pos.x, pos.y, // position
                this.drawStyle.radius,    // radius
                0.0, Math.PI * 2,           // start and end angle
                true);                    // clockwise


            context.closePath();

            // draw style
            context.lineWidth = this.drawStyle.width;
            context.strokeStyle = this.drawStyle.color;
            context.fillStyle = this.drawStyle.color;

            // trigger the actual drawing
            if (this.drawStyle.fill) {
                context.fill();
            }
            context.stroke();

            if (this.getNextPos) {
                context.beginPath();
                var nextPos = this.getNextPos();
                context.moveTo(pos.x, pos.y);
                context.lineTo(nextPos.x, nextPos.y);
                context.lineWidth = 1;
                context.strokeStyle = "#cccccc";
                context.closePath();
                context.stroke();
            }

        },

        /**
         * test whether the specified mouse position "hits" this dragger
         * @param context drawing-context of the elememt
         * @param mousePos {Point} current mouse-position
         * @returns {boolean} if hit : true else false
         */
        isHit: function (context, mousePos) {

            // what is my current position?
            var pos = this.getPos();

            // check whether distance between mouse and dragger's center
            // is less or equal ( radius + (line width)/2 )
            var dx = mousePos.x - pos.x;
            var dy = mousePos.y - pos.y;
            var r = this.drawStyle.radius + this.drawStyle.width / 2;
            return (dx * dx + dy * dy) <= (r * r);
        },

        /**
         * Event handler triggered by a SceneController when mouse is being dragged
         * @param dragEvent {Object} settings of the handler
         */
        mouseDrag: function (dragEvent) {
            // change position of the associated original (!) object
            this.setPos(dragEvent);
        }
    };

    return PointDragger;

})); // define
