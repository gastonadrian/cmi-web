import * as express from 'express';
import * as SENECA from 'seneca';
import senecaWeb = require('seneca-web');
import utils = require('./api/utils');
import session = require('express-session');
import senecaBasic = require('seneca-basic');
import senecaMongoStore = require('seneca-mongo-store');
import senecaEntity = require('seneca-entity');
import senecaUser = require('seneca-user');
import dotenv = require('dotenv');
var passport = require('passport');
var strategy = require('passport-local').Strategy;
var cookieParser = require('cookie-parser');

// the following packages are loaded only because we need tsc to move them to /bin
import indicator = require('./api/indicator.api');
import perspective = require('./api/perspective.api');
import datasource = require('./api/datasource.api');
import customer = require('./api/customer.api');
import goal = require('./api/goal.api');
import apiIndex = require('./api/index');

// load environment strategy
dotenv.load();

let router:any = express.Router;
let context:any = new router();
let seneca:SENECA.Instance = SENECA();
// let utils = utilsModule();
let app:any = express();
let senecaWebConfig:any = {
    context: context,
    adapter: require('seneca-web-adapter-express'),
    auth: passport,
    // so we can use body-parser
    options: { parseBody: false } 
  };

// specify the views directory
app.set('view engine', 'pug');
app.set('views', './client/app');

app.use(express.static('./client/dist'));
app.use(express.static('./client/bower_components'));
app.use(express.static('./client/node_modules'));

app.use(cookieParser());
app.use(session({secret: 'magically', resave: false, saveUninitialized: false}));

seneca
    .use( senecaWeb, senecaWebConfig )
    .use( senecaMongoStore, {
        name: process.env.MONGO_DB,
        host: process.env.MONGO_HOST,
        port: process.env.MONGO_PORT,
        username: process.env.MONGO_USER,
        password: process.env.MONGO_PASSWORD,
        options: {}
     } )
    .use( senecaBasic )
    .use( senecaEntity, {
        mem_store: false
    } )
    .use( senecaUser, { mustrepeat: true } )
    .use( './api/index' )
    .use( './api/perspective.api' )
    .use( './api/indicator.api' )
    .use( './api/datasource.api' )
    .use( './api/customer.api' )
    .use( './api/goal.api' )
    .client( { type:'tcp',  pin:'role:api' } );

passport.use(new strategy(
  {
    usernameField: 'email'
  },
  function(username, password, done) {
    seneca.act(
        {'role':'api', 'path':'login'}, 
        { 
            'request$': {
                'body': {
                    'email': username.valueOf(), 
                    'password': password.valueOf()
                }
            }  
        }, 
        function(error, result){
            if(result.ok){
                return done(null, result.login);
            } else {
                return done(null, false);
            }
        }
    );
  }
));


// Configure Passport authenticated session persistence.
//
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  The
// typical implementation of this is as simple as supplying the user ID when
// serializing, and querying the user record by ID from the database when
// deserializing.
passport.serializeUser(function(login, cb) {
  cb(null, login.token);
});

passport.deserializeUser(function(token, done) {
    seneca.act(
        {'role':'api', 'path':'auth'}, 
        { 
            args: {
                params: {
                    'token': token
                }
            }  
        }, 
        function(error, result) {
            if(result.ok){
                result.login.admin = result.user.admin;
                result.login.name = result.user.name;
                return done(null, result.login);
            } else {
                return done(null, result.why);
            }
        }
    );
});

app.use(passport.initialize());
app.use(passport.session());

app.use( require('body-parser').json() )
    .use( require('body-parser').urlencoded({ extended: true }) )
    .use( context )
    .listen(8080);

app.get('/', 
    require('connect-ensure-login').ensureLoggedIn(),
    function (req:any, res:any) {
        let dataPeriods:string = JSON.stringify(utils.getDataPeriods());
        res.render('index', { title:'Cuadro de Mando Integral', periods: dataPeriods, admin: (req.user ? req.user.admin : false), username: (req.user ? req.user.name : 'anonimo') })
    }
);

app.get('/login', function (req:any, res:any) {
    res.render('login')
});

app.get('/logout',
    function(req, res){
        req.logout();
        res.redirect('/');
    }
);

// 404 catch 
app.all('*', 
    require('connect-ensure-login').ensureLoggedIn(),
    function(req:any, res:any){
        console.log(`[TRACE] Server 404 request: ${req.originalUrl}`);
        let dataPeriods:string = JSON.stringify(utils.getDataPeriods());
        console.log(req.user.name)
        res.render('index', { title:'Cuadro de Mando Integral', periods: dataPeriods, admin: (req.user ? req.user.admin : false), username: (req.user ? req.user.name : 'anonimo') });
    } 
);