module.exports = function api(options) {
    var routes = require('./routes');
    this.add('role:api,path:dashboard', function (msg, respond) {
        this.act('role:dashboard,cmd:index', msg, respond);
    });
    this.add('role:api,path:datasources', function (msg, respond) {
        if (msg.request$.method === 'GET') {
            this.act('role:datasources,cmd:get', msg, respond);
        }
        else {
            this.act('role:datasources,cmd:save', msg, respond);
        }
    });
    this.add('role:api,path:indicators', function (msg, respond) {
        this.act('role:indicators,cmd:save', msg, respond);
    });
    this.add('role:api,path:indicatorsdata', function (msg, respond) {
        this.act('role:indicators,cmd:saveimport', msg, respond);
    });
    this.add('init:api', function (msg, respond) {
        this.act('role:web', routes, respond);
    });
    this.wrap('role:api', function (msg, respond) {
        msg = setCustomerId(msg);
        this.prior(msg, respond);
    });
    function setCustomerId(msg) {
        msg.args.params.customerId = '22';
        return msg;
    }
};
//# sourceMappingURL=index.js.map