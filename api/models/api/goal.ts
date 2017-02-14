import { ISemaphoreConfig, 
    Operations,
    IDataDefinition,
    IDataSource,
    IPerformance,
    SemaphoreStatus
 } from './../shared';


export class GoalApiResult{
    
    constructor(
        public _id:string,
        public customerId:string,
        public title:string,
        public perspectiveId:string,
        public performance: IPerformance
    ){
        
    }
};