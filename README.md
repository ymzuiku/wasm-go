# wasm-go

[Youtube Video](https://youtu.be/wlnmY2v0pg8)

Easy start use go wasm write frontend project

- Need install golang
- Need install nodejs

## feature

- Auto build on change
- Auto reload brower on change
- Auto create frontend wasm
- Watch project
- Proxy

## Start

1 - Creaet go mod project

```bash
mkdir my-project
cd my-project
go mod init my-project
touch main.go
```

2 - Edit `main.go`

```go
package main

import (
	"syscall/js"
)

func main() {
	document := js.Global().Get("document")

	h2 := document.Call("createElement", "h2")
	h2.Set("textContent", "Hello wasm-go")

	document.Get("body").Call("appendChild", h2)

	// keep go runtime
	c := make(chan struct{})
	<-c
}
```

## Install wasm-go

```bash
npm i -g wasm-go
```

## Dev start

At `my-project` root dir:

```bash
wasm-go
```

## Build release

```bash
wasm-go --release
```

## Change config

Change `wasm-go.config.js`

```js
const { resolve } = require("path");

module.exports = {
  gzip: false,
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
```
