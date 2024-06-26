//htmlが読み終わったらchapter1_main関数を呼び出す
window.addEventListener("load", chapter1_main);

function chapter1_main() {
  //canvasを取得
  const canvas = document.getElementById("targetCanvas");

  //canvasに付いてるwebglコンテキストを取得（初期化）
  //glオブジェクトの関数を呼ぶことで描画出来る
  const gl = canvas.getContext("webgl");

  //塗りつぶす色を指定(alphaを0にすると透明になるので注意！)
  gl.clearColor(1.0, 0.0, 0.0, 1.0);
  //画面を塗りつぶす
  gl.clear(gl.COLOR_BUFFER_BIT);
}
