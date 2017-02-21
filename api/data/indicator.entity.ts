import * as mongoControl from 'mongo-control';
import * as utils from './../utils';
import { ObjectID } from 'mongodb';
import { Operations } from './../models/shared';

import { MongoIndicator } from './../models/mongo/indicator.mongo';
import { MongoIndicatorData} from './../models/mongo/indicator-data';
import { MongoGoalIndicator } from './../models/mongo/goal-indicator';

export class IndicatorDataService{
    constructor(){}

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


    /**
     * 
     * 
     * @param {any} customerId
     * @param {any} goalsId
     * @returns
     */
    static getIndicators(customerId:string, goalIds:Array<string>):Promise<Array<MongoIndicator>>{
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


    static insertIndicator(indicator:MongoIndicator):Promise<any>{

        let params:any = {
            db: utils.getConnString(),
            collection: 'indicators',
            data: [indicator]
        };

        return mongoControl.insert(params);
    }

    static insertIndicatorData(indicatorDataArray:Array<MongoIndicatorData>):Promise<any>{

        let params:any = {
            db: utils.getConnString(),
            collection: 'indicators-data',
            data: indicatorDataArray
        };

        return mongoControl.insert(params);
    }

    static insertGoalIndicator(goalIndicatorArray:Array<MongoGoalIndicator>):Promise<any>{

        let params:any = {
            db: utils.getConnString(),
            collection: 'goal-indicators',
            data: goalIndicatorArray
        };

        return mongoControl.insert(params);
    }
}