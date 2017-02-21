"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var indicator_base_1 = require("./../indicator.base");
var MongoIndicator = (function (_super) {
    __extends(MongoIndicator, _super);
    function MongoIndicator() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return MongoIndicator;
}(indicator_base_1.BaseIndicator));
exports.MongoIndicator = MongoIndicator;
//# sourceMappingURL=indicator.mongo.js.map