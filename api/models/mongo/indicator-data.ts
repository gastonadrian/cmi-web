export class MongoIndicatorData{
    constructor(
    public indicatorId:string,
    public customerId:string,
    public date:Date,
    public value?:number,
    public expected?:number){

    }
}