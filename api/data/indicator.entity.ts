import * as mongoControl from 'mongo-control';
import * as utils from './../utils';
import { ObjectID } from 'mongodb';
import { Operations } from './../models/shared';

import { MongoIndicator } from './../models/mongo/indicator.mongo';
import { MongoIndicatorData} from './../models/mongo/indicator-data';
import { MongoGoalIndicator } from './../models/mongo/goal-indicator.mongo';
import { GoalIndicatorApiResult } from './../models/api/goal-indicator';

export class IndicatorDataService{
    constructor(){}

    /**
     * 
     * 
     * @param {any} customerId
     * @param {any} goalsId
     * @returns
     */
    static getAllByGoalIds(customerId:string, goalIds:Array<string>):Promise<Array<MongoIndicator>>{
        let findParams:any = {
            db: utils.getConnString(),
            collection: 'indicators',
            query: {
                customerId:customerId,
                goalIds:{
                    "$in": goalIds
                }
            }
        };
        
        return mongoControl.find(findParams).then(function onIndicatorsResponse(collection){
            return collection as Array<MongoIndicator>;
        });
    }

    static getAllByCustomerId(customerId:string): Promise<Array<MongoIndicator>>{
        let findParams:any = {
            db: utils.getConnString(),
            collection: 'indicators',
            query: {
                customerId:customerId
            }
        };

        return mongoControl.find(findParams);
    }

    /**
     * 
     * 
     * @param {any} customerId
     * @param {any} indicatorId
     * @returns
     */
    static get(customerId:string, indicatorId:string):Promise<MongoIndicator>{
        let findParams:any = {
            db: utils.getConnString(),
            collection: 'indicators',
            id: indicatorId
        };
        
        return mongoControl.getById(findParams);
    }

    static insertIndicator(indicator:MongoIndicator):Promise<any>{

        let params:any = {
            db: utils.getConnString(),
            collection: 'indicators',
            data: [indicator]
        };

        return mongoControl.insert(params)
            .then(function(response:any){
                return {
                    id: response.insertedIds.pop().toString()
                };
            });
    }

    static updateIndicator(indicator:MongoIndicator):Promise<any>{

        let params:any = {
            db: utils.getConnString(),
            collection: 'indicators',
            query: {
                _id: new ObjectID(indicator._id) 
            }
        };

        delete indicator._id;
        params.update = indicator;

        return mongoControl.update(params)
            .then(function(response:any){
                return response.result;
            });
    }

    static getGoalIndicators(customerId:string, goalIds:Array<string>):Promise<Array<MongoGoalIndicator>>{

        let findParams:any = {
            db: utils.getConnString(),
            collection: 'goal-indicators',
            query: {
                customerId:customerId,
                goalId:{
                    "$in": goalIds
                }
            }
        };

        return mongoControl.find(findParams).then(function onIndicatorsResponse(collection){
            return collection as Array<MongoGoalIndicator>;
        });
    }

    static insertGoalIndicator(customerId:string, goalIndicator:GoalIndicatorApiResult):Promise<any>{
        let self = this;
        return this.getGoalIndicators(customerId, [goalIndicator.goalId])
        .then(function onGetGoalIndicators(goalIndicators:Array<MongoGoalIndicator>){

            if(goalIndicators.length){
                // update 
                return self.updateGoalIndicator(customerId, goalIndicator);
            }

            let params:any = {
                db: utils.getConnString(),
                collection: 'goal-indicators',
                data: [goalIndicator]
            };
        
            return mongoControl.insert(params)
                .then(function(response){
                    return {
                        ok: !!response.insertedIds.length
                    }
                });
        });
    }

    static removeGoalIndicator(customerId:string, goalId:string, indicatorId:string):Promise<any>{
        // delete goal-indicator relations
        let goalIndicatorParams:any = {
            db: utils.getConnString(),
            collection: 'goal-indicators',
            query: {
                goalId:goalId,
                indicatorId:indicatorId,
                customerId:customerId
            }
        };

        return mongoControl.remove(goalIndicatorParams)
            .then(function(response:any){
                return response.result;
            });
    }

    static updateGoalIndicator(customerId:string, goalIndicator: GoalIndicatorApiResult):Promise<any>{
        let params:any = {
            db: utils.getConnString(),
            collection: 'goal-indicators',
            query: {
                customerId: customerId,
                goalId: goalIndicator.goalId,
                indicatorId: goalIndicator.indicatorId 
            },
            update: goalIndicator
        };

        return mongoControl.update(params)
            .then(function(response:any){
                return response.result;
            });        
    }

    /**
     * 
     * 
     * @param {any} customerId
     * @param {any} indicatorIds
     * @param {any} from
     * @param {any} to
     * @returns
     */
    static getIndicatorsData(customerId:string, indicatorIds:Array<string>, from:Date, to:Date):Promise<Array<MongoIndicatorData>>{
        let findParams:any = {
            db: utils.getConnString(),
            collection: 'indicators-data',
            query: {
                customerId:customerId,
                indicatorId: {
                    "$in":indicatorIds
                },
                date:{
                    "$gte": from,
                    "$lte": to
                }
            }
        };
        
        return mongoControl.find(findParams);
    }



    static insertIndicatorData(indicatorDataArray:Array<MongoIndicatorData>):Promise<any>{

        let params:any = {
            db: utils.getConnString(),
            collection: 'indicators-data',
            data: indicatorDataArray
        };

        return mongoControl.insert(params);
    }

    static updateIndicatorData(customerId:string, indicatorId:string, expected:number):Promise<any>{
        let params:any = {
            db: utils.getConnString(),
            collection: 'indicators-data',
            query: {
                customerId: customerId,
                indicatorId: indicatorId 
            },
            update: {
                expected: expected
            }
        };

        return mongoControl.update(params)
            .then(function(response:any){
                return response.result;
            });        
    }

}