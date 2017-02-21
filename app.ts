import * as express from 'express';
import * as SENECA from 'seneca';
import senecaWeb = require('seneca-web');
import utils = require('./api/utils');
import dotenv = require('dotenv');

// the following packages are loaded only because we need tsc to move them to /bin
import indicator = require('./api/indicator.api');
import perspective = require('./api/perspective.api');
import datasource = require('./api/datasource.api');
import apiIndex = require('./api/index');

dotenv.load();
let router:any = express.Router;
let context:any = new router();
let seneca:SENECA.Instance = SENECA();
// let utils = utilsModule();
let app:any = express();
let senecaWebConfig:any = {
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

app.use( require('body-parser').json() )
    .use( context )
    .listen(80);

seneca
    .use( senecaWeb, senecaWebConfig )
    .use( './api/index' )
    .use( './api/perspective.api' )
    .use( './api/indicator.api' )
    .use( './api/datasource.api' )
    .client( { type:'tcp',  pin:'role:api' } );
    
app.get('/', function (req:any, res:any) {
    let dataPeriods:string = JSON.stringify(utils.getDataPeriods());
    res.render('index', { title:'Cuadro de Mando Integral', periods: dataPeriods })
});

// 404 catch 
app.all('*', function(req:any, res:any){
    console.log(`[TRACE] Server 404 request: ${req.originalUrl}`);
    let dataPeriods:string = JSON.stringify(utils.getDataPeriods());
    res.render('index', { title:'Cuadro de Mando Integral', periods: dataPeriods });
});