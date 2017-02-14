import * as utils from './../utils';
import * as _ from 'lodash';
import { GoalService } from './goal.service';
import { PerspectiveDataService } from './../data/perspective.entity';
import { IPerformance, SemaphoreStatus } from './../models/shared';
import { MongoPerspective } from './../models/mongo/perspective';
import { GoalApiResult } from './../models/api/goal';
import { PerspectiveApiResult } from './../models/api/perspective';

export class PerspectiveService{
    
    constructor(){
    }

    static getDashboard(customerId:string, from:Date, to:Date):Promise<any>{
        let period:any = utils.getPeriodFromParams( from, to );

        // desired result
        return this.getPerspectives(customerId, true, period.from, period.to)
            .then(function(perspectives){
                return {
                    filterDateFrom: period.from,
                    filterDateTo: period.to,
                    data: perspectives
                };
            });
    }

    private static getPerspectives(customerId:string, withPerformance:Boolean, from: Date, to:Date):Promise<Array<PerspectiveApiResult>>{
        let self = this;

        return Promise.all([
            GoalService.getGoalsPerformance(customerId, false, from, to),
            PerspectiveDataService.getPerspectives(customerId)
        ]).then(function onBothPromisesResult(values:any){
            let goals:Array<GoalApiResult> = values[0] as Array<GoalApiResult>;
            let perspectives:Array<MongoPerspective> = values[1] as Array<MongoPerspective>;
    
            let result:Array<PerspectiveApiResult> = [];
            
            for (var index = 0; index < perspectives.length; index++) {
                let perspectiveGoals = _.filter(goals, _.matchesProperty('perspectiveId', perspectives[index]._id.toString()));
    
                result.push(new PerspectiveApiResult(
                    perspectives[index]._id.toString(),
                    perspectives[index].customerId,
                    perspectives[index].title,
                    perspectiveGoals,
                    self.calculatePerspectivePerformance(perspectives[index], perspectiveGoals)
                ));
            }
            return result;

        });
    }

    private static calculatePerspectivePerformance(perspective:MongoPerspective, goals:Array<GoalApiResult>):IPerformance{
        let result:IPerformance = {
            value: 1,
            semaphoreStatus: SemaphoreStatus.red
        };
    
        // making sure that we consider cases where perspectives has no goals
        result.value = _.sumBy(goals, 'performance.value')/goals.length || 0;

        if(result.value <= perspective.semaphore.yellowUntil){
            if(result.value <= perspective.semaphore.redUntil){
                result.semaphoreStatus = SemaphoreStatus.red;
            }
            else{
                result.semaphoreStatus = SemaphoreStatus.yellow;
            }
        }
        else{
            result.semaphoreStatus = SemaphoreStatus.green;
        }

        return result;
    }
}
