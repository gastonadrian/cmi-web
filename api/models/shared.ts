export interface IPerformance {
    semaphoreStatus:SemaphoreStatus;
    value:number;
};

export interface ISemaphoreConfig{
    redUntil:number;
    yellowUntil:number;
};

export enum Operations{
    average = 1,
    plus
};

export enum SemaphoreStatus {
    green = 1,
    yellow,
    red   
};

export interface IDataDefinition{
    type:string;
    operation:Operations;
    title: string;
};

export interface IDataSource{
    _id: string,
    table:string,
    column: string,
    dateColumn: string,
    rowOperation?: string
}