"use strict";
var mongoControl = require("mongo-control");
var utils = require("./../utils");
var mongodb_1 = require("mongodb");
var PerspectiveDataService = (function () {
    function PerspectiveDataService() {
    }
    PerspectiveDataService.getPerspectives = function (customerId) {
        console.time('3.1:getPerspectives');
        var findParams = {
            db: utils.getConnString(),
            collection: 'perspectives',
            pipeline: [
                {
                    $match: {
                        customerId: new mongodb_1.ObjectID(customerId)
                    }
                },
                {
                    $lookup: {
                        from: "goals",
                        localField: "_id",
                        foreignField: "perspectiveId",
                        as: "goals"
                    }
                }
            ]
        };
        return mongoControl.aggregate(findParams)
            .then(function onOk(response) {
            console.timeEnd('3.1:getPerspectives');
            return response;
        });
    };
    PerspectiveDataService.createBasePerspectives = function (customerId) {
        var financiera = {
            "customerId": new mongodb_1.ObjectID(customerId),
            "title": "Perspectiva Financiera",
            "semaphore": {
                "redUntil": 0.3,
                "yellowUntil": 0.59
            }
        };
        var clientes = {
            "customerId": new mongodb_1.ObjectID(customerId),
            "title": "Perspectiva Clientes",
            "semaphore": {
                "redUntil": 0.3,
                "yellowUntil": 0.59
            }
        };
        var procesos = {
            "customerId": new mongodb_1.ObjectID(customerId),
            "title": "Perspectiva de Procesos",
            "semaphore": {
                "redUntil": 0.3,
                "yellowUntil": 0.59
            }
        };
        var aprendizaje = {
            "customerId": new mongodb_1.ObjectID(customerId),
            "title": "Perspectiva de Aprendizaje",
            "semaphore": {
                "redUntil": 0.3,
                "yellowUntil": 0.59
            }
        };
        return this.insertPerspectives([financiera, clientes, procesos, aprendizaje]);
    };
    PerspectiveDataService.insertPerspectives = function (perspectives) {
        var params = {
            db: utils.getConnString(),
            collection: 'perspectives'
        };
        for (var i = 0; i < perspectives.length; i++) {
            perspectives[i].customerId = new mongodb_1.ObjectID(perspectives[i].customerId.toString());
        }
        params.data = perspectives;
        return mongoControl.insert(params);
    };
    PerspectiveDataService.update = function (perspective) {
        var params = {
            db: utils.getConnString(),
            collection: 'perspectives',
            id: perspective._id
        };
        delete perspective._id;
        perspective.customerId = new mongodb_1.ObjectID(perspective.customerId.toString());
        perspective.goals = [];
        params.update = perspective;
        return mongoControl.updateById(params);
    };
    return PerspectiveDataService;
}());
exports.PerspectiveDataService = PerspectiveDataService;
//# sourceMappingURL=perspective.entity.js.map