module.exports = `(function () {
  const ws = new WebSocket("ws://"+location.host+"/devhot");

  ws.onmessage = function (env) {
    console.log("dev hot!");
    if (env.data === "reload") {
      window.location.reload();
    } else {
      console.log("devhot:", env.data);
    }
  };

  ws.onopen = function () {
    ws.send("hello-devhot");
  };
  ws.onclose = function() {
    console.log("[wasm-air] closed")
  }
})();
`;
