import { IPerformance } from './../shared';
import { BaseIndicator } from './../indicator.base';
import { IndicatorPerformanceBase } from './../indicator-performance.base';

export class IndicatorApiResult extends BaseIndicator{
    public columnOperationTitle?:string;
    public performance?: IndicatorPerformanceBase;
    public lastDateSynced?:Date;
};