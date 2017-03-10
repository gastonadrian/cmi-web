"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var indicator_data_base_1 = require("./../indicator-data.base");
var MongoIndicatorData = (function (_super) {
    __extends(MongoIndicatorData, _super);
    function MongoIndicatorData() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return MongoIndicatorData;
}(indicator_data_base_1.IndicatorDataBase));
exports.MongoIndicatorData = MongoIndicatorData;
//# sourceMappingURL=indicator-data.js.map