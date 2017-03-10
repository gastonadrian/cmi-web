"use strict";
var utils = require("./../utils");
var _ = require("lodash");
var goal_service_1 = require("./goal.service");
var perspective_entity_1 = require("./../data/perspective.entity");
var shared_1 = require("./../models/shared");
var PerspectiveService = (function () {
    function PerspectiveService() {
    }
    PerspectiveService.getDashboard = function (customerId, from, to) {
        console.time('1:dashboard');
        var period = utils.getPeriodFromParams(from, to);
        // desired result
        return this.getPerspectivesWithPerformance(customerId, true, period.from, period.to)
            .then(function (perspectives) {
            console.timeEnd('1:dashboard');
            return {
                filterDateFrom: period.from,
                filterDateTo: period.to,
                data: perspectives
            };
        });
    };
    PerspectiveService.getAll = function (customerId, withGoals) {
        return perspective_entity_1.PerspectiveDataService.getPerspectives(customerId)
            .then(function (perspectives) {
            return perspectives;
        });
    };
    PerspectiveService.save = function (customerId, perspectives) {
        var perspectiveArray = [];
        for (var i = 0; i < perspectives.length; i++) {
            if (perspectives[i].semaphore) {
                if (perspectives[i].semaphore.redUntil > 1) {
                    perspectives[i].semaphore.redUntil = (perspectives[i].semaphore.redUntil / 100) || 0;
                }
                if (perspectives[i].semaphore.yellowUntil > 1) {
                    perspectives[i].semaphore.yellowUntil = (perspectives[i].semaphore.yellowUntil / 100) || 0;
                }
            }
            perspectiveArray.push(perspective_entity_1.PerspectiveDataService.update(perspectives[i]));
        }
        return Promise.all(perspectiveArray);
    };
    PerspectiveService.getPerspectivesWithPerformance = function (customerId, withPerformance, from, to) {
        console.time('2:getPerspectivesWithPerformance');
        var self = this;
        return perspective_entity_1.PerspectiveDataService.getPerspectives(customerId)
            .then(function (perspectives) {
            var goals = _.flatMap(perspectives, function (p) { return p.goals; });
            return goal_service_1.GoalService.getGoalsPerformance(goals, false, from, to)
                .then(function onGetPerformance(goalsWithPerformance) {
                var result = [];
                var _loop_1 = function () {
                    var perspectiveGoalIds = _.map(perspectives[index].goals, function (g) { return g._id; });
                    var perspectiveGoals = _.filter(goalsWithPerformance, function (g) { return _.includes(perspectiveGoalIds, g._id); });
                    result.push(_.extend(perspectives[index], {
                        goals: perspectiveGoals,
                        performance: self.calculatePerspectivePerformance(perspectives[index], perspectiveGoals, to)
                    }));
                };
                for (var index = 0; index < perspectives.length; index++) {
                    _loop_1();
                }
                console.timeEnd('2:getPerspectivesWithPerformance');
                return result;
            });
        });
    };
    PerspectiveService.calculatePerspectivePerformance = function (perspective, goals, to) {
        var result = {
            value: 1,
            semaphoreStatus: shared_1.SemaphoreStatus.red,
            date: to
        };
        // making sure that we consider cases where perspectives has no goals
        result.value = _.sumBy(goals, 'performance.periodPerformance.value') / goals.length || 0;
        if (result.value > 1) {
            result.value = 1;
        }
        if (result.value <= perspective.semaphore.yellowUntil) {
            if (result.value <= perspective.semaphore.redUntil) {
                result.semaphoreStatus = shared_1.SemaphoreStatus.red;
            }
            else {
                result.semaphoreStatus = shared_1.SemaphoreStatus.yellow;
            }
        }
        else {
            result.semaphoreStatus = shared_1.SemaphoreStatus.green;
        }
        return result;
    };
    return PerspectiveService;
}());
exports.PerspectiveService = PerspectiveService;
//# sourceMappingURL=perspective.service.js.map