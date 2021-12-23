window.addEventListener("load", chapter1_main);

function chapter1_main() {
    //canvasを取得
    const canvas = document.getElementById("targetCanvas");
    //canvasに付いてるwebgl(オブジェクト？)を取得
    const gl = canvas.getContext("webgl");

    //塗りつぶす色を指定(alphaを0にすると透明になるので注意！)
    gl.clearColor(1.0, 0.0, 0.0, 1.0);
    //画面を塗りつぶす
    gl.clear(gl.COLOR_BUFFER_BIT);
}