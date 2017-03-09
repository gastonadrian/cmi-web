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
        goal_entity_1.GoalDataService.removePerformance(goal._id);
        return goal_entity_1.GoalDataService.update(goal);
    };
    GoalService.removeCachedPerformance = function (goalId, from, to) {
        return goal_entity_1.GoalDataService.removePerformance(goalId, from, to);
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
            indicator_service_1.IndicatorService.getComposedIndicatorsByGoalId(customerId, [goalId], from, to)
        ])
            .then(function onGet(values) {
            var mongoGoals = values[0];
            var indicators = values[1];
            var indicatorsWithPerformance = indicator_service_1.IndicatorService.getIndicatorsPerformance(indicators, from, to);
            return self.goalCalculator(customerId, mongoGoals, from, to)
                .then(function onGoal(goals) {
                goals[0].indicators = indicatorsWithPerformance;
                return goals[0];
            });
        });
    };
    GoalService.goalCalculator = function (customerId, mongoGoals, from, to) {
        console.time('5:goalCalculatorCached');
        console.time('5:goalCalculatorNOCached');
        var goalIds = [], result = [], self = this;
        // get the performance of all indicators inside the goals
        goalIds = mongoGoals.map(function goalIdMap(goal) {
            return goal._id;
        });
        return goal_entity_1.GoalDataService.getGoalPerformance(goalIds, from, to)
            .then(function (cachedPerformance) {
            // we reset the goalids, because we want to ask later for those goals
            // that are not cached
            goalIds = [];
            for (var i = 0; i < mongoGoals.length; i++) {
                var performanceProgress = _.find(cachedPerformance, _.matchesProperty('goalId', mongoGoals[i]._id));
                if (performanceProgress) {
                    result.push(_.extend(mongoGoals[i], {
                        performance: performanceProgress,
                        indicators: []
                    }));
                }
                else {
                    goalIds.push(mongoGoals[i]._id);
                }
            }
            if (!goalIds.length) {
                console.timeEnd('5:goalCalculatorCached');
                return result;
            }
            return self.calculateGoalPerformance(customerId, goalIds, _.filter(mongoGoals, function (value) { return _.includes(goalIds, value._id); }), from, to)
                .then(function goalApiResult(response) {
                console.timeEnd('5:goalCalculatorNOCached');
                return result.concat(response);
            });
        });
    };
    GoalService.getGoalsPerformance = function (goals, withIndicators, from, to) {
        console.time('3:getGoalsPerformance');
        if (!goals.length) {
            return new Promise(function (resolve, reject) {
                resolve(goals);
                return goals;
            });
        }
        return this.goalCalculator(goals[0].customerId.toString(), goals, from, to)
            .then(function (response) {
            console.timeEnd('3:getGoalsPerformance');
            return response;
        });
    };
    GoalService.calculateGoalPerformance = function (customerId, goalIds, mongoGoals, from, to) {
        console.time('7:calculateGoalPerformance');
        var indicators, goalIndicatorRelations = [], indicatorsWithPerformance = [], self = this;
        return indicator_service_1.IndicatorService.getComposedIndicatorsByGoalId(customerId, goalIds, from, to)
            .then(function onComposedIndicators(indicators) {
            indicatorsWithPerformance = indicator_service_1.IndicatorService.getIndicatorsPerformance(indicators, from, to);
            goalIndicatorRelations = _.flatMap(indicators, function (i) { return i.goalIndicators; });
            var goalsResponse = [];
            console.log('indicators with performance', ':  ' + indicatorsWithPerformance.map(function (gi) { return gi._id.toString(); }));
            // calculate goal performance
            for (var i = 0; i < mongoGoals.length; i++) {
                // take the factors from here
                var goalIndicatorsSpec = _.filter(goalIndicatorRelations, _.matches({ goalId: mongoGoals[i]._id.toString() }));
                console.log(mongoGoals[i].title, ':  ' + goalIndicatorsSpec.map(function (gi) { return gi.indicatorId.toString(); }));
                // take the indicators with performance from here
                var goalIndicators = _.filter(indicatorsWithPerformance, function filterByGoal(ind) {
                    return !!_.find(ind.goalIds, mongoGoals[i]._id);
                });
                var performance = self.calculateGoalPerformanceProgress(mongoGoals[i], goalIndicators, goalIndicatorsSpec, from, to);
                goal_entity_1.GoalDataService.insertGoalPerformance(performance);
                goalsResponse.push(_.extend(mongoGoals[i], {
                    performance: performance,
                    indicators: []
                }));
            }
            console.timeEnd('7:calculateGoalPerformance');
            return goalsResponse;
        });
    };
    GoalService.calculateGoalPerformanceProgress = function (goal, indicators, indicatorFactors, from, to) {
        var unitPercentage = 1 / _.sumBy(indicatorFactors, 'factor');
        var indicatorsHelper = [];
        var result = {
            goalId: goal._id,
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
        if (!indicators.length) {
            return result;
        }
        for (var i = 0; i < indicators.length; i++) {
            var goalIndicator = indicatorFactors.find(function (goalInd, index) {
                return goalInd.indicatorId.toString() == indicators[i]._id.toString();
            });
            if (!goalIndicator) {
                continue;
            }
            indicatorsHelper.push({
                index: i,
                indicator: indicators[i],
                factor: goalIndicator.factor
            });
        }
        var monthStart = from;
        var monthEnd = moment(from).endOf('month').toDate();
        while (moment(monthEnd).isBefore(to)) {
            var progress = this.getAccumulatedMonthPerformance(goal, monthEnd, unitPercentage, indicatorsHelper);
            result.progressPerformance.push(progress);
            monthStart = moment(monthStart).add(1, 'month').startOf('month').toDate();
            monthEnd = moment(monthStart).endOf('month').toDate();
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
            else if (indicatorPerformanceProgress.length) {
                indicatorPerformance = indicatorPerformanceProgress[indicatorPerformanceProgress.length - 1];
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