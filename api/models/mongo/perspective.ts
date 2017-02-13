import { ISemaphoreConfig } from './../shared';
export class Perspective{

    constructor(
    public _id:string,
    public customerId:string,
    public title:string,
    public semaphore:ISemaphoreConfig){}
}