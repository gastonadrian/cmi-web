module.exports = function perspectiveApi(){
    let datasourceService = require('./services/datasource.service').DatasourceService;

    this.add('role:datasources,cmd:save', saveDatasource);
    this.add('role:datasources,cmd:get', get)

    function saveDatasource(msg, respond){
        datasourceService.createDatasource(msg.args.params.customerId, msg.args.body)
            .then(function onDatasourceCreated(result){
                respond(null, result);
            });
    }

    function get(msg, respond){
        datasourceService.getDatasources(msg.args.params.customerId)
            .then(function onGet(result){
                respond(null, result);
            });
    }
}