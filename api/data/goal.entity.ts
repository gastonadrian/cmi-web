import * as mongoControl from 'mongo-control';
import * as utils from './../utils';
import { ObjectID } from 'mongodb';

import { MongoGoal } from './../models/mongo/goal.mongo';

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
}