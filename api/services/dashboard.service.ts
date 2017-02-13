import * as utils from './../utils';
import * as _ from 'lodash';
import * as GoalService from './goal.service';

export class DashboardService{
    
    constructor(private goalsService:GoalService.GoalService){
        this.goalsService = new GoalService.GoalService();
    }

    public getDashboard(from:Date, to:Date){
        let period:any = utils.getPeriodFromParams( from, to );
        // desired result
        let result = {
            filterDateFrom: period.from,
            filterDateTo: period.to,
            data: this.getPerspectives(true, period.from, period.to)
        };
        let goals:any = this.goalsService.getGoalsPerformance('22', false, from, to);
        
        for (var index = 0; index < result.data.length; index++) {
           result.data[index].goals = _.filter(goals, _.matchesProperty('perspectiveId', result.data[index].id));
        }
        return result;
    }

    public getPerspectives(withPerformance, from, to){
        return [
                {
                    id: 1,
                    title: 'Perspectiva Financiera',
                    performance:{
                        semaphoreStatus: 1,
                        value: 0.80                    
                    },
                    goals:[]
                },
                {
                    id: 2,
                    title: 'Perspectiva Clientes',
                    performance:{
                        semaphoreStatus: 2,
                        value: 0.45                    
                    },
                    goals:[]
                },
                {
                    id: 3,
                    title: 'Perspectiva de Aprendizaje',
                    performance:{
                        semaphoreStatus: 2,
                        value: 0.65                    
                    },
                    goals:[]
                },
                {
                    id: 4,
                    title: 'Perspectiva de Procesos',
                    performance:{
                        semaphoreStatus: 2,
                        value: 0.58                    
                    },
                    goals:[]
                }                
            ];
    }
}
