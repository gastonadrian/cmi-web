import { ISemaphoreConfig } from './shared';
import { GoalApiResult } from "./api/goal";
export class PerspectiveBase{
    public _id:string;
    public customerId:any;
    public title:string;

    public goals?:Array<GoalApiResult>;
    public semaphore:ISemaphoreConfig = {
        redUntil:0,
        yellowUntil:0
    };
};