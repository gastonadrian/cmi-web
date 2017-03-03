module.exports = function indicatorApi(){
    let indicatorService = require('./services/indicator.service').IndicatorService;

     this.add('role:indicators,cmd:save', saveIndicator);
     this.add('role:indicators,cmd:saveimport', saveIndicatorData);
     this.add('role:indicators,cmd:savedatasource', saveIndicatorDataSource);
     this.add('role:indicators,cmd:get', getIndicator);
     this.add('role:indicators,cmd:getall', getAll);
     this.add('role:indicators,cmd:getallsync', getAllSync);
    this.add('role:indicators,cmd:getallindicatordata', getAllIndicatorData);
    this.add('role:indicators,cmd:updateindicatordata', updateIndicatorData);

     this.add('role:indicators,cmd:assigngoal', assignGoal);
     this.add('role:indicators,cmd:removegoal', removeGoal);
     this.add('role:indicators,cmd:setquarter', setQuarterExpectation);

    function saveIndicator(msg, respond){
        indicatorService.saveIndicator(msg.args.params.customerId, msg.args.body)
            .then(function onIndicatorCreated(result){
                respond(null, result);
            });
    }

    function getIndicator(msg, respond){
        indicatorService.get(msg.args.params.customerId, msg.args.params.indicatorId)
            .then(function onGet(result){
                respond(null, result);
            });
    }

    function getAll(msg, respond){
        indicatorService.getAll(msg.args.params.customerId, msg.args.params.active)
            .then(function onGet(result){
                respond(null, result);
            });
    }

    function getAllSync(msg, respond){
        indicatorService.getAllSync(msg.args.params.customerId)
            .then(function onGetSync(result){
                respond(null, result);
            });
    }

    function assignGoal(msg, respond){
        indicatorService.assignGoal(msg.args.params.customerId, msg.args.body)
            .then(function onAssign(result){
                respond(null, result);
            });
    }

    function removeGoal(msg, respond){
        indicatorService.removeGoal(msg.args.params.customerId, msg.args.body.goalId, msg.args.body.indicatorId)
            .then(function onRemove(result){
                respond(null, result);
            });
    }

   function saveIndicatorData(msg, respond){
        indicatorService.createIndicatorData(msg.args.params.customerId, msg.args.body.data)
            .then(function onIndicatorDataCreated(result){
                respond(null, result);
            });
    }

    function setQuarterExpectation(msg, respond){
        indicatorService.setQuarterExpectation(msg.args.params.customerId, msg.args.params.indicatorId, msg.args.body)
            .then(function onQuarterSet(result){
                respond(null, result);
            });        
    }

    function updateIndicatorData(msg, respond){
        indicatorService.updateIndicatorData(msg.args.params.customerId, msg.args.params.indicatorId, msg.args.body)
            .then(function onUpdateIndicatorData(result){
                respond(null, result);
            });        
    }    

    function getAllIndicatorData(msg, respond){
        indicatorService.getAllIndicatorData(msg.args.params.customerId, msg.args.params.indicatorId)
            .then(function onQuarterSet(result){
                respond(null, result);
            });        
    }


   function saveIndicatorDataSource(msg, respond){
        indicatorService.saveIndicatorDataSource(msg.args.params.customerId, msg.args.body)
            .then(function onIndicatorDataSourceUpdated(result){
                respond(null, result);
            });
    }

}