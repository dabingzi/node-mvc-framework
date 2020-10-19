const koa = require("koa");
const fs = require("fs");
var router = require("koa-router")();
const staticResource = require("koa-static");
const app = new koa();
app.use(staticResource(__dirname + "/"));

app.use(router.routes()); /*启动路由*/
app.use(router.allowedMethods());
app.listen(4000);
