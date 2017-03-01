import { IPerformance } from './../shared';
import { BaseIndicator } from './../indicator.base';

export class IndicatorApiResult extends BaseIndicator{
    public columnOperationTitle?:string;
    public performance?: IPerformance;    
};