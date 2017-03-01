module.exports = function perspectiveApi(){
    let perspectiveService = require('./services/perspective.service').PerspectiveService;

    this.add('role:dashboard,cmd:index', getDashboard);
    this.add('role:perspectives,cmd:getall', getAll);
    this.add('role:perspectives,cmd:save', save);

    function getDashboard(msg, respond){
        perspectiveService.getDashboard(msg.args.params.customerId, msg.args.params.from, msg.args.params.to)
            .then(function onGetDashboard(result){
                respond(null, result);
            });
    }

    function getAll(msg, respond) {
        perspectiveService.getAll(msg.args.params.customerId)
            .then(function onGetAll(result){
                respond(null, result);
            });
    }

    function save(msg, respond) {
        perspectiveService.save(msg.args.params.customerId, msg.args.body)
            .then(function onSave(result){
                respond(null, result);
            });
    }    
}