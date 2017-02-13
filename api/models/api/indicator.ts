import { ISemaphoreConfig, 
    Operations,
    IDataDefinition,
    IDataSource,
    IPerformance,
    SemaphoreStatus
 } from './../shared';

export class IndicatorApiResult{
    
    constructor(
        public _id:string,
        public customerId:string,
        public goalIds: Array<string>,
        public title:string,
        public performance: IPerformance
    ){
        
    }
};