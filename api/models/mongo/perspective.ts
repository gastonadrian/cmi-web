import { ISemaphoreConfig } from './../shared';
import { ObjectID } from 'mongodb';

export class MongoPerspective{

    public _id:ObjectID;

    constructor(
    public customerId:string,
    public title:string,
    public semaphore:ISemaphoreConfig){}
}