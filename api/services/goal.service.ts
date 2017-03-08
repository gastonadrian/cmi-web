import * as utils from './../utils';
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

import { GoalPerformanceBase } from './../models/goal-performance.base';
import { IndicatorPerformanceBase  } from './../models/indicator-performance.base';

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

    static getByIds(customerId:string, goalIds:string[], active?:Boolean):Promise<any>{
        return GoalDataService.getByIds(customerId, goalIds, active);
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


        if(goal.semaphore){
            if(goal.semaphore.redUntil > 1){
                goal.semaphore.redUntil = (goal.semaphore.redUntil /100) || 0;
            }

            if(goal.semaphore.yellowUntil > 1){
                goal.semaphore.yellowUntil = (goal.semaphore.yellowUntil / 100) || 0;
            }
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

        if(goal.semaphore){
            if(goal.semaphore.redUntil > 1){
                goal.semaphore.redUntil = (goal.semaphore.redUntil /100) || 0;
            }

            if(goal.semaphore.yellowUntil > 1){
                goal.semaphore.yellowUntil = (goal.semaphore.yellowUntil / 100) || 0;
            }
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
                promiseArray.push(IndicatorService.update(customerId, indicators[i]));
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

    static getSingleGoalPerformance(customerId:string, goalId:string, from:Date, to:Date):Promise<GoalApiResult>{
        let period:any = utils.getPeriodFromParams( from, to );
        from = period.from;
        to = period.to;

        let self = this;

        return Promise.all([
            GoalDataService.getByIds(customerId, [goalId]),
            IndicatorService.getIndicatorsPerformance(customerId,[goalId], from, to)
        ])
        .then(function onGet(values:Array<any>){
           let mongoGoals:Array<GoalApiResult> = values[0];
           let indicators:Array<IndicatorApiResult> = values[1];
           return self.goalCalculator(customerId, mongoGoals, from, to)
               .then(function onGoal(goals:GoalApiResult[]){
                    goals[0].indicators = indicators;
                    return goals[0];
               });
        })
    }

    private static goalCalculator(customerId:string, mongoGoals:Array<GoalApiResult>, from:Date, to:Date):Promise<GoalApiResult[]>{
        let goalIds:Array<string> = [],
            result:Array<GoalApiResult> = [],
            self = this;

        // get the performance of all indicators inside the goals
        goalIds = mongoGoals.map(function goalIdMap(goal:GoalApiResult){
            return goal._id.toString();
        });

        return GoalDataService.getGoalPerformance(goalIds, from, to)
        .then(function(cachedPerformance:Array<GoalPerformanceBase>){
            
            // we reset the goalids, because we want to ask later for those goals
            // that are not cached
            goalIds = [];

            for(var i = 0; i< mongoGoals.length; i++){
                let performanceProgress:GoalPerformanceBase = _.find(cachedPerformance, _.matchesProperty('goalId', mongoGoals[i]._id.toString()));
                
                if(performanceProgress){
                    result.push(                     
                        _.extend(mongoGoals[i], { 
                            performance: performanceProgress,
                            indicators: []
                        }) as GoalApiResult
                    );   
                }
                else{
                    goalIds.push(mongoGoals[i]._id.toString());
                }
            }

            if(!goalIds.length){
                return result;
            }

            return self.calculateGoalPerformance(customerId, goalIds, _.filter(mongoGoals, ( value:MongoGoal ) => {  return _.includes(goalIds, value._id.toString());  } ), from, to)
            .then(function goalApiResult(response:Array<GoalApiResult>){
                return result.concat(response);
            });
        });       
    }

    static getGoalsPerformance(customerId:string, withIndicators:Boolean, from:Date, to:Date):Promise<Array<GoalApiResult>>{
        let self = this;

        return GoalDataService.getByCustomerId(customerId, true)
        .then(function onGetGoals(mongoGoals:Array<GoalApiResult>){
            return self.goalCalculator(customerId, mongoGoals, from, to);
        });
    }

    private static calculateGoalPerformance(customerId:string, goalIds:Array<string>, mongoGoals:MongoGoal[], from:Date, to:Date){
        let indicators:Array<IndicatorApiResult>,
            goalIndicatorSpec:Array<MongoGoalIndicator> = [],
            self = this;
            
        return Promise.all([
                IndicatorService.getIndicatorsPerformance(customerId, goalIds, from, to),
                IndicatorService.getGoalIndicators(customerId, goalIds)
            ]).then(function onIndicators(values:any){
                indicators = values[0] as Array<IndicatorApiResult>;
                goalIndicatorSpec = values[1] as Array<MongoGoalIndicator>;
                let goalsResponse:Array<GoalApiResult> = [];

                // calculate goal performance
                for(var i = 0; i< mongoGoals.length; i++){

                    // take the factors from here
                    var indicatorSpecs = _.filter(goalIndicatorSpec, _.matches({ goalId: mongoGoals[i]._id.toString() }));
        
                    // take the indicators with performance from here
                    var indicatorsWithPerformance = _.filter(indicators, function filterByGoal(ind){
                        return _.includes(ind.goalIds, mongoGoals[i]._id.toString())
                    });
            
                    let performance:GoalPerformanceBase = self.calculateGoalPerformanceProgress(mongoGoals[i], indicatorsWithPerformance, indicatorSpecs, from, to);                    
                    
                    GoalDataService.insertGoalPerformance(performance);
                    
                    goalsResponse.push(                     
                        _.extend(mongoGoals[i], { 
                            performance: performance,
                            indicators: []
                        }) as GoalApiResult
                    );   
                }
                return goalsResponse;
            });
    }
    private static calculateGoalPerformanceProgress(goal:MongoGoal, indicators:Array<IndicatorApiResult>, indicatorFactors:Array<MongoGoalIndicator>, from, to):GoalPerformanceBase{
        let howManyMonths:number = moment.duration(moment(to).diff(moment(from))).asMonths();

        let unitPercentage:number = 1 / _.sumBy(indicatorFactors, 'factor');
        let indicatorsHelper:any[] = []; 
        let result:GoalPerformanceBase = {
            goalId: goal._id.toString(),
            from: from,
            to:  to,
            progressPerformance: [],
            // if there is no data the default is "red" and "0%" 
            periodPerformance: {
                semaphoreStatus: SemaphoreStatus.red,
                value: 0,
                date: to
            }
        };

        for(var i=0; i < indicators.length; i++){
            var goalIndicator = indicatorFactors.find( (goalInd: MongoGoalIndicator, index: number) =>{ return goalInd.indicatorId == indicators[i]._id }  );
            indicatorsHelper.push({
                index:i,
                indicator: indicators[i],
                factor: goalIndicator.factor
            });
        }

        for(var j=0; j < howManyMonths; j++){
            
            let endOfMonth = moment(from).add(j, 'months').endOf('month').toDate();
            let progress:IPerformance = this.getAccumulatedMonthPerformance(goal, endOfMonth, unitPercentage, indicatorsHelper);

            result.progressPerformance.push(progress);
        }

        result.periodPerformance = result.progressPerformance[result.progressPerformance.length -1];
        
        return result;
    }

    private static getAccumulatedMonthPerformance(goal:MongoGoal, to:Date, unitPercentage:number, indicatorsHelper:any):IPerformance{
        let result:IPerformance = {
            date: to,
            semaphoreStatus: SemaphoreStatus.red,
            value:0
        };

        for(var k=0; k < indicatorsHelper.length; k++){
            let indicatorPerformanceProgress:Array<IPerformance> = indicatorsHelper[k].indicator.performance.progressPerformance;
            let indicatorPerformance:IPerformance = _.find(indicatorPerformanceProgress, _.matchesProperty('date', to));

            if(indicatorPerformance){
                result.value += indicatorsHelper[k].factor * unitPercentage * indicatorPerformance.value;
            }
        }

        if(result.value <= goal.semaphore.yellowUntil){
            if(result.value <= goal.semaphore.redUntil){
                result.semaphoreStatus = SemaphoreStatus.red;
            }
            else{
                result.semaphoreStatus = SemaphoreStatus.yellow;
            }
        }

        if(result.value > 1){
            result.value = 1;
        }

        if(result.value < 0){
            result.value = 0;
        }

        if(result.value > goal.semaphore.redUntil){
            // yellow or green
            if(result.value > goal.semaphore.yellowUntil){
                result.semaphoreStatus = SemaphoreStatus.green;                
            }
            else{
                result.semaphoreStatus = SemaphoreStatus.yellow;
            }
        }
        else{
            result.semaphoreStatus = SemaphoreStatus.red;
        }

        return result;  
    }
    
}