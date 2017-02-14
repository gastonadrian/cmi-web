"use strict";
var MongoGoalIndicator = (function () {
    function MongoGoalIndicator(indicatorId, customerId, goalId, factor) {
        this.indicatorId = indicatorId;
        this.customerId = customerId;
        this.goalId = goalId;
        this.factor = factor;
    }
    return MongoGoalIndicator;
}());
exports.MongoGoalIndicator = MongoGoalIndicator;
//# sourceMappingURL=goal-indicator.js.map