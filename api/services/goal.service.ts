import * as _ from 'lodash';
import * as moment from 'moment';

import { IndicatorService } from './indicator.service';
import { GoalDataService } from './../data/goal.entity';

import { SemaphoreStatus, Operations, IPerformance } from './../models/shared';

import { MongoGoal } from './../models/mongo/goal';
import { MongoIndicator } from './../models/mongo/indicator.mongo';
import { MongoIndicatorData } from './../models/mongo/indicator-data';
import { MongoGoalIndicator } from './../models/mongo/goal-indicator';

import { IndicatorApiResult } from './../models/api/indicator';
import { GoalApiResult } from './../models/api/goal';

export class GoalService {
    
    constructor(){
    }

    static getGoalsPerformance(customerId:string, withIndicators:Boolean, from:Date, to:Date):Promise<Array<GoalApiResult>>{
        let self = this;

        return GoalDataService.getGoals(customerId, true)
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
                    result.push(new GoalApiResult(
                        mongoGoals[i]._id.toString(),
                        mongoGoals[i].customerId,
                        mongoGoals[i].title,
                        mongoGoals[i].perspectiveId,
                        performance
                    ));
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
            var goalIndicator = indicatorFactors.find( (goalInd: MongoGoalIndicator, index: number) =>{ return goalInd.indicatorId == indicators[i].id }  );
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