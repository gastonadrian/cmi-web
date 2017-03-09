"use strict";
var mongoControl = require("mongo-control");
var utils = require("./../utils");
var mongodb_1 = require("mongodb");
var GoalDataService = (function () {
    function GoalDataService() {
    }
    GoalDataService.get = function (goalId) {
        var findParams = {
            db: utils.getConnString(),
            collection: 'goals',
            id: goalId
        };
        return mongoControl.getById(findParams);
    };
    GoalDataService.getByIds = function (customerId, goalIds, active) {
        var findParams = {
            db: utils.getConnString(),
            collection: 'goals',
        }, mongoIds = [];
        if (!goalIds.length) {
            return new Promise(function ok(resolve, reject) {
                return reject('no hay datos');
            });
        }
        for (var i = 0; i < goalIds.length; i++) {
            mongoIds.push(new mongodb_1.ObjectID(goalIds[i]));
        }
        findParams.query = {
            "_id": {
                "$in": mongoIds
            },
            "customerId": new mongodb_1.ObjectID(customerId)
        };
        if (active === true || active === false) {
            findParams.query.active = active;
        }
        return mongoControl.find(findParams);
    };
    GoalDataService.getByCustomerId = function (customerId, active) {
        console.time('4:getByCustomerId');
        var findParams = {
            db: utils.getConnString(),
            collection: 'goals',
            query: {
                customerId: new mongodb_1.ObjectID(customerId)
            }
        };
        if (active === false || active === true) {
            findParams.query.active = true;
        }
        return mongoControl.find(findParams)
            .then(function (response) {
            console.timeEnd('4:getByCustomerId');
            return response;
        });
    };
    GoalDataService.insertGoal = function (goal) {
        var params = {
            db: utils.getConnString(),
            collection: 'goals'
        };
        goal.customerId = new mongodb_1.ObjectID(goal.customerId);
        goal.perspectiveId = new mongodb_1.ObjectID(goal.perspectiveId);
        delete goal['indicators'];
        params.data = [goal];
        return mongoControl.insert(params)
            .then(function (response) {
            return {
                id: response.insertedIds.pop().toString()
            };
        });
    };
    GoalDataService.update = function (goal) {
        var params = {
            db: utils.getConnString(),
            collection: 'goals',
            id: goal._id
        };
        delete goal._id;
        delete goal['indicators'];
        goal.customerId = new mongodb_1.ObjectID(goal.customerId.toString());
        goal.perspectiveId = new mongodb_1.ObjectID(goal.perspectiveId.toString());
        params.update = goal;
        return mongoControl.updateById(params);
    };
    GoalDataService.deleteGoal = function (customerId, goalId) {
        // delete goal-indicator relations
        var goalIndicatorParams = {
            db: utils.getConnString(),
            collection: 'goal-indicators',
            query: {
                goalId: goalId,
                customerId: customerId
            }
        };
        return mongoControl.remove(goalIndicatorParams)
            .then(function (response) {
            // delete goal
            var params = {
                db: utils.getConnString(),
                collection: 'goals',
                query: {
                    _id: new mongodb_1.ObjectID(goalId),
                    customerId: customerId
                }
            };
            return mongoControl.remove(params)
                .then(function (response) {
                return response.result;
            });
        });
    };
    GoalDataService.insertGoalPerformance = function (goalPerformance) {
        var params = {
            db: utils.getConnString(),
            collection: 'goal-performance',
            data: [goalPerformance]
        };
        return mongoControl.insert(params)
            .then(function (response) {
            return {
                id: response.insertedIds.pop().toString()
            };
        });
    };
    GoalDataService.getGoalPerformance = function (goalIds, from, to) {
        console.time('6:getGoalPerformance');
        var findParams = {
            db: utils.getConnString(),
            collection: 'goal-performance',
            query: {
                goalId: {
                    "$in": goalIds
                }
            },
            sortBy: {
                "to": -1
            }
        };
        if (from && to) {
            findParams.query.from = from;
            findParams.query.to = {
                "$gte": from,
                "$lte": to
            };
        }
        return mongoControl.find(findParams)
            .then(function onOK(response) {
            console.timeEnd('6:getGoalPerformance');
            return response;
        });
    };
    GoalDataService.removePerformance = function (goalId, from, to) {
        var removePerformanceParams = {
            db: utils.getConnString(),
            collection: 'goal-performance',
            query: {
                goalId: goalId
            }
        };
        if (from && to) {
            removePerformanceParams.query.from = { '$lte': from };
            removePerformanceParams.query.to = { '$gte': to };
        }
        return mongoControl.remove(removePerformanceParams)
            .then(function (response) {
            return response.result;
        });
    };
    return GoalDataService;
}());
exports.GoalDataService = GoalDataService;
//# sourceMappingURL=goal.entity.js.map