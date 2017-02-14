import { ISemaphoreConfig } from './../shared';
import { ObjectID } from 'mongodb';

export class MongoGoal{
    
    public _id:ObjectID;

    public semaphore:ISemaphoreConfig;

    constructor(
        public customerId:string,
        public title:string,
        public perspectiveId:string,
        private semaphoreRedUntil:number,
        private semaphoreYellowuntil:number,
        public active?:Boolean
    ){
        this.semaphore = {
            redUntil: semaphoreRedUntil,
            yellowUntil: semaphoreYellowuntil
        }
    }
};