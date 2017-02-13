"use strict";
var MongoGoal = (function () {
    function MongoGoal(_id, customerId, title, perspectiveId, semaphoreRedUntil, semaphoreYellowuntil) {
        this._id = _id;
        this.customerId = customerId;
        this.title = title;
        this.perspectiveId = perspectiveId;
        this.semaphoreRedUntil = semaphoreRedUntil;
        this.semaphoreYellowuntil = semaphoreYellowuntil;
        this.semaphore = {
            redUntil: semaphoreRedUntil,
            yellowUntil: semaphoreYellowuntil
        };
    }
    return MongoGoal;
}());
exports.MongoGoal = MongoGoal;
;
//# sourceMappingURL=goal.js.map