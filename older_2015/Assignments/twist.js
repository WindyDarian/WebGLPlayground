"use strict";

var canvas;
var gl;

var points = [];

var NumTimesToSubdivide = 2;
var TwistAngle = Math.PI / 4 ;




function init()
{
    points = [];
    NumTimesToSubdivide = document.getElementById("recur").value;
    TwistAngle = document.getElementById("theta").value * Math.PI/8;

    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //
    //  Initialize our data for the Sierpinski Gasket
    //

    // First, initialize the corners of our gasket with three points.

    var vertices = [
        vec2( -0.707, -0.707 ),
        vec2(  0,  0.707 ),
        vec2(  0.707, -0.707 )
    ];

    divideTriangle( vertices[0], vertices[1], vertices[2],
                    NumTimesToSubdivide);

    twist();

    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //  Load shaders and initialize attribute buffers

    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Load the data into the GPU

    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    document.getElementById("recur").onchange = init

    document.getElementById("theta").onchange = init

    render();
};

window.onload = init



function triangle( a, b, c )
{
    points.push( a, b, c );
}

function divideTriangle( a, b, c, count )
{

    // check for end of recursion

    if ( count == 0 ) {
        triangle( a, b, c );
    }
    else {

        //bisect the sides

        var ab = mix( a, b, 0.5 );
        var ac = mix( a, c, 0.5 );
        var bc = mix( b, c, 0.5 );

        --count;

        // four new triangles

        divideTriangle( a, ab, ac, count );
        divideTriangle( c, ac, bc, count );
        divideTriangle( b, bc, ab, count );
        divideTriangle( ab, bc, ac, count );
    }
}

function twist()
{
   var twisted_points = [];
   for (var i in points){

     var p = points[i];
     var d = Math.sqrt( Math.pow(p[0],2) + Math.pow(p[1],2) );
     var angle = d * TwistAngle;
     var x1 = (p[0] * Math.cos(angle)) - (p[1] * Math.sin(angle));
     var y1 = (p[0] * Math.sin(angle)) + (p[1] * Math.cos(angle));
     twisted_points.push([x1,y1]);
   }
   points = twisted_points;
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.TRIANGLES, 0, points.length );
}
