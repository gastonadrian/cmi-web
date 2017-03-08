import { IPerformance } from './shared';
export class IndicatorPerformanceBase{
    public _id?:string;
    public indicatorId:string;
    public from:Date;
    public to:Date;
    public periodPerformance:IPerformance; 

    public unitValue:number;
    public progressPerformance: Array<IPerformance>;
}