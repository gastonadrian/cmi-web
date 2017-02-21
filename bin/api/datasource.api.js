module.exports = function perspectiveApi() {
    var datasourceService = require('./services/datasource.service').DatasourceService;
    this.add('role:datasources,cmd:save', saveDatasource);
    function saveDatasource(msg, respond) {
        datasourceService.createDatasource(msg.args.params.customerId, msg.args.body)
            .then(function onDatasourceCreated(result) {
            respond(null, result);
        });
    }
};
//# sourceMappingURL=datasource.api.js.map