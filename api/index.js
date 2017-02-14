module.exports = function api(options) {

    var routes = require('./routes');

    this.add('role:api,path:dashboard', function (msg, respond) {
        msg.args.params.customerId = '22';
        this.act('role:dashboard,cmd:index', msg, respond);
    });

    this.add('init:api', function (msg, respond) {
        this.act('role:web',routes, respond);
    });
}