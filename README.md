# wasm-go

Easy start use go wasm write frontend project

- Need install golang
- Need install nodejs

## feature

- Auto build on edit
- Auto reload brower
- Auto create frontend wasm
- Watch project
- Proxy

## Start

1 - Creaet go mod project

```bash
mkdir my-project
cd my-project
go mod init my-project
mkdir main.go
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
npm i -g wasm-air
```

## Dev start

At `my-project` root dir:

```bash
wasm-air
```

## Build release

```bash
wasm-air --release
```

## Change config

Change `wasm-air.config.js`
