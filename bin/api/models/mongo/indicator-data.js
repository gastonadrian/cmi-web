"use strict";
var MongoIndicatorData = (function () {
    function MongoIndicatorData(indicatorId, customerId, date, value, expected) {
        this.indicatorId = indicatorId;
        this.customerId = customerId;
        this.date = date;
        this.value = value;
        this.expected = expected;
    }
    return MongoIndicatorData;
}());
exports.MongoIndicatorData = MongoIndicatorData;
//# sourceMappingURL=indicator-data.js.map