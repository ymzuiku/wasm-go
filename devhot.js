module.exports = (host, port) => {
  return `(function () {
    const ws = new WebSocket("ws://127.0.0.1:3200/devhot");
  
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
      console.error("[wasm-air] closed")
    }
  })();
  `;
};
