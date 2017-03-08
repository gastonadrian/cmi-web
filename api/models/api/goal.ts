import { IPerformance } from './../shared';
import { GoalBase } from  './../goal.base';
import { IndicatorApiResult } from './indicator';
import { GoalPerformanceBase } from './../goal-performance.base';

export class GoalApiResult extends GoalBase{
    
    public indicators:Array<IndicatorApiResult>;
    public values?:Array<any>;
    public performance?: GoalPerformanceBase;

};