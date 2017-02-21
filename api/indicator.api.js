module.exports = function indicatorApi(){
    let indicatorService = require('./services/indicator.service').IndicatorService;

     this.add('role:indicators,cmd:save', saveIndicator);
     this.add('role:indicators,cmd:saveimport', saveIndicatorData);

    function saveIndicator(msg, respond){
        indicatorService.createIndicator(msg.args.params.customerId, msg.args.body)
            .then(function onIndicatorCreated(result){
                respond(null, result);
            });
    }

   function saveIndicatorData(msg, respond){
        indicatorService.createIndicatorData(msg.args.params.customerId, msg.args.body)
            .then(function onIndicatorDataCreated(result){
                respond(null, result);
            });
    }    
}