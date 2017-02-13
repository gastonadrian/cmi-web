module.exports = function dashboardApi() {
    var dashboardService = require('./services/dashboard.service');
    this.add('role:dashboard,cmd:index', getDashboard);
    function init() {
        dashboardService = new dashboardService.DashboardService();
    }
    function getDashboard(msg, respond) {
        var result = dashboardService.getDashboard(msg.args.params.from, msg.args.params.to);
        console.log(result);
        respond(null, result);
    }
    init();
};
//# sourceMappingURL=dashboard.js.map