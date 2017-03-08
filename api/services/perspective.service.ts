import * as utils from './../utils';
import * as _ from 'lodash';
import { GoalService } from './goal.service';
import { PerspectiveDataService } from './../data/perspective.entity';
import { IPerformance, SemaphoreStatus } from './../models/shared';
import { MongoPerspective } from './../models/mongo/perspective.mongo';
import { MongoGoal } from './../models/mongo/goal.mongo';

import { GoalApiResult } from './../models/api/goal';
import { PerspectiveApiResult } from './../models/api/perspective';

export class PerspectiveService{
    
    constructor(){
    }

    static getDashboard(customerId:string, from:Date, to:Date):Promise<any>{
        let period:any = utils.getPeriodFromParams( from, to );

        // desired result
        return this.getPerspectivesWithPerformance(customerId, true, period.from, period.to)
            .then(function(perspectives){
                return {
                    filterDateFrom: period.from,
                    filterDateTo: period.to,
                    data: perspectives
                };
            });
    }
    
    static getAll(customerId:string, withGoals:Boolean):Promise<Array<PerspectiveApiResult>>{
        return Promise.all([
            PerspectiveDataService.getPerspectives(customerId),
            GoalService.getByCustomerId(customerId)
        ]).then(function onBothPromisesResult(values:any){
            let perspectives:Array<MongoPerspective> = values[0] as Array<MongoPerspective>;
            let goals:Array<MongoGoal> = values[1] as Array<MongoGoal>;
            let result:Array<PerspectiveApiResult> = [];

            for(var i=0; i< perspectives.length; i++){
                let perspectiveGoals:Array<MongoGoal> = _.filter(goals, _.matchesProperty('perspectiveId', perspectives[i]._id.toString()));
                result.push(_.extend(perspectives[i],{
                     goals: perspectiveGoals as Array<GoalApiResult>
                }) as PerspectiveApiResult);
            }

            return result;
        });
    }

    static save(customerId:string, perspectives:Array<PerspectiveApiResult>):Promise<any[]>{
        var perspectiveArray:Array<Promise<any>> = [];
        for(var i=0; i < perspectives.length; i++){
            if(perspectives[i].semaphore){
                if(perspectives[i].semaphore.redUntil > 1){
                    perspectives[i].semaphore.redUntil = (perspectives[i].semaphore.redUntil /100) || 0;
                }
    
                if(perspectives[i].semaphore.yellowUntil > 1){
                    perspectives[i].semaphore.yellowUntil = (perspectives[i].semaphore.yellowUntil / 100) || 0;
                }
            }
            perspectiveArray.push(PerspectiveDataService.update(perspectives[i]));
        }
        
        return Promise.all(perspectiveArray);
    }

    private static getPerspectivesWithPerformance(customerId:string, withPerformance:Boolean, from: Date, to:Date):Promise<Array<PerspectiveApiResult>>{
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
                
                result.push(_.extend(perspectives[index], {
                    goals: perspectiveGoals,
                    performance: self.calculatePerspectivePerformance(perspectives[index], perspectiveGoals, to)
                }) as PerspectiveApiResult);
            }
            return result;

        });
    }

    private static calculatePerspectivePerformance(perspective:MongoPerspective, goals:Array<GoalApiResult>, to:Date):IPerformance{
        let result:IPerformance = {
            value: 1,
            semaphoreStatus: SemaphoreStatus.red,
            date: to
        };
    
        // making sure that we consider cases where perspectives has no goals
        result.value = _.sumBy(goals, 'performance.periodPerformance.value')/goals.length || 0;

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
