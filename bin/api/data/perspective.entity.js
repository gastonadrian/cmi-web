"use strict";
var mongoControl = require("mongo-control");
var utils = require("./../utils");
var PerspectiveDataService = (function () {
    function PerspectiveDataService() {
    }
    PerspectiveDataService.getPerspectives = function (customerId) {
        var findParams = {
            db: utils.getConnString(),
            collection: 'perspectives',
            query: {
                customerId: customerId
            }
        };
        return mongoControl.find(findParams);
    };
    PerspectiveDataService.createBasePerspectives = function (customerId) {
        var financiera = {
            "customerId": customerId,
            "title": "Perspectiva Financiera",
            "semaphore": {
                "redUntil": 30,
                "yellowUntil": 59
            }
        };
        var clientes = {
            "customerId": customerId,
            "title": "Perspectiva Clientes",
            "semaphore": {
                "redUntil": 30,
                "yellowUntil": 59
            }
        };
        var procesos = {
            "customerId": customerId,
            "title": "Perspectiva de Procesos",
            "semaphore": {
                "redUntil": 30,
                "yellowUntil": 59
            }
        };
        var aprendizaje = {
            "customerId": customerId,
            "title": "Perspectiva de Aprendizaje",
            "semaphore": {
                "redUntil": 30,
                "yellowUntil": 59
            }
        };
        return this.insertPerspectives([financiera, clientes, procesos, aprendizaje]);
    };
    PerspectiveDataService.insertPerspectives = function (perspectives) {
        var params = {
            db: utils.getConnString(),
            collection: 'perspectives',
            data: perspectives
        };
        return mongoControl.insert(params);
    };
    PerspectiveDataService.update = function (perspective) {
        var params = {
            db: utils.getConnString(),
            collection: 'perspectives',
            id: perspective._id
        };
        delete perspective._id;
        params.update = perspective;
        return mongoControl.updateById(params);
    };
    return PerspectiveDataService;
}());
exports.PerspectiveDataService = PerspectiveDataService;
//# sourceMappingURL=perspective.entity.js.map