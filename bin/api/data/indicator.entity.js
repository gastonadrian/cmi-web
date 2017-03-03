"use strict";
var mongoControl = require("mongo-control");
var utils = require("./../utils");
var mongodb_1 = require("mongodb");
var IndicatorDataService = (function () {
    function IndicatorDataService() {
    }
    /**
     *
     *
     * @param {any} customerId
     * @param {any} goalsId
     * @returns
     */
    IndicatorDataService.getAllByGoalIds = function (customerId, goalIds) {
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
    IndicatorDataService.getIndicatorsLastSync = function (indicatorIds) {
        if (!indicatorIds.length) {
            return new Promise(function (resolve, reject) {
                resolve([]);
            });
        }
        var aggregateParams = {
            db: utils.getConnString(),
            collection: 'indicators-data',
            pipeline: [
                {
                    '$match': {
                        'indicatorId': {
                            '$in': indicatorIds
                        }
                    }
                },
                {
                    '$group': {
                        '_id': '$indicatorId',
                        'date': { '$max': '$date' }
                    }
                }
            ]
        };
        return mongoControl.aggregate(aggregateParams);
    };
    IndicatorDataService.getAllByCustomerId = function (customerId, active) {
        var findParams = {
            db: utils.getConnString(),
            collection: 'indicators',
            query: {
                customerId: customerId
            }
        };
        if (active === false || active === true) {
            findParams.query.active = active;
        }
        return mongoControl.find(findParams);
    };
    /**
     *
     *
     * @param {any} customerId
     * @param {any} indicatorId
     * @returns
     */
    IndicatorDataService.get = function (customerId, indicatorId) {
        var findParams = {
            db: utils.getConnString(),
            collection: 'indicators',
            id: indicatorId
        };
        return mongoControl.getById(findParams);
    };
    IndicatorDataService.insertIndicator = function (indicator) {
        // is active as long as it has a datasource id assigned
        indicator.active = !!indicator.datasource._id;
        var params = {
            db: utils.getConnString(),
            collection: 'indicators',
            data: [indicator]
        };
        return mongoControl.insert(params)
            .then(function (response) {
            return {
                id: response.insertedIds.pop().toString()
            };
        });
    };
    IndicatorDataService.updateIndicator = function (indicator) {
        var params = {
            db: utils.getConnString(),
            collection: 'indicators',
            query: {
                _id: new mongodb_1.ObjectID(indicator._id)
            }
        };
        delete indicator._id;
        params.update = indicator;
        return mongoControl.update(params)
            .then(function (response) {
            return response.result;
        });
    };
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
    IndicatorDataService.insertGoalIndicator = function (customerId, goalIndicator) {
        var self = this;
        return this.getGoalIndicators(customerId, [goalIndicator.goalId])
            .then(function onGetGoalIndicators(goalIndicators) {
            if (goalIndicators.length) {
                // update 
                return self.updateGoalIndicator(customerId, goalIndicator);
            }
            var params = {
                db: utils.getConnString(),
                collection: 'goal-indicators',
                data: [goalIndicator]
            };
            return mongoControl.insert(params)
                .then(function (response) {
                return {
                    ok: !!response.insertedIds.length
                };
            });
        });
    };
    IndicatorDataService.removeGoalIndicator = function (customerId, goalId, indicatorId) {
        // delete goal-indicator relations
        var goalIndicatorParams = {
            db: utils.getConnString(),
            collection: 'goal-indicators',
            query: {
                goalId: goalId,
                indicatorId: indicatorId,
                customerId: customerId
            }
        };
        return mongoControl.remove(goalIndicatorParams)
            .then(function (response) {
            return response.result;
        });
    };
    IndicatorDataService.updateGoalIndicator = function (customerId, goalIndicator) {
        var params = {
            db: utils.getConnString(),
            collection: 'goal-indicators',
            query: {
                customerId: customerId,
                goalId: goalIndicator.goalId,
                indicatorId: goalIndicator.indicatorId
            },
            update: goalIndicator
        };
        return mongoControl.update(params)
            .then(function (response) {
            return response.result;
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
                }
            }
        };
        if (from && to) {
            findParams.query.date = {
                "$gte": from,
                "$lte": to
            };
        }
        return mongoControl.find(findParams);
    };
    IndicatorDataService.insertIndicatorData = function (indicatorDataArray) {
        var params = {
            db: utils.getConnString(),
            collection: 'indicators-data',
            data: indicatorDataArray
        };
        return mongoControl.insert(params);
    };
    IndicatorDataService.updateIndicatorData = function (customerId, indicatorId, date, expected) {
        var params = {
            db: utils.getConnString(),
            collection: 'indicators-data',
            query: {
                customerId: customerId,
                indicatorId: indicatorId,
                date: date
            },
            update: {
                expected: expected
            }
        };
        return mongoControl.update(params)
            .then(function (response) {
            return response.result;
        });
    };
    return IndicatorDataService;
}());
exports.IndicatorDataService = IndicatorDataService;
//# sourceMappingURL=indicator.entity.js.map