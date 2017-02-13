module.exports = function dashboardApi(){
    let dashboardService = require('./services/dashboard.service');

    this.add('role:dashboard,cmd:index', getDashboard);

    function init(){
        dashboardService = new dashboardService.DashboardService();
    }


    function getDashboard(msg, respond){
        var result = dashboardService.getDashboard(msg.args.params.from, msg.args.params.to);
        respond(null, result);
    }

    init();   
}