import{    
    IDataDefinition,
    IDataSource,
    ISemaphoreConfig,
    PerformanceComparisons
} from './shared';

export class BaseIndicator{
    public _id:string;
    public customerId:string;
    public goalIds: Array<string> = [];
    public title:string;
    public performanceComparison:PerformanceComparisons;
    public semaphore:ISemaphoreConfig;
    public  data:IDataDefinition;
    public datasource: IDataSource;
    public active:Boolean;
};