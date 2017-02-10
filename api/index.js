module.exports = function api(options) {

    var routes = require('./routes');

    this.add('role:api,path:dashboard', function (msg, respond) {
        console.log('from', msg.args.params.from);
        console.log('to', msg.args.params.to);
        this.act('role:dashboard,cmd:index', msg, respond);
    });

    this.add('init:api', function (msg, respond) {
        this.act('role:web',routes, respond);
    });
}