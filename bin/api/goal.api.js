module.exports = function goalApi() {
    var goalService = require('./services/goal.service').GoalService;
    this.add('role:goals,cmd:get', get);
    this.add('role:goals,cmd:save', save);
    this.add('role:goals,cmd:update', update);
    this.add('role:goals,cmd:delete', remove);
    function get(msg, respond) {
        goalService.get(msg.args.params.customerId, msg.args.params.goalId)
            .then(function onGet(response) {
            respond(null, response);
        });
    }
    function save(msg, respond) {
        goalService.save(msg.args.params.customerId, msg.args.body)
            .then(function onSave(result) {
            respond(null, result);
        });
    }
    function update(msg, respond) {
        goalService.update(msg.args.params.customerId, msg.args.body)
            .then(function onUpdate(response) {
            respond(null, response.result);
        });
    }
    function remove(msg, respond) {
        goalService.delete(msg.args.params.customerId, msg.args.params.goalId)
            .then(function onDelete(result) {
            respond(null, result);
        });
    }
};
//# sourceMappingURL=goal.api.js.map