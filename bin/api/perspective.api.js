module.exports = function perspectiveApi() {
    var perspectiveService = require('./services/perspective.service').PerspectiveService;
    this.add('role:dashboard,cmd:index', getDashboard);
    function getDashboard(msg, respond) {
        perspectiveService.getDashboard(msg.args.params.customerId, msg.args.params.from, msg.args.params.to)
            .then(function onGetDashboard(result) {
            respond(null, result);
        });
    }
};
//# sourceMappingURL=perspective.api.js.map