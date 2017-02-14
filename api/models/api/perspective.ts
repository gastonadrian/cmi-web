import { IPerformance } from './../shared';
import { GoalApiResult } from './goal';

export class PerspectiveApiResult{
    
    constructor(
        public _id:string,
        public customerId:string,
        public title:string,
        public goals:Array<GoalApiResult>,
        public performance?: IPerformance
    ){
        
    }
};