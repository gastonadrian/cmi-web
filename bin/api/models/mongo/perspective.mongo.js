"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var perspective_base_1 = require("./../perspective.base");
var MongoPerspective = (function (_super) {
    __extends(MongoPerspective, _super);
    function MongoPerspective() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return MongoPerspective;
}(perspective_base_1.PerspectiveBase));
exports.MongoPerspective = MongoPerspective;
//# sourceMappingURL=perspective.mongo.js.map