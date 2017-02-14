"use strict";
var MongoGoal = (function () {
    function MongoGoal(customerId, title, perspectiveId, semaphoreRedUntil, semaphoreYellowuntil, active) {
        this.customerId = customerId;
        this.title = title;
        this.perspectiveId = perspectiveId;
        this.semaphoreRedUntil = semaphoreRedUntil;
        this.semaphoreYellowuntil = semaphoreYellowuntil;
        this.active = active;
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