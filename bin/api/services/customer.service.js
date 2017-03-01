"use strict";
// import { CustomerDataService  } from './../data/datasource.entity';
var perspective_entity_1 = require("./../data/perspective.entity");
var CustomerService = (function () {
    function CustomerService() {
    }
    CustomerService.create = function (customerId) {
        return perspective_entity_1.PerspectiveDataService.createBasePerspectives(customerId);
    };
    return CustomerService;
}());
exports.CustomerService = CustomerService;
//# sourceMappingURL=customer.service.js.map