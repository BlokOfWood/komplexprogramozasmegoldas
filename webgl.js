window.onload = init;

const vertShader = `
    attribute vec4 vertexPos;

    uniform mat4 modelViewMatrix;
    uniform mat4 projectionMatrix;

    void main() {
        gl_Position = projectionMatrix * modelViewMatrix * vertexPos;
    }
`;
const fragShader = `
    void main() {
        gl_FragColor = vec4(1.0,1.0,1.0,1.0);
    }
`;

function loadShader(gl, type, code) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, code);
  gl.compileShader(shader);

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

function initBuffers(gl, positions) {
  const positionBuffer = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  return {
    position: positionBuffer,
  };
}

function draw(gl, programInfo, buffers, vertexCount) {
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clearDepth(1.0);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  const fieldOfView = (45 * Math.PI) / 180; // in radians
  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  const zNear = 0.1;
  const zFar = 100.0;
  const projectionMatrix = mat4.create();

  mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);

  const modelViewMatrix = mat4.create();

  mat4.translate(modelViewMatrix, modelViewMatrix, [-0.0, 0.0, -6.0]);

  const numComponents = 2;
  const type = gl.FLOAT;
  const normalize = false;
  const stride = 0;

  const offset = 0;
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
  gl.vertexAttribPointer(
    programInfo.attribLocations.vertexPosition,
    numComponents,
    type,
    normalize,
    stride,
    offset
  );
  gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);

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

  gl.drawArrays(gl.LINES, offset, vertexCount);
}

var vertPositions = [];
var vertexList = [];
function init() {
  const canvas = document.querySelector("#webgl-canvas");
  const gl = canvas.getContext("webgl");

  const shaderProgram = initShader(gl, vertShader, fragShader);
  const programInfo = {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, "vertexPos"),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(
        shaderProgram,
        "projectionMatrix"
      ),
      modelViewMatrix: gl.getUniformLocation(shaderProgram, "modelViewMatrix"),
    },
  };

  vertCount = 0;
  for (i = 0; i < 4; i++) {
    for (i = 0; i <= 1; i += 0.01) {
      result = CalculateBezierCurve(i, xControlPoints, yControlPoints);
      vertPositions.push(result[0]);
      vertPositions.push(result[1]);
      vertCount++;
    }
    for (i = 0; i < vertPositions.length; i += 2) {
      vertexList.push(vertPositions[i]);
      vertexList.push(vertPositions[i + 1]);
      vertexList.push(vertPositions[i + 2]);
      vertexList.push(vertPositions[i + 3]);
    }
    offset = xControlPoints[0] - xControlPoints[2]
    for(i = 0; i < 3; i++)
    {
        xControlPoints += offset;
    }
  }

  const buffers = initBuffers(gl, vertexList);
  draw(gl, programInfo, buffers, vertCount * 2);
}

var xControlPoints = [-1.0, 0.0, 1.0];
var yControlPoints = [-1.0, 5.0, -1.0];

function CalculateBezierCurve(t, _xControlPoints, _yControlPoints) {
  x =
    Math.pow(1 - t, 2) * _xControlPoints[0] +
    2 * (1 - t) * t * _xControlPoints[1] +
    Math.pow(t, 2) * _xControlPoints[2];
  y =
    Math.pow(1 - t, 2) * _yControlPoints[0] +
    2 * (1 - t) * t * _yControlPoints[1] +
    Math.pow(t, 2) * _yControlPoints[2];
  return [x, y];
}
