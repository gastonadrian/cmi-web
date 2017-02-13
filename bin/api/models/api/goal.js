"use strict";
var GoalApiResult = (function () {
    function GoalApiResult(_id, customerId, title, perspectiveId, performance) {
        this._id = _id;
        this.customerId = customerId;
        this.title = title;
        this.perspectiveId = perspectiveId;
        this.performance = performance;
    }
    return GoalApiResult;
}());
exports.GoalApiResult = GoalApiResult;
;
//# sourceMappingURL=goal.js.map