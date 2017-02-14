"use strict";
var express = require("express");
var SENECA = require("seneca");
var senecaWeb = require("seneca-web");
var utils = require("./api/utils");
var dotenv = require("dotenv");
dotenv.load();
var router = express.Router;
var context = new router();
var seneca = SENECA();
// let utils = utilsModule();
var app = express();
var senecaWebConfig = {
    context: context,
    adapter: require('seneca-web-adapter-express'),
    // so we can use body-parser
    options: { parseBody: false }
};
// specify the views directory
app.set('view engine', 'pug');
app.set('views', './client/app');
app.use(express.static('./client/dist'));
app.use(express.static('./client/bower_components'));
app.use(express.static('./client/node_modules'));
app.use(require('body-parser').json())
    .use(context)
    .listen(3000);
seneca
    .use(senecaWeb, senecaWebConfig)
    .use('entity')
    .use('./api/index')
    .use('./api/perspective.api')
    .client({ type: 'tcp', pin: 'role:api' });
app.get('/', function (req, res) {
    var dataPeriods = JSON.stringify(utils.getDataPeriods());
    res.render('index', { title: 'Cuadro de Mando Integral', periods: dataPeriods });
});
// 404 catch 
app.all('*', function (req, res) {
    console.log("[TRACE] Server 404 request: " + req.originalUrl);
    var dataPeriods = JSON.stringify(utils.getDataPeriods());
    res.render('index', { title: 'Cuadro de Mando Integral', periods: dataPeriods });
});
//# sourceMappingURL=app.js.map