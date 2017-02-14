"use strict";
var utils = require("./../utils");
var _ = require("lodash");
var goal_service_1 = require("./goal.service");
var perspective_entity_1 = require("./../data/perspective.entity");
var shared_1 = require("./../models/shared");
var perspective_1 = require("./../models/api/perspective");
var PerspectiveService = (function () {
    function PerspectiveService() {
    }
    PerspectiveService.getDashboard = function (customerId, from, to) {
        var period = utils.getPeriodFromParams(from, to);
        // desired result
        return this.getPerspectives(customerId, true, period.from, period.to)
            .then(function (perspectives) {
            return {
                filterDateFrom: period.from,
                filterDateTo: period.to,
                data: perspectives
            };
        });
    };
    PerspectiveService.getPerspectives = function (customerId, withPerformance, from, to) {
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
                result.push(new perspective_1.PerspectiveApiResult(perspectives[index]._id.toString(), perspectives[index].customerId, perspectives[index].title, perspectiveGoals, self.calculatePerspectivePerformance(perspectives[index], perspectiveGoals)));
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