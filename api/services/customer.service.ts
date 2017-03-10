import * as _ from 'lodash';
import * as moment from 'moment';
import * as utils from './../utils';
import * as mongoControl from 'mongo-control';

import { PerspectiveDataService } from './../data/perspective.entity';

export class CustomerService {
    
    constructor(){
    }

    static create(customerId:string):Promise<any>{
        return PerspectiveDataService.createBasePerspectives(customerId);
    }

    static getAll(customer:string):Promise<any>{
        let findParams:any = {
            db: utils.getConnString(),
            collection: 'sys_user',
            query: {}
        };
        
        return mongoControl.find(findParams);
    }

    // static get(customerId:string):Promise<Array<MongoDatasource>>{
    //     return CustomerDataService.get(customerId);
    // }
}