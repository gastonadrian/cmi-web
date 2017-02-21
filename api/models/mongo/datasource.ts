import { ObjectID } from 'mongodb';

export class MongoDatasource{
    public _id:ObjectID;;

    constructor(
    public customerId:string,
    public type:string,
    public title:string,
    public tables:Array<string>,
    public database?: IDatabaseDatasource,
    public file?:IFileDatasource,
    ){

    }
};

export enum DatasourceType{
    database=1,
    file
};

export interface IDatabaseDatasource{
    engine:string,
    host: string,
    port: Number,
    database: string,
    user:string,
    password?:string
};

export interface IFileDatasource{
    filePath:string,
    extension:string
};