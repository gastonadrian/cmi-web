import * as mongoControl from 'mongo-control';
import * as utils from './../utils';

import { MongoPerspective } from './../models/mongo/perspective.mongo';
import { ObjectID } from 'mongodb';
import { PerspectiveApiResult } from "../models/api/perspective";

export class PerspectiveDataService{

    static getPerspectives(customerId:string):Promise<Array<PerspectiveApiResult>>{
        console.time('3.1:getPerspectives');
        let findParams:any = {
            db: utils.getConnString(),
            collection: 'perspectives',
            pipeline: [
                {
                    $match:{
                        customerId: new ObjectID(customerId)
                    }
                },
                {
                    $lookup:{
                        from: "goals",
                        localField: "_id",
                        foreignField: "perspectiveId",
                        as: "goals"
                    }
                } 
            ]
        };
        
        return mongoControl.aggregate(findParams)
            .then(function onOk(response){
                console.timeEnd('3.1:getPerspectives');
                return response;
            });
    }

    static createBasePerspectives(customerId:string):Promise<any>{
        var financiera:MongoPerspective = {
            "customerId" : new ObjectID(customerId),
            "title" : "Perspectiva Financiera",
            "semaphore" : {
                "redUntil" : 0.3,
                "yellowUntil" : 0.59
            }
        } as MongoPerspective;
        let clientes:MongoPerspective =  {
            "customerId" : new ObjectID(customerId),
            "title" : "Perspectiva Clientes",
            "semaphore" : {
                "redUntil" : 0.3,
                "yellowUntil" : 0.59
            }
        } as MongoPerspective;
        var procesos:MongoPerspective = {
            "customerId" : new ObjectID(customerId),
            "title" : "Perspectiva de Procesos",
            "semaphore" : {
                "redUntil" : 0.3,
                "yellowUntil" : 0.59
            }
        } as MongoPerspective;
        var aprendizaje:MongoPerspective = {
            "customerId" : new ObjectID(customerId),
            "title" : "Perspectiva de Aprendizaje",
            "semaphore" : {
                "redUntil" : 0.3,
                "yellowUntil" : 0.59
            }
        } as MongoPerspective;

        return this.insertPerspectives([financiera,clientes,procesos,aprendizaje]);
    }

    static insertPerspectives(perspectives:Array<MongoPerspective>):Promise<any>{
        let params:any = {
            db: utils.getConnString(),
            collection: 'perspectives'
        };
    
        for(var i =0; i < perspectives.length; i++){
            perspectives[i].customerId = new ObjectID(perspectives[i].customerId.toString());
        }

        params.data = perspectives;

        return mongoControl.insert(params);
    }

    static update(perspective:MongoPerspective):Promise<any>{
        let params:any = {
            db: utils.getConnString(),
            collection: 'perspectives',
            id:perspective._id
        };

        delete perspective._id;
        perspective.customerId = new ObjectID(perspective.customerId.toString());
        perspective.goals = [];
        
        params.update = perspective;

        return mongoControl.updateById(params);
    }
}