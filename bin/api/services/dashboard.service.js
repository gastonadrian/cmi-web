"use strict";
var utils = require("./../utils");
var _ = require("lodash");
var GoalService = require("./goal.service");
var DashboardService = (function () {
    function DashboardService(goalsService) {
        this.goalsService = goalsService;
        this.goalsService = new GoalService.GoalService();
    }
    DashboardService.prototype.getDashboard = function (from, to) {
        var period = utils.getPeriodFromParams(from, to);
        // desired result
        var result = {
            filterDateFrom: period.from,
            filterDateTo: period.to,
            data: this.getPerspectives(true, period.from, period.to)
        };
        var goals = this.goalsService.getGoalsPerformance('22', false, from, to);
        for (var index = 0; index < result.data.length; index++) {
            result.data[index].goals = _.filter(goals, _.matchesProperty('perspectiveId', result.data[index].id));
        }
        return result;
    };
    DashboardService.prototype.getPerspectives = function (withPerformance, from, to) {
        return [
            {
                id: 1,
                title: 'Perspectiva Financiera',
                performance: {
                    semaphoreStatus: 1,
                    value: 0.80
                },
                goals: []
            },
            {
                id: 2,
                title: 'Perspectiva Clientes',
                performance: {
                    semaphoreStatus: 2,
                    value: 0.45
                },
                goals: []
            },
            {
                id: 3,
                title: 'Perspectiva de Aprendizaje',
                performance: {
                    semaphoreStatus: 2,
                    value: 0.65
                },
                goals: []
            },
            {
                id: 4,
                title: 'Perspectiva de Procesos',
                performance: {
                    semaphoreStatus: 2,
                    value: 0.58
                },
                goals: []
            }
        ];
    };
    return DashboardService;
}());
exports.DashboardService = DashboardService;
//# sourceMappingURL=dashboard.service.js.map