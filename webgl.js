var gl;

const vertShader = `
    attribute vec4 vertexPos;
    attribute vec4 color;
    uniform mat4 modelViewMatrix;
    uniform mat4 projectionMatrix;

    varying lowp vec4 fragColor;

    void main() {
        fragColor = color;
        gl_Position = projectionMatrix * modelViewMatrix * vertexPos;
    }
`;
const fragShader = `
    varying lowp vec4 fragColor;

    void main() {
        gl_FragColor = fragColor;
    }
`;

var programInfo;

var vertPositions = [];
var vertexList = [];
var colorList = [];

function init() {
    const canvas = document.querySelector("#webgl-canvas");
    gl = canvas.getContext("webgl");

    const shaderProgram = initShader(gl, vertShader, fragShader);

    programInfo = {
        program: shaderProgram,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProgram, "vertexPos"),
            color: gl.getAttribLocation(shaderProgram, "color"),
        },
        uniformLocations: {
            projectionMatrix: gl.getUniformLocation(
                shaderProgram,
                "projectionMatrix"
            ),
            modelViewMatrix: gl.getUniformLocation(shaderProgram, "modelViewMatrix"),
        },
    };
}

function loadShader(gl, type, code) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, code);
    gl.compileShader(shader);
    
    console.log(gl.getShaderInfoLog(shader));  
    return shader;
}

function initShader(gl, vert, frag) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vert);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, frag);

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    return shaderProgram;
}

function initBuffers(gl, positions, colors) {
    const positionBuffer = gl.createBuffer();
    const colorBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

    return {
        position: positionBuffer,
        color: colorBuffer,
    };
}

function draw(gl, programInfo, buffers, vertexCount) {
    //Sets resolution
    gl.canvas.width = gl.canvas.clientWidth;
    gl.canvas.height = gl.canvas.clientHeight;
    gl.viewport(0,0,gl.canvas.width, gl.canvas.height);

    //Sets the color each pixel is set to when it is cleared
    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    //Camera parameters
    const fieldOfView = (45 * Math.PI) / 180; // in radians
    const aspect = gl.canvas.width / gl.canvas.height;
    const zNear = 0.1;
    const zFar = 100.0;

    const projectionMatrix = mat4.create();

    mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);

    const modelViewMatrix = mat4.create();

    mat4.translate(modelViewMatrix, modelViewMatrix, [-0.0, 0.0, -6.0]);


    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexPosition,
        2, ////number of components
        gl.FLOAT, //type
        false, //normalize
        0, //stride (the amount of bits between each block of data)
        0 //offset (the amount of bits that should be ignored at the start)
    );
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);

    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
    gl.vertexAttribPointer(
        programInfo.attribLocations.color,
        4, //number of components
        gl.FLOAT, //type
        false, //normalize
        0, //stride (the amount of bits between each block of data)
        0 //offset (the amount of bits that should be ignored at the start)
    );
    gl.enableVertexAttribArray(programInfo.attribLocations.color);


    gl.useProgram(programInfo.program);

    gl.uniformMatrix4fv(
        programInfo.uniformLocations.projectionMatrix,
        false,
        projectionMatrix
    );
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.modelViewMatrix,
        false,
        modelViewMatrix
    );

    gl.drawArrays(gl.LINES, 0, vertexCount);
}

function CalculateVertecies(width, yCalculationMethod, xMod, yMod) {
    vertPositions = [];
    vertexList = [];
    colorList = [];
    
    //Vertices of the two coordinate lines
    vertexList.push(0,-50);
    colorList.push(0, 1, 0, 1.0);
    vertexList.push(0,50);
    colorList.push(0, 1, 0, 1.0);
    vertexList.push(-50, 0);
    colorList.push(0, 1, 0, 1.0);
    vertexList.push(50, 0);
    colorList.push(0, 1, 0, 1.0);

    if(xMod == 0) return;
    for (x = -width/2*(1/Math.abs(xMod)); x <= width/2*(1/Math.abs(xMod)); x += 0.5/gl.canvas.width) {
        vertPositions.push(x*xMod);
        vertPositions.push(yCalculationMethod(x)*yMod);
    }

    for (i = 0; i < vertPositions.length; i += 2) {
        for(x = 0; x < 4; x++)
        {
            vertexList.push(vertPositions[i + x]);
            if(x % 2 == 0) 
            colorList.push(1.0, 1.0, 1.0, 1.0)
        }
    }
}

function DrawGraph(width, yCalculationMethod)
{
    var xMod = parseFloat(document.getElementById("xValue").value);
    var yMod = parseFloat(document.getElementById("yValue").value);

    CalculateVertecies(30, yCalculationMethod, xMod, yMod);
    const buffers = initBuffers(gl, vertexList, colorList);
    draw(gl, programInfo, buffers, vertexList.length);
}