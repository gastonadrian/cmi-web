import * as mongoControl from 'mongo-control';
import * as utils from './../utils';
import { ObjectID } from 'mongodb';
import { Operations } from './../models/shared';

import { MongoIndicator } from './../models/mongo/indicator.mongo';
import { MongoIndicatorData} from './../models/mongo/indicator-data';
import { MongoGoalIndicator } from './../models/mongo/goal-indicator.mongo';
import { GoalIndicatorApiResult } from './../models/api/goal-indicator';
import { IIndicatorSync } from './../models/indicator-sync.interface';
import { IndicatorPerformanceBase } from "../models/indicator-performance.base";

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

    static getIndicatorsLastSync(indicatorIds:Array<string>):Promise<Array<IIndicatorSync>>{

        if(!indicatorIds.length){
            return new Promise(function (resolve, reject){
                resolve([]);
            });
        }

        let aggregateParams:any = {
            db: utils.getConnString(),
            collection: 'indicators-data',
            pipeline: [
                { 
                    '$match': { 
                        'indicatorId': {
                            '$in': indicatorIds
                        }
                    }
                },
                {
                    '$group':{
                        '_id': '$indicatorId',
                        'date': { '$max': '$date' }
                    }
                }
            ]
        };
            
        return mongoControl.aggregate(aggregateParams);
    }
    static getAllByCustomerId(customerId:string, active?:Boolean): Promise<Array<MongoIndicator>>{
        let findParams:any = {
            db: utils.getConnString(),
            collection: 'indicators',
            query: {
                customerId:customerId
            }
        };


        if(active === false || active === true){
            findParams.query.active = active;
        }

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

        // is active as long as it has a datasource id assigned
        indicator.active = !!indicator.datasource._id;


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
    static getIndicatorsDataBetween(customerId:string, indicatorIds:Array<string>, from?:Date, to?:Date):Promise<Array<MongoIndicatorData>>{
        let findParams:any = {
            db: utils.getConnString(),
            collection: 'indicators-data',
            query: {
                customerId:customerId,
                indicatorId: {
                    "$in":indicatorIds
                }
            },
            sortBy:{
                "date": 1
            }
        };

        if(from && to){
            findParams.query.date = {
                "$gte": from,
                "$lte": to
            };
        }
        
        return mongoControl.find(findParams);
    }

    static getIndicatorDataDates(customerId:string, indicatorId:string, dates:Array<Date>):Promise<Array<MongoIndicatorData>>{
        let findParams:any = {
            db: utils.getConnString(),
            collection: 'indicators-data',
            query: {
                customerId:customerId,
                indicatorId: indicatorId,
                date: {
                    "$in":dates
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

    static updateIndicatorData(customerId:string, indicatorId:string, date:Date, expected:number):Promise<any>{
        let params:any = {
            db: utils.getConnString(),
            collection: 'indicators-data',
            query: {
                customerId: customerId,
                indicatorId: indicatorId,
                date: date
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

    static updateIndicatorDataValue(customerId:string, indicatorData:MongoIndicatorData):Promise<any>{
        let params:any = {
            db: utils.getConnString(),
            collection: 'indicators-data',
            id: indicatorData._id,
            update: {
                value: indicatorData.value
            }
        };

        return mongoControl.updateById(params)
            .then(function(response:any){
                return response.result;
            });        
    }

    static insertPerformance(indicatorPerformance:IndicatorPerformanceBase):Promise<any>{
        let params:any = {
            db: utils.getConnString(),
            collection: 'indicator-performance',
            data: [indicatorPerformance]
        };
        return mongoControl.insert(params)
            .then(function(response:any){
                return {
                    id: response.insertedIds.pop().toString()
                };
            });        
    }

    static getPerformance(indicatorIds:Array<string>, from?:Date, to?:Date):Promise<Array<IndicatorPerformanceBase>>{
        let findParams:any = {
            db: utils.getConnString(),
            collection: 'indicator-performance',
            query: {
                indicatorId: {
                    "$in":indicatorIds
                }
            },
            sortBy:{
                "to": -1
            }
        };

        if(from && to){
            findParams.query.from = from;
            findParams.query.to = to;
        }
        
        return mongoControl.find(findParams);
    }
    
    static removeCachedPerformance(indicatorId:string, from?:Date, to?:Date):Promise<any>{
        // delete goal-indicator relations
        let goalIndicatorParams:any = {
            db: utils.getConnString(),
            collection: 'indicator-performance',
            query: {
                indicatorId:indicatorId.toString()
            }
        };

        if(from && to){
            goalIndicatorParams.query["$or"] = [
                {
                    from: { '$gte': from },
                    to: { '$lte': to }                    
                },
                {
                    from: { '$gte': from }
                },
                {
                    to: { '$lte': to }
                }
            ]
        }

        return mongoControl.remove(goalIndicatorParams)
            .then(function(response:any){
                return response.result;
            });        
    }
    

}