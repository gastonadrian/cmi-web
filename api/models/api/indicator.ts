import { IPerformance } from './../shared';
import { BaseIndicator } from './../indicator.base';

export class IndicatorApiResult extends BaseIndicator{
    public id:string;
    public performance?: IPerformance;    
};