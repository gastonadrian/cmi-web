"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var goal_base_1 = require("./../goal.base");
var MongoGoal = (function (_super) {
    __extends(MongoGoal, _super);
    function MongoGoal() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return MongoGoal;
}(goal_base_1.GoalBase));
exports.MongoGoal = MongoGoal;
;
//# sourceMappingURL=goal.mongo.js.map