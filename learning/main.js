//windowが読めたらmain関数が呼ばれます
window.addEventListener("load", main);

function main() {
    //canvasタグを取得
    const canvas = document.getElementById("targetcanvas");
    //canvasタグからwebglコンテキスト(オブジェクトみたなもん)を取得する
    const gl = canvas.getContext("webgl");
    //clear関数で塗りつぶす色を指定
    gl.clearColor(1.0, 0.0, 0.0, 1.0);
    //clearColorで指定した色で塗りつぶす。
    gl.clear(gl.COLOR_BUFFER_BIT);

    const vertexPosition =
        [
            -1.0, -1.0, 0.0,//左下の頂点
            0.0, 1.0, 0.0,//真ん中上の頂点
            1.0, -1.0, 0.0//右下の頂点
        ];
    let positionBuffer = gl.createBuffer();
    //positionbufferは頂点座標いれるやつやでと教えてる
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    //positionbufferにvertexPositionで定義したデータを入れる
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPosition), gl.STATIC_DRAW);

    //シェーダを定義します
    const vertexShaderSource = `
    attribute vec4 aVertexPosition;
    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;
    void main() {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
    }
  `;
    //シェーダーオブジェクト（シェーダを格納するオブジェクト）を生成
    const vertexShaderObject = gl.createShader(gl.VERTEX_SHADER);
    //シェーダーオブジェクトにシェーダのコードを設定
    gl.shaderSource(vertexShaderObject, vertexShaderSource);
    //コンパイル
    gl.compileShader(vertexShaderObject);
    if (!gl.getShaderParameter(vertexShaderObject, gl.COMPILE_STATUS)) {
        alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(vertexShaderObject));
        gl.deleteShader(vertexShaderObject);
        return null;
    }
    //フラグメントシェーダーも定義していく
    const fragmentShaderSource = `
    void main() {
      gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0);
    }
  `;
    const fragmentShaderObject = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShaderObject, fragmentShaderSource);
    gl.compileShader(fragmentShaderObject);

    //WebGLProgram(vertexshaderとfragmentshaderをまとめたもの)
    const shaderProgram = gl.createProgram();
    //vertexshaderのオブジェクトを設定
    gl.attachShader(shaderProgram, vertexShaderObject);
    //fragmentshaderのオブジェクトを設定
    gl.attachShader(shaderProgram, fragmentShaderObject);
    gl.linkProgram(shaderProgram);

    //modelview行列
    const modelviewMatrix = mat4.create();
    //ワールド座標系への変換（平行移動）
    mat4.translate(modelviewMatrix, modelviewMatrix, [0, 0, -3.0]);
    //camera 0,0,-3
    // mat4.translate(modelviewMatrix,modelviewMatrix,[0,0,3]);

    //projectionmatrix
    const projectionMatrix = mat4.create();
    const fieldofview = Math.PI * 45 / 180;//45度(ラジアンに変換)
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const near = 0.1;
    const far = 100.0;
    mat4.perspective(projectionMatrix, fieldofview, aspect, near, far);

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    //positionbufferの見方を教える
    gl.vertexAttribPointer(
        gl.getAttribLocation(shaderProgram, "aVertexPosition"),
        3, gl.FLOAT, false, 0, 0
    );
    gl.enableVertexAttribArray(gl.getAttribLocation(shaderProgram, "aVertexPosition"));
    //
    gl.useProgram(shaderProgram);

    gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, "uModelViewMatrix"), false, modelviewMatrix);
    gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, "uProjectionMatrix"), false, projectionMatrix);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 3);


}