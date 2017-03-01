import { IPerformance } from './../shared';
import { GoalBase } from  './../goal.base';
import { IndicatorApiResult } from './indicator';
export class GoalApiResult extends GoalBase{
    
    public indicators:Array<IndicatorApiResult>;

    public performance?: IPerformance;

};