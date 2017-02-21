"use strict";
var mongoControl = require("mongo-control");
var utils = require("./../utils");
var DatasourceDataService = (function () {
    function DatasourceDataService() {
    }
    DatasourceDataService.get = function (customerId) {
        var findParams = {
            db: utils.getConnString(),
            collection: 'datasources',
            query: {
                customerId: customerId
            }
        };
        return mongoControl.find(findParams);
    };
    DatasourceDataService.insertDatasource = function (datasource) {
        var params = {
            db: utils.getConnString(),
            collection: 'datasources',
            data: [datasource]
        };
        return mongoControl.insert(params)
            .then(function (response) {
            return {
                id: response.insertedIds.pop().toString()
            };
        });
    };
    return DatasourceDataService;
}());
exports.DatasourceDataService = DatasourceDataService;
//# sourceMappingURL=datasource.entity.js.map