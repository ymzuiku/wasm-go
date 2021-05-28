const { resolve } = require("path");

module.exports = {
  host: "127.0.0.1",
  port: 3200,
  goEntry: resolve(__dirname, "main.go"),
  srcPath: resolve(__dirname, "src"),
  publicPath: resolve(__dirname, "public"),
  publicPrefix: "/",
  proxy: [
    {
      prefix: "/ping",
      upstream: "http://127.0.0.1:5050",
      rewritePrefix: "/ping",
      http2: false,
    },
  ],
  build: (release, publicPath, goEntry) => {
    return `GOOS=js GOARCH=wasm go build ${release} -o ${publicPath}/main.wasm ${goEntry}`;
  },
};
