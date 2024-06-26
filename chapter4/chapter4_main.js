window.addEventListener("load", chapter4_main);

//描画するオブジェクトのクラス
class renderingObject {
  constructor(gl, shaderprograminfo, buffers) {
    this.gl = gl;
    this.shaderprogramInfo = shaderprograminfo;
    this.buffers = buffers;
  }

  update(deltatime) {
    this.drawThisObject(deltatime);
  }

  drawThisObject(deltatime) {
    draw(this.gl, this.shaderprogramInfo, this.buffers, deltatime);
  }
}

let renderingObjectList = [];

function chapter4_main() {
  //canvasを取得
  const canvas = document.getElementById("targetCanvas");
  //canvasに付いてるwebglコンテキストを取得（初期化）
  //glオブジェクトの関数を呼ぶことで描画出来る
  const gl = canvas.getContext("webgl");

  //塗りつぶす色を指定(alphaを0にすると透明になるので注意！)
  gl.clearColor(1.0, 0.0, 0.0, 1.0);
  //画面を塗りつぶす
  gl.clear(gl.COLOR_BUFFER_BIT);

  //バッファを作成
  const buffers = initbuffer(gl);

  // シェーダー定義
  const vertexShaderSource = `
    attribute vec4 aVertexPosition;
    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;
    void main() {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
    }
  `;
  const vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, vertexShaderSource);
  gl.compileShader(vertexShader);

  const fragmentShaderSource = `
    void main() {
      gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0);
    }
  `;
  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader, fragmentShaderSource);
  gl.compileShader(fragmentShader);

  //shaderProgram(vertexshaderとfragmentshaderをまとめた物)
  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);
  const shaderProgramInfo = {
    program: shaderProgram,
    //vertexshaderのattribute変数のポインターみたいなの取得
    attributeLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPosition"),
    },
    uniformLocations: {
      ModelViewMatrix: gl.getUniformLocation(shaderProgram, "uModelViewMatrix"),
      ProjectionMatrix: gl.getUniformLocation(
        shaderProgram,
        "uProjectionMatrix"
      ),
    },
  };

  //毎フレーム描画する必要がある
  let cubeObject = new renderingObject(gl, shaderProgramInfo, buffers);
  renderingObjectList.push(cubeObject);
  // draw(gl, shaderProgramInfo, buffers);
  // cubeObject.draw();
  loop();
}

let pre = 0;

function loop() {
  const now = Date.now() * 0.001;
  const deltatime = now - pre;
  pre = now;
  renderingObjectList.forEach((item) => {
    item.update(deltatime);
    requestAnimationFrame(loop);
  });
}

function initbuffer(gl) {
  //頂点位置のバッファを確保
  let positionBuffer = gl.createBuffer();
  const vertexPosition = [
    // 立方体の8つの頂点
    -1.0, -1.0,  1.0,  // 0: 左下前
     1.0, -1.0,  1.0,  // 1: 右下前
    -1.0,  1.0,  1.0,  // 2: 左上前
     1.0,  1.0,  1.0,  // 3: 右上前
    -1.0, -1.0, -1.0,  // 4: 左下後
     1.0, -1.0, -1.0,  // 5: 右下後
    -1.0,  1.0, -1.0,  // 6: 左上後
     1.0,  1.0, -1.0,  // 7: 右上後
  ];
  
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(vertexPosition),
    gl.STATIC_DRAW
  );

  //頂点の順番を決める用のバッファを作成
  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  const indexData = [
    // 各面を構成する三角形のインデックス
    0, 1, 2, 1, 3, 2,  // 前面
    1, 5, 3, 5, 7, 3,  // 右側面
    5, 4, 7, 4, 6, 7,  // 背面
    4, 0, 6, 0, 2, 6,  // 左側面
    2, 3, 6, 3, 7, 6,  // 上面
    4, 5, 0, 5, 1, 0,  // 底面
  ];
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(indexData),
    gl.STATIC_DRAW
  );
  return {
    position: positionBuffer,
    index: indexBuffer,
  };
}

let rotateValue = 0;

//positionbufferとindexbufferをbuffersに
function draw(gl, shaderProgramInfo, buffers, deltatime) {
  //毎フレーム
  gl.clearColor(1.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  //モデル変換用の行列(viewはカメラの位置の反映用の行列。今回は原点にある想定なので特に書かない)
  const modelviewMatix = mat4.create();
  mat4.translate(modelviewMatix, modelviewMatix, [0, 0, -4.0]);
  //回転行列（glmatrix.jsが列優先だから平行移動の後にかけてる？多分そう）
  mat4.rotate(modelviewMatix, modelviewMatix, rotateValue, [0, 1, 0]);
  rotateValue += deltatime;

  const fieldOfView = (45 * Math.PI) / 180;
  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  const zNear = 0.1;
  const zFar = 100.0;
  const projectionMatrix = mat4.create();
  mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);

  //vertexshaderに頂点を渡す
  {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    const numComponents = 3;
    const type = gl.FLOAT;
    const noramlize = false;
    const stride = 0;
    const offset = 0;

    gl.vertexAttribPointer(
      shaderProgramInfo.attributeLocations.vertexPosition,
      numComponents,
      type,
      noramlize,
      stride,
      offset
    );
    gl.enableVertexAttribArray(
      shaderProgramInfo.attributeLocations.vertexPosition
    );
  }

  gl.useProgram(shaderProgramInfo.program);

  gl.uniformMatrix4fv(
    shaderProgramInfo.uniformLocations.ProjectionMatrix,
    false,
    projectionMatrix
  );
  gl.uniformMatrix4fv(
    shaderProgramInfo.uniformLocations.ModelViewMatrix,
    false,
    modelviewMatix
  );

  //これで順番を決めると教える
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.index);

  const offset = 0;
  const vertexCount = 36;
  gl.drawElements(gl.TRIANGLES, vertexCount, gl.UNSIGNED_SHORT, offset);
}
