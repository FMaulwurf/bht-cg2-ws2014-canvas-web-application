/*
 * WebGL core teaching framwork 
 * (C)opyright Hartmut Schirmacher, hschirmacher.beuth-hochschule.de 
 *
 * Module: Band
 *
 * The Band is made of two circles using the specified radius.
 * One circle is at y = height/2 and the other is at y = -height/2.
 *
 */


/* requireJS module definition */
window.define(["vbo"],
    (function (vbo) {

        "use strict";

        /* constructor for Band objects
         * gl:  WebGL context object
         * config: configuration object with the following attributes:
         *         radius: radius of the band in X-Z plane)
         *         height: height of the band in Y
         *         segments: number of linear segments for approximating the shape
         *         asWireframe: whether to draw the band as triangles or wireframe
         *                      (not implemented yet)
         */
        var Band = function (gl, config) {

            // read the configuration parameters
            config = config || {};
            var radius = config.radius || 1.0;
            var height = config.height || 0.1;
            var segments = config.segments || 20;
            this.drawStyle = config.drawStyle || "points";
            this.wireframe = config.wireframe || false;
            this.solid = config.solid || false;

            // generate vertex coordinates and store in an array
            var coords = [];
            for (var i = 0; i <= segments; i++) {

                // X and Z coordinates are on a circle around the origin
                var t = (i / segments) * Math.PI * 2;
                var x = Math.sin(t) * radius;
                var z = Math.cos(t) * radius;
                // Y coordinates are simply -height/2 and +height/2
                var y0 = height / 2;
                var y1 = -height / 2;

                // add two points for each position on the circle
                // IMPORTANT: push each float value separately!
                coords.push(x, y0, z);
                coords.push(x, y1, z);

            }

            // create vertex buffer object (VBO) for the coordinates
            this.coordsBuffer = new vbo.Attribute(gl, {
                "numComponents": 3,
                "dataType": gl.FLOAT,
                "data": coords
            });

            if (this.solid) {
                var indices = [];
                for (var j = 0; j < segments * 2; j += 2) {
                    indices.push(j, j + 1, j + 2, j + 2, j + 1, j + 3);
                }
                this.solidIndices = new vbo.Indices(gl, {
                    "indices": indices
                });
            }
            if (this.wireframe) {
                var wireframes = [];
                for (var k = 0; k < segments * 2; k += 2) {
                    wireframes.push(k, k + 1);
                    wireframes.push(k, k + 2);
                    wireframes.push(k + 1, k + 3);
                }
                this.wireframeIndices = new vbo.Indices(gl, {
                    "indices": wireframes
                });
            }

            window.console.log("Creating a Band", config);

        };

        // draw method: activate buffers and issue WebGL draw() method
        Band.prototype.draw = function (gl, program) {

            this.coordsBuffer.bind(gl, program, "vertexPosition");

            // draw the vertices as points
            if (this.drawStyle === "points" && !this.wireframe && !this.solid) {
                gl.drawArrays(gl.POINTS, 0, this.coordsBuffer.numVertices());
            } else if (this.solid || this.wireframe) {
                gl.polygonOffset(0.5, 0.5);
                gl.enable(gl.POLYGON_OFFSET_FILL);
                if (this.solid) {
                    this.solidIndices.bind(gl);
                    gl.drawElements(gl.TRIANGLES, this.solidIndices.numIndices(), gl.UNSIGNED_SHORT, 0);
                }
                if (this.wireframe) {
                    this.wireframeIndices.bind(gl);
                    gl.drawElements(gl.LINES, this.wireframeIndices.numIndices(), gl.UNSIGNED_SHORT, 0);
                }
                gl.disable(gl.POLYGON_OFFSET_FILL);
            } else {
                window.console.log("Band: draw style " + this.drawStyle + " not implemented.");
            }

        };

        // this module only returns the Band constructor function
        return Band;

    })); // define


