export class MongoGoalIndicator{
    constructor(
        public indicatorId:string,
        public customerId:string,
        public goalId:string,
        public factor:number
    ){}

}