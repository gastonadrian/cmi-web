"use strict";
var IndicatorApiResult = (function () {
    function IndicatorApiResult(_id, customerId, goalIds, title, performance) {
        this._id = _id;
        this.customerId = customerId;
        this.goalIds = goalIds;
        this.title = title;
        this.performance = performance;
    }
    return IndicatorApiResult;
}());
exports.IndicatorApiResult = IndicatorApiResult;
;
//# sourceMappingURL=indicator.js.map