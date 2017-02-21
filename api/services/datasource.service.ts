import * as _ from 'lodash';
import * as moment from 'moment';

import { DatasourceDataService  } from './../data/datasource.entity';
import { MongoDatasource, IDatabaseDatasource, IFileDatasource, DatasourceType } from './../models/mongo/datasource';

export class DatasourceService {
    
    constructor(){
    }

    static createDatasource(customerId:string, datasource: MongoDatasource):Promise<any>{
        if(!datasource.customerId){
            datasource.customerId = customerId;
        }

        return DatasourceDataService.insertDatasource(datasource);
    }
}