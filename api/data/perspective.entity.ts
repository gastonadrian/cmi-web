import * as mongoControl from 'mongo-control';
import * as utils from './../utils';

import { MongoPerspective } from './../models/mongo/perspective.mongo';

export class PerspectiveDataService{

    static getPerspectives(customerId:string):Promise<Array<MongoPerspective>>{

        let findParams:any = {
            db: utils.getConnString(),
            collection: 'perspectives',
            query: {
                customerId:customerId
            }
        };
        
        return mongoControl.find(findParams);
    }

    static createBasePerspectives(customerId:string):Promise<any>{
        var financiera:MongoPerspective = {
            "customerId" : customerId,
            "title" : "Perspectiva Financiera",
            "semaphore" : {
                "redUntil" : 30,
                "yellowUntil" : 59
            }
        } as MongoPerspective;
        let clientes:MongoPerspective =  {
            "customerId" : customerId,
            "title" : "Perspectiva Clientes",
            "semaphore" : {
                "redUntil" : 30,
                "yellowUntil" : 59
            }
        } as MongoPerspective;
        var procesos:MongoPerspective = {
            "customerId" : customerId,
            "title" : "Perspectiva de Procesos",
            "semaphore" : {
                "redUntil" : 30,
                "yellowUntil" : 59
            }
        } as MongoPerspective;
        var aprendizaje:MongoPerspective = {
            "customerId" : customerId,
            "title" : "Perspectiva de Aprendizaje",
            "semaphore" : {
                "redUntil" : 30,
                "yellowUntil" : 59
            }
        } as MongoPerspective;

        return this.insertPerspectives([financiera,clientes,procesos,aprendizaje]);
    }

    static insertPerspectives(perspectives:Array<MongoPerspective>):Promise<any>{
        let params:any = {
            db: utils.getConnString(),
            collection: 'perspectives',
            data: perspectives
        };
        return mongoControl.insert(params);
    }

    static update(perspective:MongoPerspective):Promise<any>{
        let params:any = {
            db: utils.getConnString(),
            collection: 'perspectives',
            id:perspective._id
        };

        delete perspective._id;
        params.update = perspective;

        return mongoControl.updateById(params);
    }
}