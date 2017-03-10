import { IPerformance } from './shared';
export class GoalPerformanceBase{
    public _id?:string;
    public goalId:string;
    public from:Date;
    public to:Date;
    public periodPerformance:IPerformance; 
    public progressPerformance: Array<IPerformance>;
}