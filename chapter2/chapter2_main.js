window.addEventListener("load", chapter2_main);

function chapter2_main() {
  //canvasを取得
  const canvas = document.getElementById("targetCanvas");
  //canvasに付いてるwebglコンテキストを取得（初期化）
  //glオブジェクトの関数を呼ぶことで描画出来る
  const gl = canvas.getContext("webgl");

  //塗りつぶす色を指定(alphaを0にすると透明になるので注意！)
  gl.clearColor(1.0, 0.0, 0.0, 1.0);
  //画面を塗りつぶす
  gl.clear(gl.COLOR_BUFFER_BIT);

  //頂点位置のバッファを確保
  let positionBuffer = gl.createBuffer();
  const vertexPosition = [
    -1.0,
    -1.0,
    0.0, //右下の頂点
    0.0,
    1.0,
    0.0, //真ん中上の頂点
    1.0,
    -1.0,
    0.0, //右下の頂点
  ];
  //このバッファは「gl.ARRAY_BUFFERですよ」と教えている
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  //バッファにデータをいれる
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(vertexPosition),
    gl.STATIC_DRAW
  );

  // シェーダー定義
  const vertexShaderSource = `
    attribute vec4 aVertexPosition;
    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;
    void main() {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
    }
  `;
  //シェーダーオブジェクト（シェーダを格納するオブジェクト）を生成
  const vertexShader = gl.createShader(gl.VERTEX_SHADER);
  //シェーダーオブジェクトにシェーダのコードを設定
  gl.shaderSource(vertexShader, vertexShaderSource);
  //シェーダーをコンパイル
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

  draw(gl, shaderProgramInfo, positionBuffer);
}

function draw(gl, shaderProgramInfo, positionbuffer) {
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  //モデル変換用の行列(viewはカメラの位置の反映用の行列。今回は原点にある想定なので特に書かない)
  const modelviewMatix = mat4.create();
  mat4.translate(modelviewMatix, modelviewMatix, [0, 0, -3.0]);

  const fieldOfView = (45 * Math.PI) / 180;
  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  const zNear = 0.1;
  const zFar = 100.0;
  const projectionMatrix = mat4.create();
  mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);

  //vertexshaderに頂点を渡す
  {
    gl.bindBuffer(gl.ARRAY_BUFFER, positionbuffer);
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

  const offset = 0;
  const vertexCount = 3;
  gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
}
