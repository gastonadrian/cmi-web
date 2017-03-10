module.exports = function customerApi(){
    let customerService = require('./services/customer.service').CustomerService;
    let _ = require('lodash');

    this.add('role:customers,cmd:save', save);
    this.add('role:customers,cmd:getall', getAll);

    function save(msg, respond){
        var pin = {
            role: 'user',
            cmd: 'register'
        };

        _.extend(pin, msg.args.body);

        this.act(pin, function onRegistered(error, response){
            if(response.ok){
                customerService.create(response.user.id);
                respond(null, {});
            } else {
                respond(null, response);
            }
        });
    }

    function getAll(msg, respond){
        customerService.getAll(msg.args.params.customerId)
        .then(function onGet(result){
            respond(null, result);
        });
    }

    // function getAll(msg, respond){
    //     customerService.getAll(msg.args.params.customerId)
    //         .then(function onGet(result){
    //             respond(null, result);
    //         });
    // }
}