export class MongoIndicatorData{
    constructor(
    public indicatorId:string,
    public customerId:string,
    public value:number,
    public date:Date,
    public expected?:number){

    }
}