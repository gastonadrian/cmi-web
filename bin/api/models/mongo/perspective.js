"use strict";
var MongoPerspective = (function () {
    function MongoPerspective(customerId, title, semaphore) {
        this.customerId = customerId;
        this.title = title;
        this.semaphore = semaphore;
    }
    return MongoPerspective;
}());
exports.MongoPerspective = MongoPerspective;
//# sourceMappingURL=perspective.js.map