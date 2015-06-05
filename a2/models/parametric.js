/*
 * WebGL core teaching framwork 
 * (C)opyright Hartmut Schirmacher, hschirmacher.beuth-hochschule.de 
 *
 * Module: ParametricSurface
 *
 * This function creates an object to draw any parametric surface.
 *
 */


/* requireJS module definition */
window.define(["vbo", "jquery"], (function (vbo, $) {
    "use strict";

    /* constructor for Parametric Surface objects
     * gl:  WebGL context object
     * posFunc: function taking two arguments (u,v) and returning coordinates [x,y,z]
     * config: configuration object defining attributes uMin, uMax, vMin, vMax,
     *         and drawStyle (i.e. "points", "wireframe", or "surface")
     */
    var ParametricSurface = function (gl, posFunc, settings) {

        // default settings
        this.settings = {
            uMin: 0,
            uMax: 0,
            vMin: 0,
            vMax: 0,
            uSeg: 40,
            vSeg: 20,
            drawStyle: "points",
            solid: false,
            wireframe: false
        };

        // extend default settings with parameter settings
        $.extend(this.settings, settings || {});

        // generate vertex coordinates and store in an array
        var coords = [],
            point = [],
            steps = {
                u: (this.settings.uMax - this.settings.uMin) / this.settings.uSeg,
                v: (this.settings.vMax - this.settings.vMin) / this.settings.vSeg
            },
            currentSegment = {
                u: this.settings.uMin,
                v: this.settings.vMin
            };

        for (var i = 0; i <= this.settings.uSeg; i++) {
            for (var j = 0; j <= this.settings.vSeg; j++) {

                currentSegment.u = this.settings.uMin + (steps.u * i);
                currentSegment.v = this.settings.vMin + (steps.v * j);

                point = posFunc(currentSegment.u, currentSegment.v);
                coords.push(point[0], point[1], point[2]);
            }
        }

        // create vertex buffer object (VBO) for the coordinates
        this.coordsBuffer = new vbo.Attribute(gl, {
                "numComponents": 3,
                "dataType": gl.FLOAT,
                "data": coords
            }
        );

        var solidIndices = [],
            wireframeIndices = [],
            pivot = (this.settings.vSegments + 1),
            currentPosition = 0;

        for (var k = 0; k < this.settings.uSegments * pivot; k += pivot) {
            for (var h = 0; h < this.settings.vSegments; h++) {
                currentPosition = k + h;
                wireframeIndices.push(currentPosition, currentPosition + 1);
                wireframeIndices.push(currentPosition, currentPosition + pivot);
                wireframeIndices.push(currentPosition + 1, currentPosition + 1 + pivot);
                solidIndices.push(currentPosition, currentPosition + 1, currentPosition + pivot, currentPosition + pivot, currentPosition + 1, currentPosition + pivot + 1);
            }
        }

        this.solidIndices = new vbo.Indices(gl, {
            "indices": solidIndices
        });

        // Wire - create vertex buffer object (VBO) for the indices
        this.wireframeIndices = new vbo.Indices(gl, {
            "indices": wireframeIndices
        });

        window.console.log("Creating a ParametricSurface", this.settings);

    };

    // draw method: activate buffers and issue WebGL draw() method
    ParametricSurface.prototype.draw = function (gl, program) {

        this.coordsBuffer.bind(gl, program, "vertexPosition");

        // draw the vertices as points
        if (this.settings.drawStyle === "points" && !this.settings.solid && !this.settings.wireframe) {
            gl.drawArrays(gl.POINTS, 0, this.coordsBuffer.numVertices());
        } else if (this.settings.solid || this.settings.wireframe) {
            gl.polygonOffset(0.5, 0.5);
            gl.enable(gl.POLYGON_OFFSET_FILL);
            if (this.settings.solid) {
                this.solidIndices.bind(gl);
                gl.drawElements(gl.TRIANGLES, this.solidIndices.numIndices(), gl.UNSIGNED_SHORT, 0);
            }
            if (this.settings.wireframe) {
                this.wireframeIndices.bind(gl);
                gl.drawElements(gl.LINES, this.wireframeIndices.numIndices(), gl.UNSIGNED_SHORT, 0);
            }
            gl.disable(gl.POLYGON_OFFSET_FILL);
        } else {
            window.console.log("Band: draw style " + this.settings.drawStyle + " not implemented.");
        }

    };

    // this module only returns the Band constructor function
    return ParametricSurface;

})); // define

    
