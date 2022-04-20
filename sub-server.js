const express = require("express");
const cors = require("cors");
const path = require("path");
const { createProxyMiddleware: proxy } = require("http-proxy-middleware");
const compression = require("compression");
const open = require("open");
const chalk = require("chalk");
const app = express();
const RUNTIME_ENV = process.env.RUNTIME_ENV || "dev";
const port = process.env.PORT || 8003;

app.use(compression());
//设置允许跨域请求
app.use(cors())

app.use(express.static(path.join(__dirname, "/dist")));

const apiMaps = {
  // dev 开发
  dev: [
    {
      prefix: "/mock",
      proxyTo: "http://localhost:8081/mock/",
      rewrite: "",
    },
  ],
  // test 测试
  test: [
    {
      prefix: "/test",
      proxyTo: "https://test.net/test/",
      rewrite: "",
    },
  ],
};

apiMaps[RUNTIME_ENV].map((api) =>
  app.use(
    api.prefix,
    proxy({
      pathRewrite: api.hasOwnProperty("rewrite")
        ? { [`^${api.prefix}`]: api.rewrite }
        : {},
      target: api.proxyTo,
      changeOrigin: true,
      ws: false,
      secure: false, // 不进行证书验证
    })
  )
);

app.get("/*", function (req, res) {
  res.sendFile(path.join(__dirname, "/"));
});

app.listen(port, async () => {
  console.log("> Network:", `http://localhost:${port}`);
  console.log();
  const APP_PATH = `http://localhost:${port}/subapp/sub-vue`;
  console.log("app访问:", chalk.greenBright(APP_PATH));
  console.log(chalk.greenBright("开启默认浏览器..."));
  // await open(APP_PATH, {
  //   app: { arguments: ["--incognito"] },
  // });
});
