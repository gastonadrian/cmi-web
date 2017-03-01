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
        console.log('entering perspective service');
        var period = utils.getPeriodFromParams(from, to);
        // desired result
        return this.getPerspectivesWithPerformance(customerId, true, period.from, period.to)
            .then(function (perspectives) {
            return {
                filterDateFrom: period.from,
                filterDateTo: period.to,
                data: perspectives
            };
        });
    };
    PerspectiveService.getAll = function (customerId, withGoals) {


        console.warn(_.matchesProperty, 'matches');

        return Promise.all([
            perspective_entity_1.PerspectiveDataService.getPerspectives(customerId),
            goal_service_1.GoalService.getByCustomerId(customerId)
        ]).then(function onBothPromisesResult(values) {
            console.warn('perspectives', values[0])
            var perspectives = values[0];
            var goals = values[1];
            var result = [];
            for (var i = 0; i < perspectives.length; i++) {
                var perspectiveGoals = _.filter(goals, _.matchesProperty('perspectiveId', perspectives[i]._id.toString()));
                result.push(_.extend(perspectives[i], {
                    goals: perspectiveGoals
                }));
            }
            return result;
        });
    };
    PerspectiveService.save = function (customerId, perspectives) {
        var perspectiveArray = [];
        for (var i = 0; i < perspectives.length; i++) {
            perspectiveArray.push(perspective_entity_1.PerspectiveDataService.update(perspectives[i]));
        }
        return Promise.all(perspectiveArray);
    };
    PerspectiveService.getPerspectivesWithPerformance = function (customerId, withPerformance, from, to) {
        var self = this;
        return Promise.all([
            goal_service_1.GoalService.getGoalsPerformance(customerId, false, from, to),
            perspective_entity_1.PerspectiveDataService.getPerspectives(customerId)
        ]).then(function onBothPromisesResult(values) {
            var goals = values[0];
            var perspectives = values[1];
            var result = [];
            for (var index = 0; index < perspectives.length; index++) {
                var perspectiveGoals = _.filter(goals, _.matchesProperty('perspectiveId', perspectives[index]._id.toString()));
                result.push(_.extend(perspectives[index], {
                    goals: perspectiveGoals,
                    performance: self.calculatePerspectivePerformance(perspectives[index], perspectiveGoals)
                }));
            }
            return result;
        });
    };
    PerspectiveService.calculatePerspectivePerformance = function (perspective, goals) {
        var result = {
            value: 1,
            semaphoreStatus: shared_1.SemaphoreStatus.red
        };
        // making sure that we consider cases where perspectives has no goals
        result.value = _.sumBy(goals, 'performance.value') / goals.length || 0;
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