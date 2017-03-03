"use strict";
var _ = require("lodash");
var indicator_service_1 = require("./indicator.service");
var goal_entity_1 = require("./../data/goal.entity");
var shared_1 = require("./../models/shared");
var GoalService = (function () {
    function GoalService() {
    }
    GoalService.get = function (customerId, goalId) {
        return Promise.all([
            goal_entity_1.GoalDataService.get(goalId),
            indicator_service_1.IndicatorService.getIndicatorsByGoalId(customerId, [goalId])
        ]).then(function onGetAll(values) {
            var goal = values[0];
            if (!goal) {
                return { ok: false };
            }
            return _.extend(goal, {
                indicators: values[1]
            });
        });
    };
    GoalService.getByIds = function (customerId, goalIds, active) {
        return goal_entity_1.GoalDataService.getByIds(customerId, goalIds, active);
    };
    GoalService.getByCustomerId = function (customerId) {
        return goal_entity_1.GoalDataService.getByCustomerId(customerId);
    };
    GoalService.save = function (customerId, goal) {
        goal.customerId = customerId;
        goal.active = false;
        if (!goal.title.length || !goal.perspectiveId) {
            return new Promise(function (resolve, reject) {
                return reject('Faltan datos');
            });
        }
        if (goal.semaphore) {
            if (goal.semaphore.redUntil > 1) {
                goal.semaphore.redUntil = (goal.semaphore.redUntil / 100) || 0;
            }
            if (goal.semaphore.yellowUntil > 1) {
                goal.semaphore.yellowUntil = (goal.semaphore.yellowUntil / 100) || 0;
            }
        }
        // a goal is active if at least has one active indicator
        if (goal.indicators && goal.indicators.length) {
            goal.active = !!_.filter(goal.indicators, _.matchesProperty('active', true)).length;
        }
        return goal_entity_1.GoalDataService.insertGoal(goal);
    };
    GoalService.update = function (customerId, goal) {
        if (!goal.title.length || !goal.perspectiveId) {
            return new Promise(function (resolve, reject) {
                return reject('Faltan datos');
            });
        }
        // a goal is active if at least has one active indicator
        if (goal.indicators && goal.indicators.length) {
            goal.active = !!_.filter(goal.indicators, _.matchesProperty('active', true)).length;
        }
        if (goal.semaphore) {
            if (goal.semaphore.redUntil > 1) {
                goal.semaphore.redUntil = (goal.semaphore.redUntil / 100) || 0;
            }
            if (goal.semaphore.yellowUntil > 1) {
                goal.semaphore.yellowUntil = (goal.semaphore.yellowUntil / 100) || 0;
            }
        }
        return goal_entity_1.GoalDataService.update(goal);
    };
    GoalService.delete = function (customerId, goalId) {
        return Promise.all([
            goal_entity_1.GoalDataService.deleteGoal(customerId, goalId),
            indicator_service_1.IndicatorService.getIndicatorsByGoalId(customerId, [goalId])
        ]).then(function onAll(values) {
            var removeGoalResult = values[0];
            var indicators = values[1];
            var promiseArray = [];
            for (var i = 0; i < indicators.length; i++) {
                _.remove(indicators[i].goalIds, function (value) { value === goalId; });
                promiseArray.push(indicator_service_1.IndicatorService.update(customerId, indicators[i]));
            }
            return Promise.all(promiseArray)
                .then(function onAllUpdates(updates) {
                for (var j = 0; j < updates.length; j++) {
                    removeGoalResult.ok = removeGoalResult.ok && updates[j].ok;
                }
                return removeGoalResult;
            });
        });
    };
    GoalService.getGoalsPerformance = function (customerId, withIndicators, from, to) {
        var self = this;
        return goal_entity_1.GoalDataService.getByCustomerId(customerId, true)
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
                    result.push(_.extend(mongoGoals[i], {
                        id: mongoGoals[i]._id.toString(),
                        performance: performance,
                        indicators: []
                    }));
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