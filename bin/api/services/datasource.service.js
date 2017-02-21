"use strict";
var datasource_entity_1 = require("./../data/datasource.entity");
var DatasourceService = (function () {
    function DatasourceService() {
    }
    DatasourceService.createDatasource = function (customerId, datasource) {
        if (!datasource.customerId) {
            datasource.customerId = customerId;
        }
        return datasource_entity_1.DatasourceDataService.insertDatasource(datasource);
    };
    return DatasourceService;
}());
exports.DatasourceService = DatasourceService;
//# sourceMappingURL=datasource.service.js.map