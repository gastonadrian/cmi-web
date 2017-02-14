import * as mongoControl from 'mongo-control';
import * as utils from './../utils';

import { MongoPerspective } from './../models/mongo/perspective';

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
        // let perspectives:Array<MongoPerspective> = [
        //     new MongoPerspective(
        //         customerId,
        //         'Perspectiva Financiera',
        //         {
        //            redUntil:30,
        //            yellowUntil:59
        //         }),
        //     new MongoPerspective(
        //         customerId,
        //         'Perspectiva Clientes',
        //         {
        //            redUntil:30,
        //            yellowUntil:59
        //         }),
        //     new MongoPerspective(
        //         customerId,
        //         'Perspectiva de Aprendizaje',
        //         {
        //            redUntil:30,
        //            yellowUntil:59
        //         }),
        //     new MongoPerspective(
        //         customerId,
        //         'Perspectiva de Procesos',
        //         {
        //            redUntil:30,
        //            yellowUntil:59
        //         })
        //     ];

    }

    static insertPerspectives(perspectives:Array<MongoPerspective>):Promise<any>{
        let params:any = {
            db: utils.getConnString(),
            collection: 'perspectives',
            data: perspectives
        };
        return mongoControl.insert(params);
    }
}