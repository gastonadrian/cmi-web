module.exports = function api(options) {
    var routes = require('./routes');
    this.add('role:api,path:dashboard', function (msg, respond) {
        this.act('role:dashboard,cmd:index', msg, respond);
    });
    this.add('init:api', function (msg, respond) {
        this.act('role:web', routes, respond);
    });
};
//# sourceMappingURL=index.js.map