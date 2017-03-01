import { ISemaphoreConfig } from './shared';

export class GoalBase{
    
    public _id:string;
    public title:string;
    public customerId:string;
    public perspectiveId:string;
    public semaphore:ISemaphoreConfig = {
        redUntil:0,
        yellowUntil:0
    };
    public active:Boolean;
};