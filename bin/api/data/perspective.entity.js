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
        // let perspectives:Array<MongoPerspective> = [
        //     new MongoPerspective(
        //         customerId,
        //         'Perspectiva Financiera',
        //         {
        //            redUntil:30,
        //            yellowUntil:59
        //         }),
        //     new MongoPerspective(
        //         customerId,
        //         'Perspectiva Clientes',
        //         {
        //            redUntil:30,
        //            yellowUntil:59
        //         }),
        //     new MongoPerspective(
        //         customerId,
        //         'Perspectiva de Aprendizaje',
        //         {
        //            redUntil:30,
        //            yellowUntil:59
        //         }),
        //     new MongoPerspective(
        //         customerId,
        //         'Perspectiva de Procesos',
        //         {
        //            redUntil:30,
        //            yellowUntil:59
        //         })
        //     ];
    };
    PerspectiveDataService.insertPerspectives = function (perspectives) {
        var params = {
            db: utils.getConnString(),
            collection: 'perspectives',
            data: perspectives
        };
        return mongoControl.insert(params);
    };
    return PerspectiveDataService;
}());
exports.PerspectiveDataService = PerspectiveDataService;
//# sourceMappingURL=perspective.entity.js.map