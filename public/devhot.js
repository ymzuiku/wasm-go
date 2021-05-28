var ws = new WebSocket("ws://127.0.0.1:3200");

ws.onopen = function (evt) {
  ws.send("dog------");
};
