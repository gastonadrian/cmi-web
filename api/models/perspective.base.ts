import { ISemaphoreConfig } from './shared';
export class PerspectiveBase{
    public _id:string;
    public customerId:string;
    public title:string;
    public semaphore:ISemaphoreConfig = {
        redUntil:0,
        yellowUntil:0
    };
};