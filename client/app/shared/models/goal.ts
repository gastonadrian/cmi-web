import { Indicator } from './indicator';
import { DateValue, Performance } from './shared';

export class Goal{
    public id:number;
    public title:string;
    public indicators:Array<GoalIndicator>;
    public performance:Performance;
    public values:Array<DateValue>;

    constructor(){}
}

export class GoalIndicator{
    public goalId:number;
    public indicator:Indicator;
    public factor:number;
    public performance:Performance;

    constructor(){}
}
