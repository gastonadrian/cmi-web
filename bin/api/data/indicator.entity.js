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
    IndicatorDataService.getAllByGoalIds = function (customerId, goalIds, from, to) {
        console.time('9.1:getAllByGoalIds');
        for (var i = 0; i < goalIds.length; i++) {
            goalIds[i] = new mongodb_1.ObjectID(goalIds[i].toString());
        }
        var findParams = {
            db: utils.getConnString(),
            collection: 'indicators',
            pipeline: [
                {
                    $match: {
                        active: true,
                        customerId: new mongodb_1.ObjectID(customerId),
                        goalIds: {
                            "$in": goalIds
                        }
                    }
                },
                {
                    $lookup: {
                        from: "indicator-performance",
                        localField: "_id",
                        foreignField: "indicatorId",
                        as: "performances"
                    }
                },
                {
                    $lookup: {
                        from: "goal-indicators",
                        localField: "_id",
                        foreignField: "indicatorId",
                        as: "goalIndicators"
                    }
                },
                {
                    $lookup: {
                        from: "indicators-data",
                        localField: "_id",
                        foreignField: "indicatorId",
                        as: "indicatorData"
                    }
                },
                {
                    $unwind: {
                        path: '$indicatorData',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $match: {
                        $or: [
                            {
                                "indicatorData.date": {
                                    "$gte": from,
                                    "$lte": to
                                }
                            },
                            {
                                "indicatorData": { $exists: false }
                            }
                        ]
                    }
                },
                {
                    "$group": {
                        _id: '$_id',
                        'performances': { $first: '$performances' },
                        'goalIds': { $first: '$goalIds' },
                        'semaphore': { $first: '$semaphore' },
                        'datasource': { $first: '$datasource' },
                        'title': { $first: '$title' },
                        'data': { $first: '$data' },
                        'performanceComparison': { $first: '$performanceComparison' },
                        'customerId': { $first: '$customerId' },
                        'active': { $first: '$active' },
                        'goalIndicators': { $first: '$goalIndicators' },
                        'indicatorData': { $push: '$indicatorData' },
                    },
                }
            ]
        };
        return mongoControl.aggregate(findParams).then(function onIndicatorsResponse(collection) {
            console.timeEnd('9.1:getAllByGoalIds');
            return collection;
        });
    };
    IndicatorDataService.getByGoalIds = function (customerId, goalIds) {
        for (var i = 0; i < goalIds.length; i++) {
            goalIds[i] = new mongodb_1.ObjectID(goalIds[i].toString());
        }
        var findParams = {
            db: utils.getConnString(),
            collection: 'indicators',
            query: {
                customerId: new mongodb_1.ObjectID(customerId),
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
        for (var i = 0; i < indicatorIds.length; i++) {
            indicatorIds[i] = new mongodb_1.ObjectID(indicatorIds[i].toString());
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
                customerId: new mongodb_1.ObjectID(customerId)
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
        indicator.customerId = new mongodb_1.ObjectID(indicator.customerId.toString());
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
        indicator.customerId = new mongodb_1.ObjectID(indicator.customerId.toString());
        for (var i = 0; i < indicator.goalIds.length; i++) {
            indicator.goalIds[i] = new mongodb_1.ObjectID(indicator.goalIds[i].toString());
        }
        params.update = indicator;
        return mongoControl.update(params)
            .then(function (response) {
            return response.result;
        });
    };
    IndicatorDataService.getGoalIndicators = function (customerId, goalIds) {
        console.time('8.2:getGoalIndicators');
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
            console.timeEnd('8.2:getGoalIndicators');
            return collection;
        });
    };
    IndicatorDataService.insertGoalIndicator = function (customerId, goalIndicator) {
        var self = this;
        goalIndicator.indicatorId = new mongodb_1.ObjectID(goalIndicator.indicatorId.toString());
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
                indicatorId: new mongodb_1.ObjectID(indicatorId),
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
                indicatorId: new mongodb_1.ObjectID(goalIndicator.indicatorId.toString())
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
    IndicatorDataService.getIndicatorsDataBetween = function (customerId, indicatorIds, from, to) {
        console.time('12.1:getIndicatorsDataBetween');
        for (var i = 0; i < indicatorIds.length; i++) {
            indicatorIds[i] = new mongodb_1.ObjectID(indicatorIds[i].toString());
        }
        var findParams = {
            db: utils.getConnString(),
            collection: 'indicators-data',
            query: {
                customerId: customerId,
                indicatorId: {
                    "$in": indicatorIds
                }
            },
            sortBy: {
                "date": 1
            }
        };
        if (from && to) {
            findParams.query.date = {
                "$gte": from,
                "$lte": to
            };
        }
        return mongoControl.find(findParams)
            .then(function (response) {
            console.timeEnd('12.1:getIndicatorsDataBetween');
            return response;
        });
    };
    IndicatorDataService.getIndicatorDataDates = function (customerId, indicatorId, dates) {
        var findParams = {
            db: utils.getConnString(),
            collection: 'indicators-data',
            query: {
                customerId: customerId,
                indicatorId: new mongodb_1.ObjectID(indicatorId.toString()),
                date: {
                    "$in": dates
                }
            }
        };
        return mongoControl.find(findParams)
            .then(function (response) {
            return response;
        });
    };
    IndicatorDataService.insertIndicatorData = function (indicatorDataArray) {
        for (var i = 0; i < indicatorDataArray.length; i++) {
            indicatorDataArray[i].indicatorId = new mongodb_1.ObjectID(indicatorDataArray[i].indicatorId.toString());
        }
        var params = {
            db: utils.getConnString(),
            collection: 'indicators-data',
            data: indicatorDataArray
        };
        return mongoControl.insert(params);
    };
    IndicatorDataService.updateIndicatorData = function (customerId, indicatorId, id, expected) {
        var params = {
            db: utils.getConnString(),
            collection: 'indicators-data',
            query: {
                customerId: customerId,
                indicatorId: new mongodb_1.ObjectID(indicatorId.toString()),
                _id: new mongodb_1.ObjectID(id.toString())
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
    IndicatorDataService.updateIndicatorDataValue = function (customerId, indicatorData) {
        var params = {
            db: utils.getConnString(),
            collection: 'indicators-data',
            id: indicatorData._id,
            update: {
                value: indicatorData.value
            }
        };
        return mongoControl.updateById(params)
            .then(function (response) {
            return response.result;
        });
    };
    IndicatorDataService.insertPerformance = function (indicatorPerformance) {
        indicatorPerformance.indicatorId = new mongodb_1.ObjectID(indicatorPerformance.indicatorId.toString());
        var params = {
            db: utils.getConnString(),
            collection: 'indicator-performance',
            data: [indicatorPerformance]
        };
        return mongoControl.insert(params)
            .then(function (response) {
            return {
                id: response.insertedIds.pop().toString()
            };
        });
    };
    IndicatorDataService.getPerformance = function (indicatorIds, from, to) {
        console.time('10.1:getPerformance');
        for (var i = 0; i < indicatorIds.length; i++) {
            indicatorIds[i] = new mongodb_1.ObjectID(indicatorIds[i].toString());
        }
        var findParams = {
            db: utils.getConnString(),
            collection: 'indicator-performance',
            query: {
                indicatorId: {
                    "$in": indicatorIds
                }
            },
            sortBy: {
                "to": -1
            }
        };
        if (from && to) {
            findParams.query.from = from;
            findParams.query.to = to;
        }
        return mongoControl.find(findParams).
            then(function (response) {
            console.timeEnd('10.1:getPerformance');
            return response;
        });
    };
    IndicatorDataService.removeCachedPerformance = function (indicatorId, from, to) {
        // delete goal-indicator relations
        var goalIndicatorParams = {
            db: utils.getConnString(),
            collection: 'indicator-performance',
            query: {
                indicatorId: new mongodb_1.ObjectID(indicatorId.toString())
            }
        };
        if (from && to) {
            goalIndicatorParams.query.from = { '$lte': from };
            goalIndicatorParams.query.to = { '$gte': to };
        }
        return mongoControl.remove(goalIndicatorParams)
            .then(function (response) {
            return response.result;
        });
    };
    return IndicatorDataService;
}());
exports.IndicatorDataService = IndicatorDataService;
//# sourceMappingURL=indicator.entity.js.map