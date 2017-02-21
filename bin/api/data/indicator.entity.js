"use strict";
var mongoControl = require("mongo-control");
var utils = require("./../utils");
var IndicatorDataService = (function () {
    function IndicatorDataService() {
    }
    IndicatorDataService.getGoalIndicators = function (customerId, goalIds) {
        var findParams = {
            db: utils.getConnString(),
            collection: 'goal-indicators',
            query: {
                customerId: customerId,
                goalId: {
                    "$in": goalIds
                }
            }
        };
        return mongoControl.find(findParams).then(function onIndicatorsResponse(collection) {
            return collection;
        });
    };
    /**
     *
     *
     * @param {any} customerId
     * @param {any} goalsId
     * @returns
     */
    IndicatorDataService.getIndicators = function (customerId, goalIds) {
        var findParams = {
            db: utils.getConnString(),
            collection: 'indicators',
            query: {
                customerId: customerId,
                goalIds: {
                    "$in": goalIds
                }
            }
        };
        return mongoControl.find(findParams).then(function onIndicatorsResponse(collection) {
            return collection;
        });
    };
    /**
     *
     *
     * @param {any} customerId
     * @param {any} indicatorIds
     * @param {any} from
     * @param {any} to
     * @returns
     */
    IndicatorDataService.getIndicatorsData = function (customerId, indicatorIds, from, to) {
        var findParams = {
            db: utils.getConnString(),
            collection: 'indicators-data',
            query: {
                customerId: customerId,
                indicatorId: {
                    "$in": indicatorIds
                },
                date: {
                    "$gte": from,
                    "$lte": to
                }
            }
        };
        return mongoControl.find(findParams);
    };
    IndicatorDataService.insertIndicator = function (indicator) {
        var params = {
            db: utils.getConnString(),
            collection: 'indicators',
            data: [indicator]
        };
        return mongoControl.insert(params);
    };
    IndicatorDataService.insertIndicatorData = function (indicatorDataArray) {
        var params = {
            db: utils.getConnString(),
            collection: 'indicators-data',
            data: indicatorDataArray
        };
        return mongoControl.insert(params);
    };
    IndicatorDataService.insertGoalIndicator = function (goalIndicatorArray) {
        var params = {
            db: utils.getConnString(),
            collection: 'goal-indicators',
            data: goalIndicatorArray
        };
        return mongoControl.insert(params);
    };
    return IndicatorDataService;
}());
exports.IndicatorDataService = IndicatorDataService;
//# sourceMappingURL=indicator.entity.js.map