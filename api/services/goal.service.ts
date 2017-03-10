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

        GoalDataService.removePerformance(goal._id);
        return GoalDataService.update(goal);
    }

    static removeCachedPerformance(goalId:string, from?:Date, to?:Date){
        return GoalDataService.removePerformance(goalId, from, to);
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
            IndicatorService.getComposedIndicatorsByGoalId(customerId, [goalId], from, to)
        ])
        .then(function onGet(values:Array<any>){
            let mongoGoals:Array<GoalApiResult> = values[0];
            let indicators:Array<MongoIndicator> = values[1];
            let indicatorsWithPerformance:Array<IndicatorApiResult> = IndicatorService.getIndicatorsPerformance(indicators, from, to);

            return self.goalCalculator(customerId, mongoGoals, from, to)
                .then(function onGoal(goals:GoalApiResult[]){
                    goals[0].indicators = indicatorsWithPerformance;
                    return goals[0];
                });
        });
    }

    private static goalCalculator(customerId:string, mongoGoals:Array<GoalApiResult>, from:Date, to:Date):Promise<GoalApiResult[]>{
        console.time('5:goalCalculatorCached');
        console.time('5:goalCalculatorNOCached');
        let goalIds:Array<any> = [],
            result:Array<GoalApiResult> = [],
            self = this;

        // get the performance of all indicators inside the goals
        goalIds = mongoGoals.map(function goalIdMap(goal:MongoGoal){
            return goal._id;
        });

        return GoalDataService.getGoalPerformance(goalIds, from, to)
        .then(function(cachedPerformance:Array<GoalPerformanceBase>){
            
            // we reset the goalids, because we want to ask later for those goals
            // that are not cached
            goalIds = [];

            for(var i = 0; i< mongoGoals.length; i++){
                let performanceProgress:GoalPerformanceBase = _.find(cachedPerformance, _.matchesProperty('goalId', mongoGoals[i]._id));
                
                if(performanceProgress){
                    result.push(                     
                        _.extend(mongoGoals[i], { 
                            performance: performanceProgress,
                            indicators: []
                        }) as GoalApiResult
                    );   
                }
                else{
                    goalIds.push(mongoGoals[i]._id);
                }
            }

            if(!goalIds.length){
                console.timeEnd('5:goalCalculatorCached');
                return result;
            }

            return self.calculateGoalPerformance(customerId, goalIds, _.filter(mongoGoals, ( value:MongoGoal ) => {  return _.includes(goalIds, value._id);  } ), from, to)
            .then(function goalApiResult(response:Array<GoalApiResult>){
                console.timeEnd('5:goalCalculatorNOCached');
                return result.concat(response);
            });
        });       
    }

    static getGoalsPerformance(goals:Array<GoalApiResult>, withIndicators:Boolean, from:Date, to:Date):Promise<Array<GoalApiResult>>{
        console.time('3:getGoalsPerformance');
        if(!goals.length){
            return new Promise(function (resolve, reject){
                resolve(goals);
                return goals;
            });
        }
        return this.goalCalculator(goals[0].customerId.toString(), goals, from, to)
            .then(function(response:any){
                console.timeEnd('3:getGoalsPerformance');
                return response;
            });
    }

    private static calculateGoalPerformance(customerId:string, goalIds:Array<any>, mongoGoals:MongoGoal[], from:Date, to:Date):Promise<GoalApiResult[]>{
        console.time('7:calculateGoalPerformance');
        let indicators:Array<IndicatorApiResult>,
            goalIndicatorRelations:Array<MongoGoalIndicator> = [],
            indicatorsWithPerformance:Array<IndicatorApiResult> = [],
            self = this;
            
        return IndicatorService.getComposedIndicatorsByGoalId(customerId, goalIds, from, to)
            .then(function onComposedIndicators(indicators:Array<MongoIndicator>){

                indicatorsWithPerformance = IndicatorService.getIndicatorsPerformance(indicators, from, to);
                    
                goalIndicatorRelations = _.flatMap(indicators, (i:MongoIndicator) => { return i.goalIndicators; });
                let goalsResponse:Array<GoalApiResult> = [];

                console.log('indicators with performance',':  ' +  indicatorsWithPerformance.map( (gi:any) => { return gi._id.toString() }));


                // calculate goal performance
                for(var i = 0; i< mongoGoals.length; i++){

                    // take the factors from here
                    var goalIndicatorsSpec = _.filter(goalIndicatorRelations, _.matches({ goalId: mongoGoals[i]._id.toString() }));
        
                    console.log(mongoGoals[i].title,':  '  + goalIndicatorsSpec.map( (gi:any) => { return gi.indicatorId.toString() }));

                    // take the indicators with performance from here
                    var goalIndicators = _.filter(indicatorsWithPerformance, function filterByGoal(ind){
                        return !!_.find(ind.goalIds, mongoGoals[i]._id)
                    });
                    
                    let performance:GoalPerformanceBase = self.calculateGoalPerformanceProgress(mongoGoals[i], goalIndicators, goalIndicatorsSpec, from, to);                    
                                        
                    GoalDataService.insertGoalPerformance(performance);
                    
                    goalsResponse.push(                     
                        _.extend(mongoGoals[i], { 
                            performance: performance,
                            indicators: []
                        }) as GoalApiResult
                    );   
                }

                console.timeEnd('7:calculateGoalPerformance');
                return goalsResponse;
           
            });
    }
    private static calculateGoalPerformanceProgress(goal:MongoGoal, indicators:Array<IndicatorApiResult>, indicatorFactors:Array<MongoGoalIndicator>, from, to):GoalPerformanceBase{
        let unitPercentage:number = 1 / _.sumBy(indicatorFactors, 'factor');
        let indicatorsHelper:any[] = []; 
        let result:GoalPerformanceBase = {
            goalId: goal._id,
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

        if(!indicators.length){
            return result;
        }

        for(var i=0; i < indicators.length; i++){
            var goalIndicator = indicatorFactors.find( 
                (goalInd: MongoGoalIndicator, index: number) =>{ 
                    return goalInd.indicatorId.toString() == indicators[i]._id.toString() 
                }  );
            if(!goalIndicator){
                continue;
            }
            indicatorsHelper.push({
                index:i,
                indicator: indicators[i],
                factor: goalIndicator.factor
            });
        }

        let monthStart:Date = from;
        let monthEnd:Date = moment(from).endOf('month').toDate();
        
        while( moment(monthEnd).isBefore(to) ){
            let progress:IPerformance = this.getAccumulatedMonthPerformance(goal, monthEnd, unitPercentage, indicatorsHelper);
            result.progressPerformance.push(progress);
            monthStart = moment(monthStart).add(1, 'month').startOf('month').toDate();
            monthEnd = moment(monthStart).endOf('month').toDate();
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
            } else if(indicatorPerformanceProgress.length){
                indicatorPerformance = indicatorPerformanceProgress[indicatorPerformanceProgress.length -1];
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