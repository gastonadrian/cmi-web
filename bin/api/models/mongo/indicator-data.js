"use strict";
var MongoIndicatorData = (function () {
    function MongoIndicatorData(indicatorId, customerId, value, date, expected) {
        this.indicatorId = indicatorId;
        this.customerId = customerId;
        this.value = value;
        this.date = date;
        this.expected = expected;
    }
    return MongoIndicatorData;
}());
exports.MongoIndicatorData = MongoIndicatorData;
//# sourceMappingURL=indicator-data.js.map