tdl.require('tdl.buffers');
tdl.require('tdl.fast');
tdl.require('tdl.log');
tdl.require('tdl.math');
tdl.require('tdl.models');
tdl.require('tdl.primitives');
tdl.require('tdl.programs');
tdl.require('tdl.textures');
tdl.require('tdl.webgl');

function inputData()
{

}

var xControlPoints = [0, 1, 2]
var yControlPoints = [0, 1, 0]

function CalculateBezierCurve(t)
{
    x = Math.pow(1-t, 2)* xControlPoints[0] + 2 * (1 - t) * t * xControlPoints[1] + Math.pow(t, 2) * xControlPoints[2]
    y = Math.pow(1-t, 2)* yControlPoints[0] + 2 * (1 - t) * t * yControlPoints[1] + Math.pow(t, 2) * yControlPoints[2]
    return x,y;
}


function setupLogo() {
    var program = tdl.programs.loadProgramFromScriptTags(
      'modelVertexShader',
      'modelFragmentShader');

    positions = []
    /*for(i = 0; i < 1; i += 0.01)
    { 
        var result = CalculateBezierCurve(i);
        debugger;
        positions.Push(CalculateBezierCurve(i).x, )
    }*/
  var arrays = {
    position: new tdl.primitives.AttribBuffer(
       3, [
        1, 1, 0,
        1, -1, 0,
        -1, -1, 0,
       -1,  1, 0,
    ]),
    indices: new tdl.primitives.AttribBuffer(2, [
      0, 1,1,2,2, 3,3,0
    ], 'Uint16Array')
  };
  return new tdl.models.Model(program, arrays, {}, gl.LINES);
};

var g_eyeRadius = 5;
var g_fov       = 30;
var g_trans     = [0,0,0];

function initializeLogo(canvas) {
  var math = tdl.math;
  var fast = tdl.fast;
  var model = setupLogo();

  var clock = 0.0;

  // pre-allocate a bunch of arrays
  var projection = new Float32Array(16);
  var view = new Float32Array(16);
  var world = new Float32Array(16);
  var viewProjection = new Float32Array(16);
  var worldViewProjection = new Float32Array(16);
  var eyePosition = new Float32Array(3);
  var target = new Float32Array(3);
  var up = new Float32Array([0,1,0]);

  // uniforms.
  var modelConst = {
  };
  var modelPer = {
    worldViewProjection: worldViewProjection
  };

  var then = (new Date()).getTime() * 0.001;
  function render() {
    tdl.webgl.requestAnimationFrame(render, canvas);
    var now = (new Date()).getTime() * 0.001;
    var elapsedTime = now - then;
    then = now;

    clock += elapsedTime;
    eyePosition[0] = 0;
    eyePosition[1] = 0;
    eyePosition[2] = 10;

    gl.colorMask(true, true, true, true);
    gl.clearColor(0,0,0,0);
    gl.lineWidth(2);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);

    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);

    fast.matrix4.perspective(
        projection,
        math.degToRad(g_fov),
        canvas.clientWidth / canvas.clientHeight,
        1,
        5000);
    fast.matrix4.lookAt(
        view,
        eyePosition,
        target,
        up);
    fast.matrix4.mul(viewProjection, view, projection);

    model.drawPrep(modelConst);
    fast.matrix4.translation(world, g_trans);
    fast.matrix4.mul(worldViewProjection, world, viewProjection);
    model.draw(modelPer);
  }
  render();
}

