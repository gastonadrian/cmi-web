import { ISemaphoreConfig } from './../shared';

export class MongoGoal{

    public semaphore:ISemaphoreConfig;

    constructor(
        public _id:string,
        public customerId:string,
        public title:string,
        public perspectiveId:number,
        private semaphoreRedUntil:number,
        private semaphoreYellowuntil:number
    ){
        this.semaphore = {
            redUntil: semaphoreRedUntil,
            yellowUntil: semaphoreYellowuntil
        }
    }
};