import * as _ from 'lodash';
import * as moment from 'moment';

import { IndicatorService } from './indicator.service';
import { GoalDataService } from './../data/goal.entity';

import { SemaphoreStatus, Operations, IPerformance } from './../models/shared';

import { MongoGoal } from './../models/mongo/goal.mongo';
import { MongoIndicator } from './../models/mongo/indicator.mongo';
import { MongoIndicatorData } from './../models/mongo/indicator-data';
import { MongoGoalIndicator } from './../models/mongo/goal-indicator.mongo';


import { IndicatorApiResult } from './../models/api/indicator';
import { GoalApiResult } from './../models/api/goal';
import { GoalIndicatorApiResult } from './../models/api/goal-indicator';

export class GoalService {
    
    constructor(){
    }
    static get(customerId:string, goalId:string):Promise<any>{

        return Promise.all([
            GoalDataService.get(goalId),
            IndicatorService.getIndicatorsByGoalId(customerId, [goalId])
        ]).then(function onGetAll(values:Array<any>){
            let goal:MongoGoal = values[0];
            
            if(!goal){
                return { ok: false };
            }

            return _.extend(goal, {
                indicators: values[1] as Array<IndicatorApiResult>
            }) as GoalApiResult; 
        });
    }

    static getByCustomerId(customerId:string):Promise<Array<GoalApiResult>>{
        return GoalDataService.getByCustomerId(customerId);
    }

    static save(customerId:string, goal:GoalApiResult):Promise<any>{
        goal.customerId = customerId;
        goal.active = false;

        if(!goal.title.length || !goal.perspectiveId) {
            return new Promise(function(resolve, reject){
                return reject('Faltan datos');
            });
        }

        // a goal is active if at least has one active indicator
        if(goal.indicators  && goal.indicators.length){
            goal.active = !!_.filter(goal.indicators, _.matchesProperty('active', true)).length;
        }

        return GoalDataService.insertGoal(goal);
    }
    
    static update(customerId:string, goal:GoalApiResult):Promise<any>{
        if(!goal.title.length || !goal.perspectiveId) {
            return new Promise(function(resolve, reject){
                return reject('Faltan datos');
            });
        }

        // a goal is active if at least has one active indicator
        if(goal.indicators  && goal.indicators.length){
            goal.active = !!_.filter(goal.indicators, _.matchesProperty('active', true)).length;
        }

        return GoalDataService.update(goal);
    }

    static delete(customerId:string, goalId:string):Promise<any>{
        return Promise.all([
            GoalDataService.deleteGoal(customerId,goalId),
            IndicatorService.getIndicatorsByGoalId(customerId, [goalId])
        ]).then(function onAll(values:Array<any>){
            let removeGoalResult:any = values[0];
            let indicators:Array<MongoIndicator> = values[1];
            let promiseArray:Array<Promise<any>> = [];

            for(var i=0; i < indicators.length; i++){
                _.remove(indicators[i].goalIds, (value:string) => { value === goalId });
                promiseArray.push(IndicatorService.update(indicators[i]));
            }

            return Promise.all(promiseArray)
                .then(function onAllUpdates(updates){
                    
                    for(var j=0; j< updates.length; j++){
                        removeGoalResult.ok = removeGoalResult.ok &&  updates[j].ok;
                    }

                    return removeGoalResult;
                });
        });
    }

    static getGoalsPerformance(customerId:string, withIndicators:Boolean, from:Date, to:Date):Promise<Array<GoalApiResult>>{
        let self = this;

        return GoalDataService.getByCustomerId(customerId, true)
        .then(function onGetGoals(mongoGoals:Array<MongoGoal>){
            let indicators:Array<IndicatorApiResult>,
                goalIds:Array<string> = [],
                goalIndicatorSpec:Array<MongoGoalIndicator> = [],
                result:Array<GoalApiResult> = [];

            // get the performance of all indicators inside the goals
            goalIds = mongoGoals.map(function goalIdMap(goal:MongoGoal){
                return goal._id.toString();
            });

            return Promise.all([
                IndicatorService.getIndicatorsPerformance(customerId, goalIds, from, to),
                IndicatorService.getGoalIndicators(customerId, goalIds)
            ]).then(function onIndicators(values:any){
                indicators = values[0] as Array<IndicatorApiResult>;
                goalIndicatorSpec = values[1] as Array<MongoGoalIndicator>;
                // calculate goal performance
                for(var i = 0; i< mongoGoals.length; i++){
                    // take the factors from here
                    var indicatorSpecs = _.filter(goalIndicatorSpec, _.matches({ goalId: mongoGoals[i]._id.toString() }));
        
                    // take the indicators with performance from here
                    var indicatorsWithPerformance = _.filter(indicators, function filterByGoal(ind){
                        return _.includes(ind.goalIds, mongoGoals[i]._id.toString())
                    });
        
                    let performance:IPerformance = self.calculateGoalPerformance(mongoGoals[i], indicatorsWithPerformance, indicatorSpecs);                    
                    result.push(                    
                        _.extend(mongoGoals[i], { 
                            id: mongoGoals[i]._id.toString(),
                            performance: performance,
                            indicators: []
                        }) as GoalApiResult
                    );
                }
                return result;
            });
        });
    }

    private static calculateGoalPerformance(goal:MongoGoal, indicators:Array<IndicatorApiResult>, indicatorFactors:Array<MongoGoalIndicator>):IPerformance{
        let unitPercentage:number = 1 / _.sumBy(indicatorFactors, 'factor');
        let result:IPerformance = {
            semaphoreStatus: SemaphoreStatus.green,
            value: 0
        };
        for(var i=0; i < indicators.length; i++){
            var goalIndicator = indicatorFactors.find( (goalInd: MongoGoalIndicator, index: number) =>{ return goalInd.indicatorId == indicators[i]._id }  );
            result.value += goalIndicator.factor * unitPercentage * indicators[i].performance.value;
        }

        result.value = result.value;
        
        if(result.value <= goal.semaphore.yellowUntil){
            if(result.value <= goal.semaphore.redUntil){
                result.semaphoreStatus = SemaphoreStatus.red;
            }
            else{
                result.semaphoreStatus = SemaphoreStatus.yellow;
            }
        }

        return result;
    }
}