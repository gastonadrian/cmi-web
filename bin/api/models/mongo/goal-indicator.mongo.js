"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var goal_indicator_base_1 = require("./../goal-indicator.base");
var MongoGoalIndicator = (function (_super) {
    __extends(MongoGoalIndicator, _super);
    function MongoGoalIndicator() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return MongoGoalIndicator;
}(goal_indicator_base_1.GoalIndicatorBase));
exports.MongoGoalIndicator = MongoGoalIndicator;
//# sourceMappingURL=goal-indicator.mongo.js.map