module.exports = function api(options) {

    var routes = require('./routes');

    this.add('role:api,path:dashboard', function (msg, respond) {
        // console.warn('entering index js');
        this.act('role:dashboard,cmd:index', msg, respond);
    });

    this.add('role:api,path:perspectives', function (msg, respond){
        if(msg.request$.method === 'GET'){
            this.act('role:perspectives,cmd:getall',msg,respond);
        }
        else{
            this.act('role:perspectives,cmd:save', msg, respond);
        }
    });

    this.add('role:api,path:datasources', function (msg, respond) {

        if(msg.request$.method === 'GET'){
            this.act('role:datasources,cmd:get', msg, respond);
        }
        else{
            this.act('role:datasources,cmd:save', msg, respond);
        }
    });

    this.add('role:api,path:indicatorsgetall', function (msg, respond) {
        this.act('role:indicators,cmd:getall', msg, respond);
    });

    this.add('role:api,path:indicatorcreate', function (msg, respond) {
        this.act('role:indicators,cmd:save', msg, respond);
    }); 

    this.add('role:api,path:indicators', function (msg, respond) {
        this.act('role:indicators,cmd:get', msg, respond);
    });

    this.add('role:api,path:goalindicator', function(msg,respond){
        this.act('role:indicators,cmd:assigngoal', msg, respond);
    });

    this.add('role:api,path:goalindicatorremove', function(msg, respond){
        this.act('role:indicators,cmd:removegoal', msg, respond);
    });

    this.add('role:api,path:indicatorexpectation', function (msg, respond) {
        this.act('role:indicators,cmd:setquarter', msg, respond);
    }); 

    this.add('role:api,path:indicatorsdatasource', function (msg, respond) {
        this.act('role:indicators,cmd:savedatasource', msg, respond);        
    });

    this.add('role:api,path:indicatorsdata', function (msg, respond) {
        this.act('role:indicators,cmd:saveimport', msg, respond);
    });

    this.add('role:api,path:goals', function(msg, respond){
        this.act('role:goals,cmd:get', msg, respond);        
    });

    this.add('role:api,path:goalcreate', function(msg, respond){
        this.act('role:goals,cmd:save', msg, respond);
    });

    this.add('role:api,path:goalupdate', function(msg, respond){
        this.act('role:goals,cmd:update', msg, respond);
    });


    this.add('role:api,path:goalremove', function(msg, respond){
        this.act('role:goals,cmd:delete', msg, respond);
    });

    this.add('role:api,path:customers', function(msg,respond){
        if(msg.request$.method === 'GET'){
            this.act('role:customers,cmd:getall',msg,respond);
        }
        else{
            this.act('role:customers,cmd:save', msg, respond);
        }
    });


    this.add('role:api,path:login', function(msg, respond){
        var pin = {
            role:'user',
            cmd:'login',
            email: msg.request$.body.email,
            password:msg.request$.body.password
        };
        this.act(pin, function(error, result){
            respond(null, result);
        });
    });

    this.add('role:api,path:auth', function(msg, respond){
        var pin = {
            role:'user',
            cmd:'auth',
            token: msg.args.params.token
        };
        this.act(pin, function(error, result){
            respond(null, result);
        });
    });

    this.add('role:api,path:profile', function(msg, respond){
        console.log('profile', msg);
    });

    this.add('init:api', function (msg, respond) {
        this.act('role:web',routes, respond);
    });

    this.wrap('role:api', function(msg, respond){
        msg = setCustomerId(msg);
        this.prior(msg, respond);
    });

    function setCustomerId(msg){
        if(msg.request$ && msg.request$.user){
            msg.args.params.customerId = msg.request$.user.user;
        }
        return msg;
    }

}