"use strict";
var GoalBase = (function () {
    function GoalBase() {
        this.semaphore = {
            redUntil: 0,
            yellowUntil: 0
        };
    }
    return GoalBase;
}());
exports.GoalBase = GoalBase;
;
//# sourceMappingURL=goal.base.js.map