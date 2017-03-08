export interface IPerformance {
    semaphoreStatus:SemaphoreStatus;
    value:number;
    date:Date;
};


export interface ISemaphoreConfig{
    redUntil:number;
    yellowUntil:number;
};

export enum Operations{
    average = 1,
    plus=2,
    count=3,
    countdistinct=4,
    query=5
};

export enum SemaphoreStatus {
    green = 1,
    yellow=2,
    red=3
};

export interface IDataDefinition{
    title:string;
    type:SystemDataTypes;
}

export interface IDataSource{
    _id: string,
    table:string,
    valueColumn: string,
    dateColumn: string,
    columnOperation?:Operations;
    rowOperation?: string,

    monthlyExpected:number
}

export enum UserDataTypes{
    number=1,
    currency=2,
    percentage=3,
    days=4,
    hours=5,
    minutes=6,
    seconds=7
}

export enum SystemDataTypes{
    number=1,
    date=2   
}

export enum PerformanceComparisons{
    lessThan=1,
    equals=2
}

export class BackendAppSettings{
    
    static dataTypes:Array<IDataDefinition> = [
        {
            title:'unidades',
            type:SystemDataTypes.number
        },
        {
            title:'$',
            type:SystemDataTypes.number
        },
        {
            title:'%',
            type:SystemDataTypes.number
        },
        {
            title:'dias',
            type:SystemDataTypes.date
        },
        {
            title:'horas',
            type:SystemDataTypes.date
        },
        {
            title:'minutos',
            type:SystemDataTypes.date
        },
        {
            title:'segundos',
            type:SystemDataTypes.date
        }                                
    ];

    static columnOperations: Array<IColumnOperationOption> = [ 
        {
            title:'sumar',
            id: Operations.plus
        },
        {
            title:'promediar',
            id: Operations.average
        },
        {
            title:'contar',
            id: Operations.count
        },
        {
            title:'contar valores distintos',
            id: Operations.countdistinct
        },
        {
            title:'consulta(query) personalizada [avanzado]',
            id: Operations.query
        }
    ];


    static getDataDefinition(dataType:UserDataTypes){
        let index:number = (dataType as number) - 1;
        return this.dataTypes[index];
    }
}

// only used for static analysis
export interface IColumnOperationOption{
    id: Operations,
    title:string
}