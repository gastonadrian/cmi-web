import { ISemaphoreConfig, 
    Operations,
    IDataDefinition,
    IDataSource } from './../shared';
import { ObjectID } from 'mongodb';

export class MongoIndicator{
    
    public _id:ObjectID;

    public semaphore:ISemaphoreConfig;
    public data: IDataDefinition;
    public datasource: IDataSource;



    constructor(
        public customerId:string,
        public goalIds: Array<string>,
        public title:string,
        public performanceComparison:string, 
        private dataType:string,
        private dataOperation:Operations,
        private dataTitle:string,
        private semaphoreRedUntil:number,
        private semaphoreYellowuntil:number,
        private dataSourceId:string, 
        private datasourceTable:string,
        private dataSourceColumn:string,
        private dataSourceDateColumn:string,

        private dataSourceRowOperation?:string
    ){
        this.semaphore = {
            redUntil: semaphoreRedUntil,
            yellowUntil: semaphoreYellowuntil
        };

        this.data = {
            type: dataType,
            operation: dataOperation,
            title: dataTitle
        };

        this.datasource = {
            _id: dataSourceId,
            table: datasourceTable,
            column: dataSourceColumn,
            dateColumn: dataSourceDateColumn,
            rowOperation: dataSourceRowOperation
        };

    }
};

