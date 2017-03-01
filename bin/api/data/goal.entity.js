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
    GoalDataService.getByCustomerId = function (customerId, active) {
        var findParams = {
            db: utils.getConnString(),
            collection: 'goals',
            query: {
                customerId: customerId
            }
        };
        if (active === false || active === true) {
            findParams.query.active = true;
        }
        return mongoControl.find(findParams);
    };
    GoalDataService.insertGoal = function (goal) {
        var params = {
            db: utils.getConnString(),
            collection: 'goals',
            data: [goal]
        };
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
    return GoalDataService;
}());
exports.GoalDataService = GoalDataService;
//# sourceMappingURL=goal.entity.js.map