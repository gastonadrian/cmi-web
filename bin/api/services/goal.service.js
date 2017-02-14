"use strict";
var _ = require("lodash");
var indicator_service_1 = require("./indicator.service");
var goal_entity_1 = require("./../data/goal.entity");
var shared_1 = require("./../models/shared");
var goal_1 = require("./../models/api/goal");
var GoalService = (function () {
    function GoalService() {
    }
    GoalService.getGoalsPerformance = function (customerId, withIndicators, from, to) {
        var self = this;
        return goal_entity_1.GoalDataService.getGoals(customerId, true)
            .then(function onGetGoals(mongoGoals) {
            var indicators, goalIds = [], goalIndicatorSpec = [], result = [];
            // get the performance of all indicators inside the goals
            goalIds = mongoGoals.map(function goalIdMap(goal) {
                return goal._id.toString();
            });
            return Promise.all([
                indicator_service_1.IndicatorService.getIndicatorsPerformance(customerId, goalIds, from, to),
                indicator_service_1.IndicatorService.getGoalIndicators(customerId, goalIds)
            ]).then(function onIndicators(values) {
                indicators = values[0];
                goalIndicatorSpec = values[1];
                // calculate goal performance
                for (var i = 0; i < mongoGoals.length; i++) {
                    // take the factors from here
                    var indicatorSpecs = _.filter(goalIndicatorSpec, _.matches({ goalId: mongoGoals[i]._id.toString() }));
                    // take the indicators with performance from here
                    var indicatorsWithPerformance = _.filter(indicators, function filterByGoal(ind) {
                        return _.includes(ind.goalIds, mongoGoals[i]._id.toString());
                    });
                    var performance = self.calculateGoalPerformance(mongoGoals[i], indicatorsWithPerformance, indicatorSpecs);
                    result.push(new goal_1.GoalApiResult(mongoGoals[i]._id.toString(), mongoGoals[i].customerId, mongoGoals[i].title, mongoGoals[i].perspectiveId, performance));
                }
                return result;
            });
        });
    };
    GoalService.calculateGoalPerformance = function (goal, indicators, indicatorFactors) {
        var unitPercentage = 1 / _.sumBy(indicatorFactors, 'factor');
        var result = {
            semaphoreStatus: shared_1.SemaphoreStatus.green,
            value: 0
        };
        for (var i = 0; i < indicators.length; i++) {
            var goalIndicator = indicatorFactors.find(function (goalInd, index) { return goalInd.indicatorId == indicators[i]._id; });
            result.value += goalIndicator.factor * unitPercentage * indicators[i].performance.value;
        }
        // so we are on the same scale for comparison (0 to 100)
        result.value = result.value;
        if (result.value <= goal.semaphore.yellowUntil) {
            if (result.value <= goal.semaphore.redUntil) {
                result.semaphoreStatus = shared_1.SemaphoreStatus.red;
            }
            else {
                result.semaphoreStatus = shared_1.SemaphoreStatus.yellow;
            }
        }
        return result;
    };
    return GoalService;
}());
exports.GoalService = GoalService;
//# sourceMappingURL=goal.service.js.map