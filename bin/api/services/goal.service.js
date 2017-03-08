"use strict";
var utils = require("./../utils");
var _ = require("lodash");
var moment = require("moment");
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
    GoalService.getSingleGoalPerformance = function (customerId, goalId, from, to) {
        var period = utils.getPeriodFromParams(from, to);
        from = period.from;
        to = period.to;
        var self = this;
        return Promise.all([
            goal_entity_1.GoalDataService.getByIds(customerId, [goalId]),
            indicator_service_1.IndicatorService.getIndicatorsPerformance(customerId, [goalId], from, to)
        ])
            .then(function onGet(values) {
            var mongoGoals = values[0];
            var indicators = values[1];
            return self.goalCalculator(customerId, mongoGoals, from, to)
                .then(function onGoal(goals) {
                goals[0].indicators = indicators;
                return goals[0];
            });
        });
    };
    GoalService.goalCalculator = function (customerId, mongoGoals, from, to) {
        var goalIds = [], result = [], self = this;
        // get the performance of all indicators inside the goals
        goalIds = mongoGoals.map(function goalIdMap(goal) {
            return goal._id.toString();
        });
        return goal_entity_1.GoalDataService.getGoalPerformance(goalIds, from, to)
            .then(function (cachedPerformance) {
            // we reset the goalids, because we want to ask later for those goals
            // that are not cached
            goalIds = [];
            for (var i = 0; i < mongoGoals.length; i++) {
                var performanceProgress = _.find(cachedPerformance, _.matchesProperty('goalId', mongoGoals[i]._id.toString()));
                if (performanceProgress) {
                    result.push(_.extend(mongoGoals[i], {
                        performance: performanceProgress,
                        indicators: []
                    }));
                }
                else {
                    goalIds.push(mongoGoals[i]._id.toString());
                }
            }
            if (!goalIds.length) {
                return result;
            }
            return self.calculateGoalPerformance(customerId, goalIds, _.filter(mongoGoals, function (value) { return _.includes(goalIds, value._id.toString()); }), from, to)
                .then(function goalApiResult(response) {
                return result.concat(response);
            });
        });
    };
    GoalService.getGoalsPerformance = function (customerId, withIndicators, from, to) {
        var self = this;
        return goal_entity_1.GoalDataService.getByCustomerId(customerId, true)
            .then(function onGetGoals(mongoGoals) {
            return self.goalCalculator(customerId, mongoGoals, from, to);
        });
    };
    GoalService.calculateGoalPerformance = function (customerId, goalIds, mongoGoals, from, to) {
        var indicators, goalIndicatorSpec = [], self = this;
        return Promise.all([
            indicator_service_1.IndicatorService.getIndicatorsPerformance(customerId, goalIds, from, to),
            indicator_service_1.IndicatorService.getGoalIndicators(customerId, goalIds)
        ]).then(function onIndicators(values) {
            indicators = values[0];
            goalIndicatorSpec = values[1];
            var goalsResponse = [];
            // calculate goal performance
            for (var i = 0; i < mongoGoals.length; i++) {
                // take the factors from here
                var indicatorSpecs = _.filter(goalIndicatorSpec, _.matches({ goalId: mongoGoals[i]._id.toString() }));
                // take the indicators with performance from here
                var indicatorsWithPerformance = _.filter(indicators, function filterByGoal(ind) {
                    return _.includes(ind.goalIds, mongoGoals[i]._id.toString());
                });
                var performance = self.calculateGoalPerformanceProgress(mongoGoals[i], indicatorsWithPerformance, indicatorSpecs, from, to);
                goal_entity_1.GoalDataService.insertGoalPerformance(performance);
                goalsResponse.push(_.extend(mongoGoals[i], {
                    performance: performance,
                    indicators: []
                }));
            }
            return goalsResponse;
        });
    };
    GoalService.calculateGoalPerformanceProgress = function (goal, indicators, indicatorFactors, from, to) {
        var howManyMonths = moment.duration(moment(to).diff(moment(from))).asMonths();
        var unitPercentage = 1 / _.sumBy(indicatorFactors, 'factor');
        var indicatorsHelper = [];
        var result = {
            goalId: goal._id.toString(),
            from: from,
            to: to,
            progressPerformance: [],
            // if there is no data the default is "red" and "0%" 
            periodPerformance: {
                semaphoreStatus: shared_1.SemaphoreStatus.red,
                value: 0,
                date: to
            }
        };
        for (var i = 0; i < indicators.length; i++) {
            var goalIndicator = indicatorFactors.find(function (goalInd, index) { return goalInd.indicatorId == indicators[i]._id; });
            indicatorsHelper.push({
                index: i,
                indicator: indicators[i],
                factor: goalIndicator.factor
            });
        }
        for (var j = 0; j < howManyMonths; j++) {
            var endOfMonth = moment(from).add(j, 'months').endOf('month').toDate();
            var progress = this.getAccumulatedMonthPerformance(goal, endOfMonth, unitPercentage, indicatorsHelper);
            result.progressPerformance.push(progress);
        }
        result.periodPerformance = result.progressPerformance[result.progressPerformance.length - 1];
        return result;
    };
    GoalService.getAccumulatedMonthPerformance = function (goal, to, unitPercentage, indicatorsHelper) {
        var result = {
            date: to,
            semaphoreStatus: shared_1.SemaphoreStatus.red,
            value: 0
        };
        for (var k = 0; k < indicatorsHelper.length; k++) {
            var indicatorPerformanceProgress = indicatorsHelper[k].indicator.performance.progressPerformance;
            var indicatorPerformance = _.find(indicatorPerformanceProgress, _.matchesProperty('date', to));
            if (indicatorPerformance) {
                result.value += indicatorsHelper[k].factor * unitPercentage * indicatorPerformance.value;
            }
        }
        if (result.value <= goal.semaphore.yellowUntil) {
            if (result.value <= goal.semaphore.redUntil) {
                result.semaphoreStatus = shared_1.SemaphoreStatus.red;
            }
            else {
                result.semaphoreStatus = shared_1.SemaphoreStatus.yellow;
            }
        }
        if (result.value > 1) {
            result.value = 1;
        }
        if (result.value < 0) {
            result.value = 0;
        }
        if (result.value > goal.semaphore.redUntil) {
            // yellow or green
            if (result.value > goal.semaphore.yellowUntil) {
                result.semaphoreStatus = shared_1.SemaphoreStatus.green;
            }
            else {
                result.semaphoreStatus = shared_1.SemaphoreStatus.yellow;
            }
        }
        else {
            result.semaphoreStatus = shared_1.SemaphoreStatus.red;
        }
        return result;
    };
    return GoalService;
}());
exports.GoalService = GoalService;
//# sourceMappingURL=goal.service.js.map