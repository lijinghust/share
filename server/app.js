const koa = require("koa");
const staticServe = require('koa-static');
const views = require('koa-views');
const path = require('path');
const routerView = require('./route/view.js');
const routerApi = require('./route/api.js');
const koaBody = require('koa-body');

const app = new koa();
app.use(views(path.join(__dirname, './../dist/html/'), {map: {html: 'nunjucks'}}));

app.use(koaBody());

app.use(routerView.routes());
app.use(routerApi.routes());

app.use(staticServe(path.join(__dirname, './../dist/static')));

app.listen(3000, function(){
    console.log('http server 3000 start!')
    console.log('http://localhost:3000');
});
module.exports = app;