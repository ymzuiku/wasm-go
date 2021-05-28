#!/usr/bin/env node

const fs = require("fs-extra");
const { exec } = require("node:child_process");
const { resolve } = require("path");
const cwd = process.cwd();
const argv = process.argv.splice(2);
const { fastify } = require("fastify");
const fastifyWs = require("fastify-websocket");
const fastifyHttpProxy = require("fastify-http-proxy");
const fastifyStatic = require("fastify-static");
const wsList = new Set();

let release = "";
argv.forEach((v) => {
  if (/-release/.test(v)) {
    release = `-ldflags "-s -w"`;
  }
});

if (!fs.existsSync(resolve(cwd, "wasm-air.config.js"))) {
  fs.copyFileSync(
    resolve(__dirname, "wasm-air.config.js"),
    resolve(cwd, "wasm-air.config.js")
  );
}

const {
  host,
  port,
  proxy,
  publicPath,
  publicPrefix,
  srcPath,
  goEntry,
  build,
} = require(resolve(cwd, "wasm-air.config.js"));

const htmlPath = resolve(publicPath, "index.html");
const devhot = require("./devhot");

if (!fs.existsSync(publicPath)) {
  fs.mkdirSync(publicPath);
}
if (!fs.existsSync(resolve(publicPath, "index.html"))) {
  fs.copyFileSync(
    resolve(__dirname, "public/index.html"),
    resolve(publicPath, "index.html")
  );
}

if (!fs.existsSync(resolve(publicPath, "wasm_exec.js"))) {
  fs.copyFileSync(
    resolve(__dirname, "public/wasm_exec.js"),
    resolve(publicPath, "wasm_exec.js")
  );
}

let lastTime = 0;

const watchBuild = () => {
  lastTime = Date.now();
  exec(build(release, publicPath, goEntry), (err, ioIn, ioOut) => {
    if (release) {
      const html = fs.readFileSync(htmlPath).toString();
      const _html = html.replace(
        /"main.wasm\?t=(.*?)"/,
        `"main.wasm?t=${Date.now().toString().slice(5)}"`
      );
      fs.writeFileSync(htmlPath, _html);
    }
    if (err) {
      console.error(err);
    }
    if (ioIn) {
      console.log(ioIn);
    }
    if (ioOut) {
      console.log(ioOut);
    }
  });
};

if (fs.existsSync(srcPath)) {
  watchBuild();
  if (release) {
    return;
  }
  startExpress();
  fs.watch(srcPath, { recursive: true }, watchBuild);
  fs.watchFile(goEntry, watchBuild);
  let keep = null;
  fs.watch(publicPath, { recursive: true }, (e, file) => {
    if (keep) {
      clearTimeout(keep);
    }
    keep = setTimeout(() => {
      // bs.reload();
      wsList.forEach((ws) => {
        if (ws.readyState != 1) {
          wsList.delete(ws);
          return;
        }
        try {
          ws.send("reload");
        } catch (err) {
          console.error(err);
          wsList.delete(ws);
        }
      });
      console.log(`Use time: ${Date.now() - lastTime}ms by ${file}`);
    }, 66);
  });
}

function startExpress() {
  const app = fastify();

  if (proxy) {
    proxy.forEach((p) => {
      app.register(fastifyHttpProxy, p);
    });
  }

  app.register(fastifyStatic, {
    root: publicPath,
    prefix: publicPrefix,
  });
  app.register(fastifyWs);

  app.get("/", function (req, rep) {
    var html = fs.readFileSync(htmlPath, "utf8");
    html = html.replace("</html>", "");
    html += `<script>${devhot(host, port)}</script></html>`;
    rep.code(200).header("Content-Type", "text/html; charset=utf-8").send(html);
  });

  app.get("/devhot", { websocket: true }, (connection) => {
    connection.socket.on("message", (msg) => {
      wsList.add(connection.socket);
    });
  });

  app.listen(port, host, () => {
    console.log(`listen: http://${host}:${port}`);
  });
}
