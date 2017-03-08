import * as mongoControl from 'mongo-control';
import * as utils from './../utils';
import { ObjectID } from 'mongodb';

import { MongoGoal } from './../models/mongo/goal.mongo';
import { GoalPerformanceBase } from './../models/goal-performance.base';

export class GoalDataService{

    constructor(){}

    static get(goalId:string):Promise<MongoGoal>{
        let findParams:any = {
            db: utils.getConnString(),
            collection: 'goals',
            id: goalId
        };
        
        return mongoControl.getById(findParams);
    }

    static getByIds(customerId:string, goalIds:string[], active?:Boolean):Promise<MongoGoal[]>{
        let findParams:any = {
            db: utils.getConnString(),
            collection: 'goals',
        },
        mongoIds:ObjectID[] = [];

        if(!goalIds.length){
            return new Promise(function ok(resolve, reject){
                return reject('no hay datos');
            });
        }

        for(var i=0; i < goalIds.length; i++){
            mongoIds.push(new ObjectID(goalIds[i]));
        }

        findParams.query = {
            "_id": {
                "$in":mongoIds
            },
            "customerId": customerId
        };

        if(active === true || active === false){
            findParams.query.active = active;
        }
        
        return mongoControl.find(findParams);
    }    

    static getByCustomerId(customerId:string, active?:Boolean):Promise<Array<MongoGoal>>{

        let findParams:any = {
            db: utils.getConnString(),
            collection: 'goals',
            query: {
                customerId:customerId
            }
        };

        if(active === false || active === true){
            findParams.query.active = true;
        }
        
        return mongoControl.find(findParams);
    }
    static insertGoal(goal:MongoGoal):Promise<any>{
        let params:any = {
            db: utils.getConnString(),
            collection: 'goals',
            data: [goal]
        };
        return mongoControl.insert(params)
            .then(function(response:any){
                return {
                    id: response.insertedIds.pop().toString()
                };
            });        
    }
    static update(goal:MongoGoal):Promise<any>{
        let params:any = {
            db: utils.getConnString(),
            collection: 'goals',
            id:goal._id
        };

        delete goal._id;
        params.update = goal;

        return mongoControl.updateById(params);
    }

    static deleteGoal(customerId:string, goalId:string):Promise<any>{
        // delete goal-indicator relations
        let goalIndicatorParams:any = {
            db: utils.getConnString(),
            collection: 'goal-indicators',
            query: {
                goalId:goalId,
                customerId:customerId
            }
        };

        return mongoControl.remove(goalIndicatorParams)
            .then(function(response:any){
                // delete goal
                let params:any = {
                    db: utils.getConnString(),
                    collection: 'goals',
                    query: {
                        _id: new ObjectID(goalId),
                        customerId:customerId
                    }
                };
        
                return mongoControl.remove(params)
                    .then(function(response:any){
                        return response.result;
                    });    
            });
    }

    static insertGoalPerformance(goalPerformance:GoalPerformanceBase):Promise<any>{
        let params:any = {
            db: utils.getConnString(),
            collection: 'goal-performance',
            data: [goalPerformance]
        };
        return mongoControl.insert(params)
            .then(function(response:any){
                return {
                    id: response.insertedIds.pop().toString()
                };
            });        
    }

    static getGoalPerformance(goalIds:Array<string>, from?:Date, to?:Date):Promise<Array<GoalPerformanceBase>>{
        let findParams:any = {
            db: utils.getConnString(),
            collection: 'goal-performance',
            query: {
                goalId: {
                    "$in":goalIds
                }
            },
            sortBy:{
                "to": -1
            }
        };

        if(from && to){
            findParams.query.from = from;
            findParams.query.to = {
                "$gte": from,
                "$lte": to
            };
        }
        
        return mongoControl.find(findParams);
    }


    static removePerformance(goalId:string, from?:Date, to?:Date):Promise<any>{
        let removePerformanceParams:any = {
            db: utils.getConnString(),
            collection: 'goal-performance',
            query: {
                goalId:goalId
            }
        };

        if(from && to){
            removePerformanceParams.query["$or"] = [
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
            ];
        }

        return mongoControl.remove(removePerformanceParams)
            .then(function(response:any){
                return response.result;
            });        
    }


}