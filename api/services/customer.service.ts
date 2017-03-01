import * as _ from 'lodash';
import * as moment from 'moment';

// import { CustomerDataService  } from './../data/datasource.entity';
import { PerspectiveDataService } from './../data/perspective.entity';

export class CustomerService {
    
    constructor(){
    }

    static create(customerId:string):Promise<any>{
        return PerspectiveDataService.createBasePerspectives(customerId);
    }

    // static get(customerId:string):Promise<Array<MongoDatasource>>{
    //     return CustomerDataService.get(customerId);
    // }
}