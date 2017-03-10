"use strict";
var utils = require("./../utils");
var mongoControl = require("mongo-control");
var perspective_entity_1 = require("./../data/perspective.entity");
var CustomerService = (function () {
    function CustomerService() {
    }
    CustomerService.create = function (customerId) {
        return perspective_entity_1.PerspectiveDataService.createBasePerspectives(customerId);
    };
    CustomerService.getAll = function (customer) {
        var findParams = {
            db: utils.getConnString(),
            collection: 'sys_user',
            query: {}
        };
        return mongoControl.find(findParams);
    };
    return CustomerService;
}());
exports.CustomerService = CustomerService;
//# sourceMappingURL=customer.service.js.map