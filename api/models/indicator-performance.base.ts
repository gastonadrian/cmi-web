import { IPerformance } from './shared';
export class IndicatorPerformanceBase{
    public _id?:string;
    public indicatorId:any;
    public from:Date;
    public to:Date;
    public periodPerformance:IPerformance; 

    public unitValue:number;
    public progressPerformance: Array<IPerformance>;
}