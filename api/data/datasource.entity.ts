import * as mongoControl from 'mongo-control';
import * as utils from './../utils';
import { ObjectID } from 'mongodb';

import { DatasourceType, MongoDatasource } from './../models/mongo/datasource';

export class DatasourceDataService{

    constructor(){}
    static get(customerId:string):Promise<Array<MongoDatasource>>{

        let findParams:any = {
            db: utils.getConnString(),
            collection: 'datasources',
            query: {
                customerId:customerId
            }
        };
        
        return mongoControl.find(findParams);
    }

    static insertDatasource(datasource:MongoDatasource):Promise<any>{
        let params:any = {
            db: utils.getConnString(),
            collection: 'datasources',
            data: [datasource]
        };
        return mongoControl.insert(params)
            .then(function(response:any){
                return {
                    id: response.insertedIds.pop().toString()
                };
            });
    }

    static createPerspectives(customerId:string):void{
        
    }

}